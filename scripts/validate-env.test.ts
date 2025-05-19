/**
 * @jest-environment node
 */

import { spawn } from 'child_process';
import path from 'path';

const scriptPath = path.join(__dirname, 'validate-env.ts');

function runScript(
  env: NodeJS.ProcessEnv,
): Promise<{ stdout: string; stderr: string; code: number | null }> {
  return new Promise((resolve, reject) => {
    const childProcess = spawn('tsx', [scriptPath], {
      env: { ...process.env, ...env },
    });

    let stdout = '';
    let stderr = '';

    childProcess.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    childProcess.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    childProcess.on('close', (code) => {
      resolve({ stdout, stderr, code });
    });

    childProcess.on('error', (error) => {
      reject(error);
    });
  });
}

describe('Env Validation Script', () => {
  describe('NEXT_PUBLIC_SITE_URL validation', () => {
    it('should fail in production without NEXT_PUBLIC_SITE_URL', async () => {
      const { stdout, stderr, code } = await runScript({
        NODE_ENV: 'production',
      });

      expect(code).toBe(1);
      // The error might be in stderr due to console.error
      const combined = stdout + stderr;
      expect(combined).toContain('Critical Error:');
    });

    it('should pass in production with valid NEXT_PUBLIC_SITE_URL', async () => {
      const { stdout, stderr, code } = await runScript({
        NODE_ENV: 'production',
        NEXT_PUBLIC_SITE_URL: 'https://example.com',
      });

      // This should still fail because GA_MEASUREMENT_ID is missing in production
      expect(code).toBe(1);
      expect(stdout).toContain('NEXT_PUBLIC_SITE_URL is set to "https://example.com"');
      const combined = stdout + stderr;
      expect(combined).toContain('NEXT_PUBLIC_GA_MEASUREMENT_ID is not set');
    });

    it('should pass in development without NEXT_PUBLIC_SITE_URL', async () => {
      const { stdout, code } = await runScript({
        NODE_ENV: 'development',
      });

      expect(code).toBe(0);
      expect(stdout).toContain('NEXT_PUBLIC_SITE_URL is not set (non-production context)');
    });
  });

  describe('NEXT_PUBLIC_GA_MEASUREMENT_ID validation', () => {
    it('should fail in production without NEXT_PUBLIC_GA_MEASUREMENT_ID', async () => {
      const { stdout, stderr, code } = await runScript({
        NODE_ENV: 'production',
        NEXT_PUBLIC_SITE_URL: 'https://example.com',
      });

      expect(code).toBe(1);
      const combined = stdout + stderr;
      expect(combined).toContain('NEXT_PUBLIC_GA_MEASUREMENT_ID is not set');
    });

    it('should pass in production with both env vars set', async () => {
      const { stdout, code } = await runScript({
        NODE_ENV: 'production',
        NEXT_PUBLIC_SITE_URL: 'https://example.com',
        NEXT_PUBLIC_GA_MEASUREMENT_ID: 'G-TEST123456',
      });

      expect(code).toBe(0);
      expect(stdout).toContain('NEXT_PUBLIC_GA_MEASUREMENT_ID is set to "G-TEST123456"');
    });

    it('should fail with invalid GA measurement ID format', async () => {
      const { stdout, stderr, code } = await runScript({
        NODE_ENV: 'production',
        NEXT_PUBLIC_SITE_URL: 'https://example.com',
        NEXT_PUBLIC_GA_MEASUREMENT_ID: 'UA-123456789-1', // Old UA format
      });

      expect(code).toBe(1);
      const combined = stdout + stderr;
      expect(combined).toContain("GA4 Measurement IDs must start with 'G-'");
    });

    it('should pass in development without NEXT_PUBLIC_GA_MEASUREMENT_ID', async () => {
      const { stdout, code } = await runScript({
        NODE_ENV: 'development',
      });

      expect(code).toBe(0);
      expect(stdout).toContain('NEXT_PUBLIC_GA_MEASUREMENT_ID is not set (non-production context)');
    });
  });
});
