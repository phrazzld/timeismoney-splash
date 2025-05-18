import { execSync } from 'child_process';
import { join } from 'path';

// Path to the validation script
const SCRIPT_PATH = join(__dirname, 'validate-env.ts');

/**
 * Runs the validation script with given environment variables
 */
function runValidation(env: Record<string, string | undefined>): {
  success: boolean;
  error: number | null;
  output?: string;
  stderr?: string;
} {
  try {
    execSync(`tsx ${SCRIPT_PATH}`, {
      env: { ...process.env, ...env },
      stdio: 'pipe',
    });
    return { success: true, error: null };
  } catch (error: unknown) {
    const execError = error as Error & { status?: number; stdout?: Buffer; stderr?: Buffer };
    return {
      success: false,
      error: execError.status || 1,
      output: execError.stdout?.toString() || '',
      stderr: execError.stderr?.toString() || '',
    };
  }
}

describe('validate-env.ts', () => {
  describe('Production Context (NODE_ENV=production)', () => {
    const prodEnv = { NODE_ENV: 'production' };

    test('fails when NEXT_PUBLIC_SITE_URL is missing', () => {
      const result = runValidation({
        ...prodEnv,
        NEXT_PUBLIC_SITE_URL: undefined,
      });
      expect(result.success).toBe(false);
      expect(result.error).toBe(1);
    });

    test('fails when NEXT_PUBLIC_SITE_URL is invalid', () => {
      const result = runValidation({
        ...prodEnv,
        NEXT_PUBLIC_SITE_URL: 'not-a-url',
      });
      expect(result.success).toBe(false);
      expect(result.error).toBe(1);
    });

    test('fails when NEXT_PUBLIC_SITE_URL is localhost', () => {
      const result = runValidation({
        ...prodEnv,
        NEXT_PUBLIC_SITE_URL: 'http://localhost:3000',
      });
      expect(result.success).toBe(false);
      expect(result.error).toBe(1);
    });

    test('fails when NEXT_PUBLIC_SITE_URL has invalid protocol', () => {
      const result = runValidation({
        ...prodEnv,
        NEXT_PUBLIC_SITE_URL: 'ftp://example.com',
      });
      expect(result.success).toBe(false);
      expect(result.error).toBe(1);
    });

    test('succeeds when NEXT_PUBLIC_SITE_URL is valid', () => {
      const result = runValidation({
        ...prodEnv,
        NEXT_PUBLIC_SITE_URL: 'https://timeismoney.works',
      });
      expect(result.success).toBe(true);
    });
  });

  describe('Non-Production Context', () => {
    const devEnv = { NODE_ENV: 'development' };

    test('warns but succeeds when NEXT_PUBLIC_SITE_URL is missing', () => {
      const result = runValidation({
        ...devEnv,
        NEXT_PUBLIC_SITE_URL: undefined,
      });
      expect(result.success).toBe(true);
    });

    test('warns but succeeds when NEXT_PUBLIC_SITE_URL is invalid', () => {
      const result = runValidation({
        ...devEnv,
        NEXT_PUBLIC_SITE_URL: 'not-a-url',
      });
      expect(result.success).toBe(true);
    });

    test('succeeds when NEXT_PUBLIC_SITE_URL is localhost', () => {
      const result = runValidation({
        ...devEnv,
        NEXT_PUBLIC_SITE_URL: 'http://localhost:3000',
      });
      expect(result.success).toBe(true);
    });

    test('succeeds when NEXT_PUBLIC_SITE_URL is valid', () => {
      const result = runValidation({
        ...devEnv,
        NEXT_PUBLIC_SITE_URL: 'https://timeismoney.works',
      });
      expect(result.success).toBe(true);
    });
  });
});
