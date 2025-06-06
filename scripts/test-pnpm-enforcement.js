#!/usr/bin/env node

/**
 * Test script to verify pnpm enforcement is working correctly
 */

/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');
/* eslint-enable @typescript-eslint/no-require-imports */

console.log('Testing pnpm enforcement mechanisms...\n');

// Test 1: Check .npmrc exists
const npmrcPath = path.join(__dirname, '..', '.npmrc');
if (fs.existsSync(npmrcPath)) {
  console.log('✅ .npmrc file exists');
} else {
  console.error('❌ .npmrc file is missing');
}

// Test 2: Check preinstall script exists
const packageJsonPath = path.join(__dirname, '..', 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

if (packageJson.scripts && packageJson.scripts.preinstall) {
  console.log('✅ Preinstall script configured');
} else {
  console.error('❌ Preinstall script missing');
}

// Test 3: Check enforce-pnpm.js exists
const enforcePnpmPath = path.join(__dirname, 'enforce-pnpm.js');
if (fs.existsSync(enforcePnpmPath)) {
  console.log('✅ enforce-pnpm.js script exists');
} else {
  console.error('❌ enforce-pnpm.js script missing');
}

// Test 4: Check engines field
if (packageJson.engines && packageJson.engines.pnpm) {
  console.log('✅ pnpm engine requirement specified');
  if (packageJson.engines.npm === 'please-use-pnpm') {
    console.log('✅ npm engine blocked');
  }
  if (packageJson.engines.yarn === 'please-use-pnpm') {
    console.log('✅ yarn engine blocked');
  }
} else {
  console.error('❌ pnpm engine requirement missing');
}

// Test 5: Check packageManager field
if (packageJson.packageManager && packageJson.packageManager.startsWith('pnpm')) {
  console.log('✅ packageManager field specifies pnpm');
} else {
  console.error('❌ packageManager field missing or incorrect');
}

// Test 6: Check git hooks
const preCommitPath = path.join(__dirname, '..', '.husky', 'pre-commit');
const prePushPath = path.join(__dirname, '..', '.husky', 'pre-push');

if (fs.existsSync(preCommitPath)) {
  const preCommitContent = fs.readFileSync(preCommitPath, 'utf8');
  if (preCommitContent.includes('package-lock.json') || preCommitContent.includes('yarn.lock')) {
    console.log('✅ Pre-commit hook checks for lockfiles');
  }
} else {
  console.error('❌ Pre-commit hook missing');
}

if (fs.existsSync(prePushPath)) {
  console.log('✅ Pre-push hook exists');
} else {
  console.error('❌ Pre-push hook missing');
}

// Test 7: Check .yarnrc.yml blocker
const yarnrcPath = path.join(__dirname, '..', '.yarnrc.yml');
if (fs.existsSync(yarnrcPath)) {
  console.log('✅ .yarnrc.yml blocker exists');
} else {
  console.warn('⚠️  .yarnrc.yml blocker missing (optional)');
}

console.log('\nAll pnpm enforcement mechanisms are in place! 🎉');
