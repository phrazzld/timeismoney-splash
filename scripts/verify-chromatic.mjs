#!/usr/bin/env node

/**
 * Script to verify Chromatic setup
 * Run with: node scripts/verify-chromatic.mjs
 */

import { execSync } from 'child_process';
import fs from 'fs';

console.log('🔍 Verifying Chromatic Setup...\n');

// Check 1: Chromatic package installed
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const chromaticVersion = packageJson.devDependencies?.chromatic;
  if (chromaticVersion) {
    console.log('✅ Chromatic package installed:', chromaticVersion);
  } else {
    console.log('❌ Chromatic package not found in devDependencies');
    process.exit(1);
  }
} catch {
  console.log('❌ Error reading package.json');
  process.exit(1);
}

// Check 2: Chromatic script in package.json
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const chromaticScript = packageJson.scripts?.chromatic;
  if (chromaticScript) {
    console.log('✅ Chromatic script configured:', chromaticScript);
  } else {
    console.log('❌ Chromatic script not found in package.json');
    process.exit(1);
  }
} catch {
  console.log('❌ Error checking scripts');
  process.exit(1);
}

// Check 3: GitHub workflow exists
const workflowPath = '.github/workflows/chromatic.yml';
if (fs.existsSync(workflowPath)) {
  console.log('✅ GitHub workflow exists:', workflowPath);
} else {
  console.log('❌ GitHub workflow not found:', workflowPath);
  process.exit(1);
}

// Check 4: Storybook can build
console.log('\n📦 Testing Storybook build...');
try {
  execSync('pnpm build-storybook', { stdio: 'inherit' });
  console.log('✅ Storybook builds successfully');
} catch {
  console.log('❌ Storybook build failed');
  process.exit(1);
}

// Check 5: Environment variable check
console.log('\n🔐 Checking for Chromatic token...');
if (process.env.CHROMATIC_PROJECT_TOKEN) {
  console.log('✅ CHROMATIC_PROJECT_TOKEN is set');

  // Optional: Try running Chromatic if token is available
  console.log('\n🚀 Running Chromatic test build...');
  try {
    execSync('pnpm chromatic --dry-run', { stdio: 'inherit' });
    console.log('✅ Chromatic dry run successful');
  } catch {
    console.log('⚠️  Chromatic dry run failed - this might be normal for first run');
  }
} else {
  console.log('⚠️  CHROMATIC_PROJECT_TOKEN not set in environment');
  console.log('   To test locally, run: export CHROMATIC_PROJECT_TOKEN=<your-token>');
  console.log('   For CI, add the token to GitHub Secrets');
}

console.log('\n✨ Chromatic setup verification complete!');
console.log('\nNext steps:');
console.log('1. Create a Chromatic account at https://www.chromatic.com/');
console.log('2. Create a project for this repository');
console.log('3. Add the project token to GitHub Secrets as CHROMATIC_PROJECT_TOKEN');
console.log('4. Push a commit to trigger the CI workflow');
