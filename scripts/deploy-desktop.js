#!/usr/bin/env node

/**
 * Velanova Desktop App Deploy Script
 * 
 * Builds the desktop app and uploads artifacts to Cloudinary.
 * 
 * Usage:
 *   pnpm desktop:deploy              # Build current platform + upload
 *   pnpm desktop:deploy -- --mac     # Build macOS + upload
 *   pnpm desktop:deploy -- --win     # Build Windows + upload
 *   pnpm desktop:deploy -- --linux   # Build Linux + upload
 *   pnpm desktop:deploy -- --all     # Build all platforms + upload
 *   pnpm desktop:deploy -- --skip-build  # Upload existing artifacts only
 * 
 * Required env vars (in .env or apps/express-api/.env):
 *   CLOUDINARY_CLOUD_NAME
 *   CLOUDINARY_API_KEY
 *   CLOUDINARY_API_SECRET
 */

import { execSync } from 'child_process';
import { readFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join, basename, extname, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createHash } from 'crypto';
import https from 'https';
import http from 'http';

const ROOT_DIR = join(dirname(fileURLToPath(import.meta.url)), '..');
const APP_DIR = join(ROOT_DIR, 'apps', 'desktop-app');
const RELEASE_DIR = join(APP_DIR, 'release');

// ---------- Config ----------

