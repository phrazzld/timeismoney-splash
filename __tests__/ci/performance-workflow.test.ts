/**
 * Tests for CI performance workflow configuration (T021)
 */

import {
  createGitHubWorkflow,
  validateWorkflowConfig,
  parseWorkflowResults,
} from '@/lib/performance/ci-workflow';
import type { GitHubWorkflowConfig } from '@/lib/performance/lighthouse-types';

// Mock YAML parser
jest.mock('js-yaml', () => ({
  dump: jest.fn((obj) => JSON.stringify(obj, null, 2)),
  load: jest.fn((str) => JSON.parse(str)),
}));

describe('CI Performance Workflow (T021)', () => {
  describe('createGitHubWorkflow', () => {
    it('should create a valid GitHub Actions workflow', () => {
      const workflow = createGitHubWorkflow({
        name: 'Lighthouse CI',
        triggers: ['push', 'pull_request'],
        nodeVersion: '20',
        lighthouseConfig: {
          configPath: './lighthouserc.js',
          uploadResults: true,
          failOnBudgetViolation: true,
        },
      });

      expect(workflow).toMatchObject({
        name: 'Lighthouse CI',
        on: {
          push: {
            branches: ['main', 'master'],
          },
          pull_request: {
            branches: ['main', 'master'],
          },
        },
        jobs: {
          lighthouse: {
            'runs-on': 'ubuntu-latest',
            steps: expect.arrayContaining([
              expect.objectContaining({
                name: 'Checkout code',
                uses: 'actions/checkout@v4',
              }),
              expect.objectContaining({
                name: 'Setup Node.js',
                uses: 'actions/setup-node@v4',
                with: { 'node-version': '20' },
              }),
              expect.objectContaining({
                name: 'Install dependencies',
                run: 'npm ci',
              }),
              expect.objectContaining({
                name: 'Build application',
                run: 'npm run build',
              }),
              expect.objectContaining({
                name: 'Run Lighthouse CI',
                run: 'npx @lhci/cli@0.12.x autorun',
              }),
            ]),
          },
        },
      });
    });

    it('should include optional steps when configured', () => {
      const workflow = createGitHubWorkflow({
        name: 'Lighthouse CI',
        triggers: ['push'],
        nodeVersion: '20',
        lighthouseConfig: {
          configPath: './lighthouserc.js',
          uploadResults: true,
          failOnBudgetViolation: true,
        },
        cacheStrategy: 'npm',
        bundleAnalysis: true,
        slackNotifications: {
          webhook: 'https://hooks.slack.com/webhook',
          channel: '#performance',
        },
      });

      const steps = workflow.jobs.lighthouse.steps;

      // Should include cache step
      expect(steps).toContainEqual(
        expect.objectContaining({
          name: 'Cache dependencies',
          uses: 'actions/cache@v3',
        }),
      );

      // Should include bundle analysis
      expect(steps).toContainEqual(
        expect.objectContaining({
          name: 'Analyze bundle size',
          run: 'npx @next/bundle-analyzer',
        }),
      );

      // Should include Slack notification
      expect(steps).toContainEqual(
        expect.objectContaining({
          name: 'Notify Slack on failure',
          if: 'failure()',
        }),
      );
    });

    it('should configure different triggers correctly', () => {
      const scheduleWorkflow = createGitHubWorkflow({
        name: 'Scheduled Performance Check',
        triggers: ['schedule'],
        schedule: '0 6 * * *', // Daily at 6 AM
        nodeVersion: '20',
        lighthouseConfig: {
          configPath: './lighthouserc.js',
        },
      });

      expect(scheduleWorkflow.on).toEqual({
        schedule: [{ cron: '0 6 * * *' }],
      });
    });

    it('should handle multiple environments', () => {
      const multiEnvWorkflow = createGitHubWorkflow({
        name: 'Multi-Environment Performance',
        triggers: ['push'],
        nodeVersion: '20',
        lighthouseConfig: {
          configPath: './lighthouserc.js',
        },
        environments: [
          { name: 'staging', url: 'https://staging.example.com' },
          { name: 'production', url: 'https://example.com' },
        ],
      });

      expect(multiEnvWorkflow.jobs.lighthouse.strategy).toEqual({
        matrix: {
          environment: [
            { name: 'staging', url: 'https://staging.example.com' },
            { name: 'production', url: 'https://example.com' },
          ],
        },
      });
    });
  });

  describe('validateWorkflowConfig', () => {
    it('should validate a correct workflow configuration', () => {
      const validConfig: GitHubWorkflowConfig = {
        name: 'Lighthouse CI',
        triggers: ['push', 'pull_request'],
        nodeVersion: '20',
        lighthouseConfig: {
          configPath: './lighthouserc.js',
          uploadResults: true,
          failOnBudgetViolation: true,
        },
      };

      expect(() => validateWorkflowConfig(validConfig)).not.toThrow();
      expect(validateWorkflowConfig(validConfig)).toBe(true);
    });

    it('should reject configuration with missing required fields', () => {
      const invalidConfig = {
        name: 'Lighthouse CI',
        triggers: ['push'],
        // Missing nodeVersion and lighthouseConfig
      } as GitHubWorkflowConfig;

      expect(() => validateWorkflowConfig(invalidConfig)).toThrow(
        'Missing required field: nodeVersion',
      );
    });

    it('should validate Node.js version format', () => {
      const invalidNodeVersion: GitHubWorkflowConfig = {
        name: 'Lighthouse CI',
        triggers: ['push'],
        nodeVersion: 'invalid',
        lighthouseConfig: {
          configPath: './lighthouserc.js',
        },
      };

      expect(() => validateWorkflowConfig(invalidNodeVersion)).toThrow(
        'Invalid Node.js version format',
      );
    });

    it('should validate trigger types', () => {
      const invalidTriggers: GitHubWorkflowConfig = {
        name: 'Lighthouse CI',
        triggers: ['invalid_trigger'] as unknown,
        nodeVersion: '20',
        lighthouseConfig: {
          configPath: './lighthouserc.js',
        },
      };

      expect(() => validateWorkflowConfig(invalidTriggers)).toThrow(
        'Invalid trigger type: invalid_trigger',
      );
    });

    it('should validate environment URLs', () => {
      const invalidEnvironments: GitHubWorkflowConfig = {
        name: 'Lighthouse CI',
        triggers: ['push'],
        nodeVersion: '20',
        lighthouseConfig: {
          configPath: './lighthouserc.js',
        },
        environments: [{ name: 'invalid', url: 'not-a-url' }],
      };

      expect(() => validateWorkflowConfig(invalidEnvironments)).toThrow(
        'Invalid URL format: not-a-url',
      );
    });
  });

  describe('parseWorkflowResults', () => {
    it('should parse successful Lighthouse CI results', () => {
      const mockResults = {
        status: 'success',
        timestamp: '2024-01-01T00:00:00Z',
        reports: [
          {
            url: 'http://localhost:3000',
            scores: {
              performance: 0.96,
              accessibility: 0.98,
              bestPractices: 0.95,
              seo: 0.97,
            },
            metrics: {
              'first-contentful-paint': 1200,
              'largest-contentful-paint': 2000,
              'cumulative-layout-shift': 0.05,
              'max-potential-fid': 80,
              'total-blocking-time': 150,
            },
            budgetViolations: [],
          },
        ],
      };

      const result = parseWorkflowResults(mockResults);

      expect(result).toEqual({
        passed: true,
        timestamp: '2024-01-01T00:00:00Z',
        overallScore: 96,
        reports: [
          {
            url: 'http://localhost:3000',
            passed: true,
            scores: {
              performance: 96,
              accessibility: 98,
              bestPractices: 95,
              seo: 97,
            },
            metrics: {
              lcp: 2000,
              fid: 80,
              cls: 0.05,
              fcp: 1200,
              tbt: 150,
            },
            budgetViolations: [],
          },
        ],
        summary: {
          totalUrls: 1,
          passedUrls: 1,
          failedUrls: 0,
          averagePerformanceScore: 96,
        },
      });
    });

    it('should parse failed results with budget violations', () => {
      const mockFailedResults = {
        status: 'failure',
        timestamp: '2024-01-01T00:00:00Z',
        reports: [
          {
            url: 'http://localhost:3000',
            scores: {
              performance: 0.85,
              accessibility: 0.95,
              bestPractices: 0.9,
              seo: 0.95,
            },
            metrics: {
              'largest-contentful-paint': 3500, // Violates budget
              'cumulative-layout-shift': 0.15, // Violates budget
            },
            budgetViolations: [
              { metric: 'largest-contentful-paint', actual: 3500, budget: 2500 },
              { metric: 'cumulative-layout-shift', actual: 0.15, budget: 0.1 },
            ],
          },
        ],
      };

      const result = parseWorkflowResults(mockFailedResults);

      expect(result.passed).toBe(false);
      expect(result.reports[0].passed).toBe(false);
      expect(result.reports[0].budgetViolations).toHaveLength(2);
      expect(result.summary.failedUrls).toBe(1);
    });

    it('should calculate summary statistics correctly', () => {
      const multipleReports = {
        status: 'success',
        timestamp: '2024-01-01T00:00:00Z',
        reports: [
          {
            url: 'http://localhost:3000',
            scores: { performance: 0.96 },
            metrics: {},
            budgetViolations: [],
          },
          {
            url: 'http://localhost:3000/about',
            scores: { performance: 0.94 },
            metrics: {},
            budgetViolations: [],
          },
          {
            url: 'http://localhost:3000/contact',
            scores: { performance: 0.88 },
            metrics: {},
            budgetViolations: [{ metric: 'performance', actual: 0.88, budget: 0.95 }],
          },
        ],
      };

      const result = parseWorkflowResults(multipleReports);

      expect(result.summary).toEqual({
        totalUrls: 3,
        passedUrls: 2,
        failedUrls: 1,
        averagePerformanceScore: 93, // (96 + 94 + 88) / 3 = 92.67 -> 93
      });
    });
  });

  describe('Workflow Integration', () => {
    it('should create workflow with performance budget enforcement', () => {
      const workflow = createGitHubWorkflow({
        name: 'Performance Budget Enforcement',
        triggers: ['pull_request'],
        nodeVersion: '20',
        lighthouseConfig: {
          configPath: './lighthouserc.js',
          failOnBudgetViolation: true,
          budgets: {
            performance: 95,
            lcp: 2500,
            cls: 0.1,
          },
        },
      });

      const lhciStep = workflow.jobs.lighthouse.steps.find(
        (step) => step.name === 'Run Lighthouse CI',
      );

      expect(lhciStep?.run).toContain('npx @lhci/cli@0.12.x autorun');
    });

    it('should include PR comment step when configured', () => {
      const workflow = createGitHubWorkflow({
        name: 'Lighthouse CI with PR Comments',
        triggers: ['pull_request'],
        nodeVersion: '20',
        lighthouseConfig: {
          configPath: './lighthouserc.js',
          prComments: true,
        },
      });

      expect(workflow.jobs.lighthouse.steps).toContainEqual(
        expect.objectContaining({
          name: 'Comment PR with results',
          uses: 'treosh/lighthouse-ci-action@v10',
        }),
      );
    });

    it('should handle workflow secrets correctly', () => {
      const workflow = createGitHubWorkflow({
        name: 'Lighthouse CI with Secrets',
        triggers: ['push'],
        nodeVersion: '20',
        lighthouseConfig: {
          configPath: './lighthouserc.js',
          serverToken: '${{ secrets.LHCI_TOKEN }}',
        },
      });

      expect(workflow.jobs.lighthouse.env).toEqual({
        LHCI_TOKEN: '${{ secrets.LHCI_TOKEN }}',
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed workflow results', () => {
      const malformedResults = {
        status: 'invalid',
        // Missing required fields
      };

      expect(() => parseWorkflowResults(malformedResults as unknown)).toThrow(
        'Invalid workflow results format',
      );
    });

    it('should handle missing workflow file gracefully', () => {
      const config: GitHubWorkflowConfig = {
        name: 'Missing Config Test',
        triggers: ['push'],
        nodeVersion: '20',
        lighthouseConfig: {
          configPath: './nonexistent.js',
        },
      };

      // Should still create workflow, validation happens at runtime
      expect(() => createGitHubWorkflow(config)).not.toThrow();
    });

    it('should validate environment matrix limits', () => {
      const tooManyEnvironments: GitHubWorkflowConfig = {
        name: 'Too Many Environments',
        triggers: ['push'],
        nodeVersion: '20',
        lighthouseConfig: {
          configPath: './lighthouserc.js',
        },
        environments: Array.from({ length: 21 }, (_, i) => ({
          name: `env${i}`,
          url: `https://env${i}.example.com`,
        })),
      };

      expect(() => validateWorkflowConfig(tooManyEnvironments)).toThrow(
        'Too many environments in matrix (max 20)',
      );
    });
  });
});
