#!/usr/bin/env node

/**
 * Velanova Desktop App Deploy Script — GitHub Releases
 *
 * Builds the desktop app and publishes artifacts as a GitHub Release.
 *
 * Usage:
 *   pnpm desktop:deploy              # Build current platform + upload
 *   pnpm desktop:deploy -- --mac     # Build macOS + upload
 *   pnpm desktop:deploy -- --win     # Build Windows + upload
 *   pnpm desktop:deploy -- --linux   # Build Linux + upload
 *   pnpm desktop:deploy -- --all     # Build all platforms + upload
 *   pnpm desktop:deploy -- --skip-build  # Upload existing artifacts only
 *   pnpm desktop:deploy -- --dry-run    # List artifacts without uploading
 *
 * Required env vars:
 *   GITHUB_TOKEN   — Personal Access Token with 'repo' scope
 *                    (or a fine-grained token with Contents: write)
 *
 * Optional env vars:
 *   GITHUB_OWNER   — defaults to 'Nexolve-Technologies-India'
 *   GITHUB_REPO    — defaults to 'AIAdoption-GovernanceEngine'
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join, basename, extname, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createHash } from 'crypto';
import { createInterface } from 'readline';
import https from 'https';

function promptForToken() {
  return new Promise(resolve => {
    const rl = createInterface({ input: process.stdin, output: process.stderr });
    console.log('\n🔑 GITHUB_TOKEN not found in environment or .env files.');
    console.log('   You need a Personal Access Token with "repo" scope (or Contents: write).');
    console.log('   Create one at: https://github.com/settings/tokens\n');
    rl.question('   Paste your GitHub PAT here: ', answer => {
      rl.close();
      const token = answer.trim();
      if (!token) {
        console.error('\n❌ No token provided. Aborting.');
        process.exit(1);
      }
      // Offer to save it to .env so they don't have to paste again
      const envPath = join(ROOT_DIR, '.env');
      const rl2 = createInterface({ input: process.stdin, output: process.stderr });
      rl2.question('   Save token to .env for future deploys? (y/N): ', save => {
        rl2.close();
        if (save.trim().toLowerCase() === 'y') {
          let envContent = '';
          if (existsSync(envPath)) {
            envContent = readFileSync(envPath, 'utf-8');
            if (envContent.includes('GITHUB_TOKEN=')) {
              envContent = envContent.replace(/^GITHUB_TOKEN=.*/m, `GITHUB_TOKEN=${token}`);
            } else {
              envContent += `\nGITHUB_TOKEN=${token}\n`;
            }
          } else {
            envContent = `GITHUB_TOKEN=${token}\n`;
          }
          writeFileSync(envPath, envContent);
          console.log(`   ✅ Token saved to ${envPath}\n`);
        }
        resolve(token);
      });
    });
  });
}

const ROOT_DIR = join(dirname(fileURLToPath(import.meta.url)), '..');
const APP_DIR = join(ROOT_DIR, 'apps', 'desktop-app');
const RELEASE_DIR = join(APP_DIR, 'release');

const GITHUB_OWNER = process.env.GITHUB_OWNER || 'Nexolve-Technologies-India';
const GITHUB_REPO = process.env.GITHUB_REPO || 'AIAdoption-GovernanceEngine';

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
  const platformFlag = platform ? `--${platform}` : '--mac';
  try {
    execSync(`pnpm --filter desktop-app build:${platformFlag.replace('--', '')}`, {
      cwd: ROOT_DIR,
      stdio: 'inherit',
      env: { ...process.env, FORCE_COLOR: '1' },
    });
  } catch {
    // electron-builder exits non-zero on warnings; check if release dir has files
    if (!existsSync(RELEASE_DIR) || readdirSync(RELEASE_DIR).length === 0) {
      console.error('❌ Desktop build failed — no artifacts produced.');
      process.exit(1);
    }
  }
}

// ---------- GitHub API helpers ----------

function githubRequest(method, path, token, body, extraHeaders = {}) {
  return new Promise((resolve, reject) => {
    const bodyBuf = body ? Buffer.from(JSON.stringify(body)) : null;
    const options = {
      hostname: 'api.github.com',
      port: 443,
      path,
      method,
      headers: {
        'User-Agent': 'velanova-deploy-script/1.0',
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        ...(bodyBuf
          ? { 'Content-Type': 'application/json', 'Content-Length': bodyBuf.length }
          : {}),
        ...extraHeaders,
      },
    };
    const req = https.request(options, res => {
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => {
        const text = Buffer.concat(chunks).toString();
        try {
          resolve({ status: res.statusCode, body: JSON.parse(text) });
        } catch {
          resolve({ status: res.statusCode, body: text });
        }
      });
    });
    req.on('error', reject);
    if (bodyBuf) req.write(bodyBuf);
    req.end();
  });
}

