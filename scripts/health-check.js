#!/usr/bin/env node

/**
 * Production Health Check Script
 * Verifies that the production build is ready for deployment
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DIST_PATH = path.join(__dirname, '..', 'dist');
const REQUIRED_FILES = [
  'index.html',
  'manifest.json',
  'sw.js',
  '_redirects',
  'vercel.json',
  '.htaccess'
];

const REQUIRED_FOLDERS = [
  'assets'
];

function checkFile(filePath) {
  const fullPath = path.join(DIST_PATH, filePath);
  const exists = fs.existsSync(fullPath);
  
  if (exists) {
    const stats = fs.statSync(fullPath);
    console.log(`✅ ${filePath} (${formatSize(stats.size)})`);
    return true;
  } else {
    console.log(`❌ ${filePath} - MISSING`);
    return false;
  }
}

function checkFolder(folderPath) {
  const fullPath = path.join(DIST_PATH, folderPath);
  const exists = fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory();
  
  if (exists) {
    const files = fs.readdirSync(fullPath);
    console.log(`✅ ${folderPath}/ (${files.length} files)`);
    return true;
  } else {
    console.log(`❌ ${folderPath}/ - MISSING`);
    return false;
  }
}

function formatSize(bytes) {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

function checkBundleSize() {
  const assetsPath = path.join(DIST_PATH, 'assets');
  if (!fs.existsSync(assetsPath)) {
    console.log('❌ Assets folder not found');
    return false;
  }

  const files = fs.readdirSync(assetsPath);
  const jsFiles = files.filter(file => file.endsWith('.js'));
  let hasLargeChunks = false;

  console.log('\n📦 Bundle Analysis:');
  jsFiles.forEach(file => {
    const filePath = path.join(assetsPath, file);
    const stats = fs.statSync(filePath);
    const size = stats.size;
    
    // Exclude PDF.js files from large chunk warnings (they're necessarily large)
    if (size > 600 * 1024 && !file.includes('pdf')) { // 600KB
      console.log(`⚠️  ${file} (${formatSize(size)}) - Large chunk detected`);
      hasLargeChunks = true;
    } else if (file.includes('pdf')) {
      console.log(`📄 ${file} (${formatSize(size)}) - PDF.js library (expected large size)`);
    } else {
      console.log(`✅ ${file} (${formatSize(size)})`);
    }
  });

  return !hasLargeChunks;
}

function validateIndexHTML() {
  const indexPath = path.join(DIST_PATH, 'index.html');
  if (!fs.existsSync(indexPath)) {
    return false;
  }

  const content = fs.readFileSync(indexPath, 'utf8');
  const requiredMeta = [
    'viewport',
    'description',
    'theme-color',
    'og:title',
    'twitter:card'
  ];

  console.log('\n🔍 HTML Validation:');
  let allMetaPresent = true;

  requiredMeta.forEach(meta => {
    if (content.includes(meta)) {
      console.log(`✅ ${meta} meta tag found`);
    } else {
      console.log(`❌ ${meta} meta tag missing`);
      allMetaPresent = false;
    }
  });

  // Check for manifest link
  if (content.includes('manifest.json')) {
    console.log('✅ PWA manifest linked');
  } else {
    console.log('❌ PWA manifest not linked');
    allMetaPresent = false;
  }

  return allMetaPresent;
}

function validateManifest() {
  const manifestPath = path.join(DIST_PATH, 'manifest.json');
  if (!fs.existsSync(manifestPath)) {
    return false;
  }

  try {
    const content = fs.readFileSync(manifestPath, 'utf8');
    const manifest = JSON.parse(content);
    
    console.log('\n📱 PWA Manifest Validation:');
    
    const requiredFields = ['name', 'short_name', 'start_url', 'display', 'icons'];
    let allFieldsPresent = true;

    requiredFields.forEach(field => {
      if (manifest[field]) {
        console.log(`✅ ${field} present`);
      } else {
        console.log(`❌ ${field} missing`);
        allFieldsPresent = false;
      }
    });

    return allFieldsPresent;
  } catch (error) {
    console.log('❌ Invalid JSON in manifest');
    return false;
  }
}

function main() {
  console.log('🚀 Production Health Check\n');
  console.log('='.repeat(50));

  if (!fs.existsSync(DIST_PATH)) {
    console.log('❌ Dist folder not found. Run "npm run build" first.');
    process.exit(1);
  }

  console.log('\n📁 File Checks:');
  const fileChecks = REQUIRED_FILES.map(checkFile);
  
  console.log('\n📂 Folder Checks:');
  const folderChecks = REQUIRED_FOLDERS.map(checkFolder);

  const htmlValid = validateIndexHTML();
  const manifestValid = validateManifest();
  const bundleSizeOk = checkBundleSize();

  const allPassed = [
    ...fileChecks,
    ...folderChecks,
    htmlValid,
    manifestValid,
    bundleSizeOk
  ].every(Boolean);

  console.log('\n' + '='.repeat(50));
  
  if (allPassed) {
    console.log('✅ All health checks passed! Ready for production deployment.');
    console.log('\n🚀 Deployment commands:');
    console.log('  Netlify: npm run deploy:netlify');
    console.log('  Vercel:  npm run deploy:vercel');
    console.log('  Surge:   npm run deploy:surge');
    process.exit(0);
  } else {
    console.log('❌ Some health checks failed. Please fix the issues before deploying.');
    process.exit(1);
  }
}

main();