#!/usr/bin/env node

/**
 * Script to check for peer dependency issues
 * Run with: node scripts/check-peer-deps.mjs
 */

import { execSync } from 'child_process';

console.log('🔍 Checking for peer dependency issues...\n');

try {
  // Check pnpm version to determine which command to use
  const pnpmVersion = execSync('pnpm --version', { encoding: 'utf-8' }).trim();
  const majorVersion = parseInt(pnpmVersion.split('.')[0], 10);

  if (majorVersion >= 9) {
    // Use the newer --check-peer-dependencies flag
    execSync('pnpm install --check-peer-dependencies', {
      stdio: 'inherit',
      env: { ...process.env, CI: 'true' }, // Prevent any interactive prompts
    });
  } else {
    // For pnpm 8.x, run pnpm doctor which includes peer dependency checks
    console.log('⚠️  Using pnpm < v9, running pnpm doctor for comprehensive checks...');
    execSync('pnpm doctor', {
      stdio: 'inherit',
    });
  }

  console.log('✅ No peer dependency issues found!');
  process.exit(0);
} catch {
  console.error('❌ Peer dependency issues detected or other problems found!');
  console.error('\nTo resolve:');
  console.error('1. Run "pnpm install" to see detailed error messages');
  console.error('2. Update conflicting packages with "pnpm update <package>"');
  console.error('3. If justified, add exceptions to pnpm.peerDependencyRules in package.json');
  console.error('4. Run "pnpm doctor" to see all diagnostics');
  process.exit(1);
}