function uploadAsset(uploadUrl, filePath, filename, token) {
  // uploadUrl looks like: https://uploads.github.com/repos/:owner/:repo/releases/:id/assets{?name,label}
  const base = uploadUrl.replace('{?name,label}', '');
  const url = new URL(`${base}?name=${encodeURIComponent(filename)}`);

  return new Promise((resolve, reject) => {
    const fileData = readFileSync(filePath);
    const options = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname + url.search,
      method: 'POST',
      headers: {
        'User-Agent': 'velanova-deploy-script/1.0',
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'Content-Type': 'application/octet-stream',
        'Content-Length': fileData.length,
      },
    };
    const req = https.request(options, res => {
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => {
        const text = Buffer.concat(chunks).toString();
        try {
          const json = JSON.parse(text);
          if (json.errors || json.message) {
            reject(new Error(json.message || JSON.stringify(json.errors)));
          } else {
            resolve(json);
          }
        } catch {
          reject(new Error(`Unexpected response: ${text.slice(0, 300)}`));
        }
      });
    });
    req.on('error', reject);
    req.write(fileData);
    req.end();
  });
}

// ---------- Collect Artifacts ----------

function collectArtifacts(version) {
  if (!existsSync(RELEASE_DIR)) {
    console.error(`❌ Release directory not found: ${RELEASE_DIR}`);
    console.error('   Run "pnpm desktop:build" first.');
    process.exit(1);
  }

  const uploadExtensions = ['.exe', '.msi', '.dmg', '.zip', '.AppImage', '.deb', '.rpm'];
  const metaFiles = ['latest.yml', 'latest-mac.yml', 'latest-linux.yml'];
  const artifacts = [];

  // Only scan top-level release directory (not subdirectories like win-unpacked/)
  for (const entry of readdirSync(RELEASE_DIR)) {
    const full = join(RELEASE_DIR, entry);
    if (statSync(full).isDirectory()) continue;
    const isAsset = uploadExtensions.some(e => entry.toLowerCase().endsWith(e.toLowerCase()));
    const isMeta = metaFiles.includes(entry);
    // Only include artifacts matching current version (or meta files)
    const matchesVersion = version ? entry.includes(version) : true;
    if ((isAsset && matchesVersion) || isMeta) {
      artifacts.push({
        path: full,
        name: entry,
        sizeMB: (statSync(full).size / 1024 / 1024).toFixed(1),
      });
    }
  }
  return artifacts;
}

// ---------- Main ----------

