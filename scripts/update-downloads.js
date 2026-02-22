#!/usr/bin/env node

/**
 * Velanova App Update Script
 * 
 * Fetches the latest desktop app version manifest from Cloudinary,
 * downloads artifacts, and updates the landing site's download page.
 * 
 * Usage:
 *   pnpm app:update                # Fetch latest + update landing site
 *   pnpm app:update -- --version 1.3.0   # Fetch specific version
 *   pnpm app:update -- --dry-run         # Preview without writing
 * 
 * Required env vars:
 *   CLOUDINARY_CLOUD_NAME
 *   CLOUDINARY_API_KEY
 *   CLOUDINARY_API_SECRET
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import https from 'https';

const ROOT_DIR = join(new URL('.', import.meta.url).pathname, '..');
const LANDING_DIR = join(ROOT_DIR, 'apps', 'landing-site');
const DOWNLOAD_PAGE = join(LANDING_DIR, 'src', 'app', 'download', 'page.tsx');
const PUBLIC_DOWNLOADS = join(LANDING_DIR, 'public', 'downloads');

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

// ---------- Cloudinary Fetch ----------

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return fetchJson(res.headers.location).then(resolve).catch(reject);
      }
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } 
        catch { reject(new Error(`Failed to parse JSON from ${url}: ${data.slice(0, 200)}`)); }
      });
    }).on('error', reject);
  });
}

function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const file = (await import('fs')).createWriteStream(destPath);
    https.get(url, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        file.close();
        return downloadFile(res.headers.location, destPath).then(resolve).catch(reject);
      }
      res.pipe(file);
      file.on('finish', () => { file.close(); resolve(); });
    }).on('error', (err) => { file.close(); reject(err); });
  });
}

async function fetchManifest(cloudName, version) {
  // Try fetching manifest from Cloudinary
  const manifestUrl = `https://res.cloudinary.com/${cloudName}/raw/upload/velanova/releases/v${version}/manifest.json`;
  console.log(`  Fetching manifest: ${manifestUrl}`);
  return await fetchJson(manifestUrl);
}

async function listVersions(cloudName) {
  // List available versions by checking common patterns
  // Cloudinary doesn't have a direct "list folder" API via URL, 
  // so we try to fetch the desktop app's package.json version as the latest
  const desktopPkg = JSON.parse(readFileSync(join(ROOT_DIR, 'apps', 'desktop-app', 'package.json'), 'utf-8'));
  return desktopPkg.version;
}

// ---------- Update Download Page ----------

function updateDownloadPage(manifest, dryRun) {
  if (!existsSync(DOWNLOAD_PAGE)) {
    console.error(`❌ Download page not found: ${DOWNLOAD_PAGE}`);
    return false;
  }

  let content = readFileSync(DOWNLOAD_PAGE, 'utf-8');
  const version = manifest.version;
  const releaseDate = new Date(manifest.releaseDate).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  });

  // Update version string
  content = content.replace(
    /const\s+appVersion\s*=\s*['"][^'"]+['"]/,
    `const appVersion = '${version}'`
  );

  // Also update any hardcoded version patterns like "1.2.0"
  const versionRegex = /Velanova[-\s](?:Setup-)?[\d.]+/g;
  // Build download URL mapping from manifest
  const urlMap = {};
  for (const artifact of manifest.artifacts) {
    if (artifact.cloudinaryUrl) {
      urlMap[artifact.filename] = artifact.cloudinaryUrl;
    }
  }

  // Update release date
  content = content.replace(
    /const\s+releaseDate\s*=\s*['"][^'"]+['"]/,
    `const releaseDate = '${releaseDate}'`
  );

  // Update filenames in download links to use new version
  const oldVersionPattern = /(\d+\.\d+\.\d+)/g;
  // Only replace version numbers that look like they're part of filenames
  content = content.replace(
    /Velanova[-_](?:Setup[-_])?(\d+\.\d+\.\d+)/g,
    (match, oldVer) => match.replace(oldVer, version)
  );

  if (dryRun) {
    console.log('\n📝 Would update download page with:');
    console.log(`   Version: ${version}`);
    console.log(`   Release Date: ${releaseDate}`);
    console.log(`   Artifacts: ${manifest.artifacts.length}`);
    return true;
  }

  writeFileSync(DOWNLOAD_PAGE, content);
  console.log(`✅ Updated download page: version → ${version}, date → ${releaseDate}`);
  return true;
}

// ---------- Create/Update download-config.json ----------

function updateDownloadConfig(manifest, dryRun) {
  const configPath = join(LANDING_DIR, 'public', 'download-config.json');
  
  const config = {
    version: manifest.version,
    releaseDate: manifest.releaseDate,
    downloads: {},
  };

  for (const artifact of manifest.artifacts) {
    if (artifact.platform === 'meta') continue;
    
    const key = `${artifact.platform}-${artifact.filename.split('.').pop()}`;
    config.downloads[key] = {
      url: artifact.cloudinaryUrl || `/downloads/${artifact.filename}`,
      filename: artifact.filename,
      sizeMB: artifact.sizeMB,
      sha256: artifact.sha256,
    };
  }

  if (dryRun) {
    console.log('\n📝 Would write download-config.json:');
    console.log(JSON.stringify(config, null, 2));
    return;
  }

  if (!existsSync(join(LANDING_DIR, 'public'))) {
    mkdirSync(join(LANDING_DIR, 'public'), { recursive: true });
  }

  writeFileSync(configPath, JSON.stringify(config, null, 2));
  console.log(`✅ Updated download-config.json`);
}

// ---------- Main ----------

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  let version = null;
  
  const versionIdx = args.indexOf('--version');
  if (versionIdx !== -1 && args[versionIdx + 1]) {
    version = args[versionIdx + 1];
  }

  const env = loadEnv();
  const cloudName = env.CLOUDINARY_CLOUD_NAME;

  console.log('╔══════════════════════════════════════════════════╗');
  console.log('║        Velanova App Download Updater             ║');
  console.log('╚══════════════════════════════════════════════════╝');

  if (!cloudName) {
    console.log('\n⚠️  Cloudinary not configured. Using local manifest if available.');
    
    // Try local manifest from release directory
    const localManifest = join(ROOT_DIR, 'apps', 'desktop-app', 'release', 'manifest.json');
    if (existsSync(localManifest)) {
      const manifest = JSON.parse(readFileSync(localManifest, 'utf-8'));
      console.log(`  Found local manifest: v${manifest.version}`);
      updateDownloadPage(manifest, dryRun);
      updateDownloadConfig(manifest, dryRun);
    } else {
      console.error('❌ No manifest found. Run "pnpm desktop:deploy" first.');
      process.exit(1);
    }
    return;
  }

  // Determine version
  if (!version) {
    version = await listVersions(cloudName);
    console.log(`\n  Latest version from package.json: ${version}`);
  }

  try {
    // Fetch manifest from Cloudinary
    const manifest = await fetchManifest(cloudName, version);
    console.log(`\n  📦 Manifest loaded: v${manifest.version} (${manifest.artifacts.length} artifacts)\n`);

    for (const artifact of manifest.artifacts) {
      console.log(`    • ${artifact.filename} (${artifact.sizeMB} MB) [${artifact.platform}]`);
    }

    // Update download page
    updateDownloadPage(manifest, dryRun);
    updateDownloadConfig(manifest, dryRun);

    console.log(`\n${'═'.repeat(50)}`);
    console.log(`✅ Landing site updated for v${version}`);
    console.log(`   Run "pnpm build:landing" and redeploy to apply.`);
    console.log(`${'═'.repeat(50)}\n`);

  } catch (err) {
    console.error(`\n❌ Failed to fetch manifest: ${err.message}`);
    console.log('   Make sure you ran "pnpm desktop:deploy" for this version.');
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