function loadEnv() {
  const envPaths = [
    join(ROOT_DIR, '.env'),
    join(ROOT_DIR, 'apps', 'express-api', '.env'),
    join(ROOT_DIR, 'apps', 'landing-site', '.env.local'),
  ];
  const env = {};
  for (const p of envPaths) {
    if (existsSync(p)) {
      const lines = readFileSync(p, 'utf-8').split('\n');
      for (const line of lines) {
        const match = line.match(/^\s*([^#=]+?)\s*=\s*(.+?)\s*$/);
        if (match) env[match[1]] = match[2].replace(/^["']|["']$/g, '');
      }
    }
  }
  return { ...process.env, ...env };
}

function getDesktopVersion() {
  const pkg = JSON.parse(readFileSync(join(APP_DIR, 'package.json'), 'utf-8'));
  return pkg.version;
}

// ---------- Build ----------

function buildDesktop(platform) {
  console.log(`\n🔨 Building desktop app for: ${platform || 'current platform'}...\n`);
  const platformFlag = platform ? `--${platform}` : '';
  try {
    execSync(`bash scripts/build-desktop.sh ${platformFlag}`, {
      cwd: ROOT_DIR,
      stdio: 'inherit',
      env: { ...process.env, FORCE_COLOR: '1' },
    });
  } catch (err) {
    console.error('❌ Desktop build failed');
    process.exit(1);
  }
}

// ---------- Cloudinary Upload ----------

function cloudinaryUpload(filePath, publicId, resourceType, env) {
  return new Promise((resolve, reject) => {
    const cloudName = env.CLOUDINARY_CLOUD_NAME;
    const apiKey = env.CLOUDINARY_API_KEY;
    const apiSecret = env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      reject(new Error('Missing Cloudinary credentials. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET'));
      return;
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const paramsToSign = `folder=velanova/releases&public_id=${publicId}&resource_type=${resourceType}&timestamp=${timestamp}`;
    const signature = createHash('sha1').update(paramsToSign + apiSecret).digest('hex');

    const fileData = readFileSync(filePath);
    const boundary = '----VelanovaBoundary' + Date.now();

    const fields = {
      file: null, // handled separately
      public_id: publicId,
      folder: 'velanova/releases',
      resource_type: resourceType,
      timestamp: String(timestamp),
      api_key: apiKey,
      signature,
    };

    // Build multipart body
    let body = Buffer.alloc(0);
    for (const [key, val] of Object.entries(fields)) {
      if (key === 'file') continue;
      const part = `--${boundary}\r\nContent-Disposition: form-data; name="${key}"\r\n\r\n${val}\r\n`;
      body = Buffer.concat([body, Buffer.from(part)]);
    }
    // File part
    const fileHeader = `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="${basename(filePath)}"\r\nContent-Type: application/octet-stream\r\n\r\n`;
    const fileFooter = `\r\n--${boundary}--\r\n`;
    body = Buffer.concat([body, Buffer.from(fileHeader), fileData, Buffer.from(fileFooter)]);

    const options = {
      hostname: 'api.cloudinary.com',
      port: 443,
      path: `/v1_1/${cloudName}/${resourceType}/upload`,
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': body.length,
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.error) reject(new Error(json.error.message));
          else resolve(json);
        } catch (e) {
          reject(new Error(`Cloudinary response parse error: ${data.slice(0, 500)}`));
        }
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ---------- Collect Artifacts ----------

function collectArtifacts() {
  if (!existsSync(RELEASE_DIR)) {
    console.error(`❌ Release directory not found: ${RELEASE_DIR}`);
    console.error('   Run "pnpm desktop:build" first.');
    process.exit(1);
  }

  const validExtensions = ['.exe', '.msi', '.dmg', '.zip', '.AppImage', '.deb', '.rpm', '.tar.gz', '.blockmap'];
  const artifacts = [];

  function walk(dir) {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      const stat = statSync(full);
      if (stat.isDirectory()) {
        walk(full);
      } else if (stat.isFile()) {
        const ext = extname(entry).toLowerCase();
        const isValidExt = validExtensions.some(ve => entry.toLowerCase().endsWith(ve.toLowerCase()));
        // Also grab latest.yml / latest-mac.yml / latest-linux.yml for auto-updater
        const isYml = entry.endsWith('.yml') && entry.includes('latest');
        if (isValidExt || isYml) {
          artifacts.push({
            path: full,
            name: entry,
            size: stat.size,
            sizeMB: (stat.size / 1024 / 1024).toFixed(1),
          });
        }
      }
    }
  }

  walk(RELEASE_DIR);
  return artifacts;
}

// ---------- Create Manifest ----------

function createManifest(artifacts, version, uploadResults) {
  return {
    version,
    releaseDate: new Date().toISOString(),
    artifacts: artifacts.map((a, i) => ({
      filename: a.name,
      sizeMB: a.sizeMB,
      platform: detectPlatform(a.name),
      cloudinaryUrl: uploadResults[i]?.secure_url || null,
      cloudinaryPublicId: uploadResults[i]?.public_id || null,
      sha256: createHash('sha256').update(readFileSync(a.path)).digest('hex'),
    })),
  };
}

function detectPlatform(filename) {
  const lower = filename.toLowerCase();
  if (lower.endsWith('.exe') || lower.endsWith('.msi') || lower.includes('win')) return 'windows';
  if (lower.endsWith('.dmg') || lower.includes('mac') || lower.includes('darwin')) return 'macos';
  if (lower.endsWith('.appimage') || lower.endsWith('.deb') || lower.endsWith('.rpm') || lower.includes('linux')) return 'linux';
  if (lower.endsWith('.yml')) return 'meta';
  return 'unknown';
}

// ---------- Main ----------

async function main() {
  const args = process.argv.slice(2);
  const skipBuild = args.includes('--skip-build');
  const dryRun = args.includes('--dry-run');

  let platform = '';
  for (const arg of args) {
    if (['--mac', '--win', '--linux', '--all'].includes(arg)) {
      platform = arg.replace('--', '');
    }
  }

  const env = loadEnv();
  const version = getDesktopVersion();

  console.log('╔══════════════════════════════════════════════════╗');
  console.log('║       Velanova Desktop Deploy to Cloudinary      ║');
  console.log('╚══════════════════════════════════════════════════╝');
  console.log(`  Version: ${version}`);
  console.log(`  Platform: ${platform || 'current'}`);
  console.log(`  Cloudinary: ${env.CLOUDINARY_CLOUD_NAME || '(not configured)'}`);
  console.log('');

  // Step 1: Build (unless skipped)
  if (!skipBuild) {
    buildDesktop(platform);
  }

  // Step 2: Collect artifacts
  const artifacts = collectArtifacts();
  if (artifacts.length === 0) {
    console.error('❌ No artifacts found in release directory.');
    process.exit(1);
  }

  console.log(`\n📦 Found ${artifacts.length} artifacts:\n`);
  for (const a of artifacts) {
    console.log(`  • ${a.name} (${a.sizeMB} MB)`);
  }

  if (dryRun) {
    console.log('\n🔍 Dry run — skipping upload.');
    return;
  }

  // Step 3: Upload to Cloudinary
  if (!env.CLOUDINARY_CLOUD_NAME) {
    console.error('\n❌ Cloudinary not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET');
    console.log('\n💡 You can still find the built artifacts in:');
    console.log(`   ${RELEASE_DIR}`);
    process.exit(1);
  }

  console.log('\n☁️  Uploading to Cloudinary...\n');
  const uploadResults = [];
  for (const artifact of artifacts) {
    const publicId = `v${version}/${artifact.name.replace(/\.[^.]+$/, '')}`;
    console.log(`  Uploading ${artifact.name}...`);
    try {
      const result = await cloudinaryUpload(artifact.path, publicId, 'raw', env);
      console.log(`  ✅ ${artifact.name} → ${result.secure_url}`);
      uploadResults.push(result);
    } catch (err) {
      console.error(`  ❌ ${artifact.name}: ${err.message}`);
      uploadResults.push(null);
    }
  }

  // Step 4: Upload manifest
  const manifest = createManifest(artifacts, version, uploadResults);
  const manifestPath = join(RELEASE_DIR, 'manifest.json');
  const { writeFileSync } = await import('fs');
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`\n📄 Manifest saved to ${manifestPath}`);

  try {
    const manifestResult = await cloudinaryUpload(manifestPath, `v${version}/manifest`, 'raw', env);
    console.log(`  ✅ Manifest → ${manifestResult.secure_url}`);
  } catch (err) {
    console.error(`  ❌ Manifest upload failed: ${err.message}`);
  }

  // Summary
  const successful = uploadResults.filter(Boolean).length;
  console.log(`\n${'═'.repeat(50)}`);
  console.log(`✅ Deploy complete: ${successful}/${artifacts.length} artifacts uploaded`);
  console.log(`   Version: ${version}`);
  console.log(`   Cloudinary folder: velanova/releases/v${version}/`);
  console.log(`${'═'.repeat(50)}\n`);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