async function main() {
  const args = process.argv.slice(2);
  const skipBuild = args.includes('--skip-build');
  const dryRun = args.includes('--dry-run');
  const prerelease = args.includes('--prerelease');

  let platform = 'mac';
  for (const arg of args) {
    if (['--mac', '--win', '--linux', '--all'].includes(arg)) {
      platform = arg.replace('--', '');
    }
  }

  const env = loadEnv();
  let token = env.GITHUB_TOKEN;
  const version = getDesktopVersion();
  const tag = `v${version}`;

  console.log('╔══════════════════════════════════════════════════╗');
  console.log('║     Velanova Desktop Deploy → GitHub Releases    ║');
  console.log('╚══════════════════════════════════════════════════╝');
  console.log(`  Version  : ${version}`);
  console.log(`  Tag      : ${tag}`);
  console.log(`  Platform : ${platform}`);
  console.log(`  Repo     : ${GITHUB_OWNER}/${GITHUB_REPO}`);
  console.log(`  Token    : ${token ? token.slice(0, 8) + '...' : '(not set — set GITHUB_TOKEN)'}`);
  console.log('');

  // Step 1: Build
  if (!skipBuild) buildDesktop(platform);

  // Step 2: Collect artifacts
  const artifacts = collectArtifacts(version);
  if (artifacts.length === 0) {
    console.error('❌ No artifacts found in release directory. Did the build succeed?');
    process.exit(1);
  }

  console.log(`\n📦 Found ${artifacts.length} artifacts:\n`);
  for (const a of artifacts) console.log(`   • ${a.name}  (${a.sizeMB} MB)`);

  if (dryRun) {
    console.log('\n🔍 Dry run — skipping upload.');
    console.log(`\n   Download URLs would be:`);
    for (const a of artifacts) {
      console.log(
        `   https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}/releases/download/${tag}/${a.name}`
      );
    }
    return;
  }

  if (!token) {
    token = await promptForToken();
  }

  // Step 3: Create (or get existing) GitHub Release
  console.log(`\n🚀 Creating GitHub Release ${tag}...`);

  let releaseId;
  let uploadUrl;

  // Check if release already exists
  const existing = await githubRequest(
    'GET',
    `/repos/${GITHUB_OWNER}/${GITHUB_REPO}/releases/tags/${tag}`,
    token
  );

  if (existing.status === 200) {
    releaseId = existing.body.id;
    uploadUrl = existing.body.upload_url;
    console.log(
      `   ℹ️  Release ${tag} already exists (id: ${releaseId}) — checking for stale assets...`
    );

    // Fetch existing assets on this release and delete any that we're about to re-upload
    const assetsRes = await githubRequest(
      'GET',
      `/repos/${GITHUB_OWNER}/${GITHUB_REPO}/releases/${releaseId}/assets?per_page=100`,
      token
    );
    if (assetsRes.status === 200 && Array.isArray(assetsRes.body) && assetsRes.body.length > 0) {
      const artifactNames = new Set(artifacts.map(a => a.name));
      const toDelete = assetsRes.body.filter(a => artifactNames.has(a.name));
      if (toDelete.length > 0) {
        console.log(`   🗑️  Deleting ${toDelete.length} existing asset(s) before re-upload...`);
        for (const asset of toDelete) {
          const del = await githubRequest(
            'DELETE',
            `/repos/${GITHUB_OWNER}/${GITHUB_REPO}/releases/assets/${asset.id}`,
            token
          );
          const ok = del.status === 204;
          console.log(
            `      ${ok ? '✅' : '❌'} Deleted ${asset.name}${ok ? '' : ` (status ${del.status})`}`
          );
        }
      } else {
        console.log(`   ✅ No existing assets conflict — uploading fresh.`);
      }
    }
  } else {
    // Create new release
    const created = await githubRequest(
      'POST',
      `/repos/${GITHUB_OWNER}/${GITHUB_REPO}/releases`,
      token,
      {
        tag_name: tag,
        target_commitish: 'master',
        name: `Velanova Desktop ${tag}`,
        body: [
          `## Velanova Desktop ${tag}`,
          '',
          '### Downloads',
          '| Platform | File | Size |',
          '|----------|------|------|',
          ...artifacts
            .filter(a => !a.name.endsWith('.yml'))
            .map(a => `| ${detectPlatform(a.name)} | \`${a.name}\` | ${a.sizeMB} MB |`),
          '',
          '> **macOS note:** The app is not code-signed. On first open, right-click → Open.',
        ].join('\n'),
        draft: false,
        prerelease,
      }
    );

    if (created.status !== 201) {
      console.error(`❌ Failed to create release: ${JSON.stringify(created.body)}`);
      process.exit(1);
    }

    releaseId = created.body.id;
    uploadUrl = created.body.upload_url;
    console.log(`   ✅ Release created: ${created.body.html_url}`);
  }

  // Step 4: Upload assets
  console.log('\n☁️  Uploading assets...\n');
  let succeeded = 0;

  for (const artifact of artifacts) {
    process.stdout.write(`   Uploading ${artifact.name} (${artifact.sizeMB} MB)...`);
    try {
      const result = await uploadAsset(uploadUrl, artifact.path, artifact.name, token);
      const url = `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}/releases/download/${tag}/${artifact.name}`;
      process.stdout.write(` ✅\n`);
      console.log(`           → ${url}`);
      succeeded++;
    } catch (err) {
      process.stdout.write(` ❌\n`);
      console.error(`           Error: ${err.message}`);
    }
  }

  // Summary
  const releaseUrl = `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}/releases/tag/${tag}`;
  console.log(`\n${'═'.repeat(60)}`);
  console.log(`✅ Deploy complete: ${succeeded}/${artifacts.length} assets uploaded`);
  console.log(`   Release : ${releaseUrl}`);
  console.log(`${'═'.repeat(60)}\n`);
  console.log('Download URLs:');
  for (const a of artifacts) {
    console.log(
      `  https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}/releases/download/${tag}/${a.name}`
    );
  }
  console.log('');
}

function detectPlatform(filename) {
  const f = filename.toLowerCase();
  if (f.endsWith('.exe') || f.endsWith('.msi') || f.includes('win')) return 'Windows';
  if (f.endsWith('.dmg') || f.includes('mac') || f.includes('darwin')) return 'macOS';
  if (f.endsWith('.appimage') || f.endsWith('.deb') || f.endsWith('.rpm') || f.includes('linux'))
    return 'Linux';
  return 'Unknown';
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
