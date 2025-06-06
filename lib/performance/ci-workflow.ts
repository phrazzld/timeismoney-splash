/**
 * GitHub Actions workflow configuration for Lighthouse CI
 */

import type { GitHubWorkflowConfig, WorkflowResult } from './lighthouse-types';

/**
 * Valid GitHub Actions trigger types
 */
const VALID_TRIGGERS = ['push', 'pull_request', 'schedule', 'workflow_dispatch'] as const;

/**
 * Valid Node.js version patterns
 */
const NODE_VERSION_PATTERN = /^(1[6-9]|[2-9]\d)(\.\d+(\.\d+)?)?$/;

/**
 * Creates a GitHub Actions workflow configuration for Lighthouse CI
 */
export function createGitHubWorkflow(config: GitHubWorkflowConfig): unknown {
  const {
    name,
    triggers,
    nodeVersion,
    lighthouseConfig,
    schedule,
    cacheStrategy,
    bundleAnalysis,
    environments,
    slackNotifications,
  } = config;

  // Build the workflow trigger configuration
  const on: Record<string, unknown> = {};

  for (const trigger of triggers) {
    switch (trigger) {
      case 'push':
      case 'pull_request':
        on[trigger] = {
          branches: ['main', 'master'],
        };
        break;
      case 'schedule':
        on.schedule = schedule ? [{ cron: schedule }] : [{ cron: '0 6 * * *' }];
        break;
      case 'workflow_dispatch':
        on.workflow_dispatch = {};
        break;
    }
  }

  // Build the job steps
  const steps: unknown[] = [
    {
      name: 'Checkout code',
      uses: 'actions/checkout@v4',
    },
    {
      name: 'Setup Node.js',
      uses: 'actions/setup-node@v4',
      with: {
        'node-version': nodeVersion,
      },
    },
  ];

  // Add caching if specified
  if (cacheStrategy) {
    steps.push({
      name: 'Cache dependencies',
      uses: 'actions/cache@v3',
      with: {
        path:
          cacheStrategy === 'npm'
            ? '~/.npm'
            : cacheStrategy === 'yarn'
              ? '~/.yarn'
              : '~/.pnpm-store',
        key: `$\{\{ runner.os }}-${cacheStrategy}-$\{\{ hashFiles('**/package-lock.json') }}`,
        'restore-keys': `$\{\{ runner.os }}-${cacheStrategy}-`,
      },
    });
  }

  steps.push(
    {
      name: 'Install dependencies',
      run:
        cacheStrategy === 'yarn'
          ? 'yarn install --frozen-lockfile'
          : cacheStrategy === 'pnpm'
            ? 'pnpm install --frozen-lockfile'
            : 'npm ci',
    },
    {
      name: 'Build application',
      run:
        cacheStrategy === 'yarn'
          ? 'yarn build'
          : cacheStrategy === 'pnpm'
            ? 'pnpm build'
            : 'npm run build',
    },
  );

  // Add bundle analysis if enabled
  if (bundleAnalysis) {
    steps.push({
      name: 'Analyze bundle size',
      run: 'npx @next/bundle-analyzer',
    });
  }

  // Add Lighthouse CI step
  steps.push({
    name: 'Run Lighthouse CI',
    run: 'npx @lhci/cli@0.12.x autorun',
    env: {
      LHCI_BUILD_CONTEXT__CURRENT_HASH: '${{ github.sha }}',
      LHCI_BUILD_CONTEXT__CURRENT_BRANCH: '${{ github.ref_name }}',
      LHCI_BUILD_CONTEXT__COMMIT_TIME: '${{ github.event.head_commit.timestamp }}',
    },
  });

  // Add PR comment step if enabled
  if (lighthouseConfig.prComments && triggers.includes('pull_request')) {
    steps.push({
      name: 'Comment PR with results',
      uses: 'treosh/lighthouse-ci-action@v10',
      with: {
        'upload-dir': './lhci_reports',
        'temporary-public-storage': 'true',
      },
    });
  }

  // Add Slack notification on failure
  if (slackNotifications) {
    steps.push({
      name: 'Notify Slack on failure',
      if: 'failure()',
      uses: '8398a7/action-slack@v3',
      with: {
        status: 'failure',
        channel: slackNotifications.channel,
        webhook_url: slackNotifications.webhook,
        message: 'Lighthouse CI performance tests failed! 🚨',
      },
    });
  }

  // Build the job configuration
  const job: Record<string, unknown> = {
    'runs-on': 'ubuntu-latest',
    steps,
  };

  // Add environment matrix if specified
  if (environments && environments.length > 0) {
    job.strategy = {
      matrix: {
        environment: environments,
      },
    };
  }

  // Add environment variables
  const jobEnv: Record<string, unknown> = {};

  if (lighthouseConfig.serverToken) {
    jobEnv.LHCI_TOKEN = lighthouseConfig.serverToken;
  }

  if (Object.keys(jobEnv).length > 0) {
    job.env = jobEnv;
  }

  return {
    name,
    on,
    jobs: {
      lighthouse: job,
    },
  };
}

/**
 * Validates GitHub Actions workflow configuration
 */
export function validateWorkflowConfig(config: GitHubWorkflowConfig): boolean {
  // Check required fields
  if (!config.name) {
    throw new Error('Missing required field: name');
  }

  if (!config.nodeVersion) {
    throw new Error('Missing required field: nodeVersion');
  }

  if (!config.lighthouseConfig) {
    throw new Error('Missing required field: lighthouseConfig');
  }

  // Validate Node.js version
  if (!NODE_VERSION_PATTERN.test(config.nodeVersion)) {
    throw new Error('Invalid Node.js version format');
  }

  // Validate triggers
  for (const trigger of config.triggers) {
    if (!VALID_TRIGGERS.includes(trigger)) {
      throw new Error(`Invalid trigger type: ${trigger}`);
    }
  }

  // Validate schedule cron if present
  if (config.triggers.includes('schedule') && config.schedule) {
    // Basic cron validation (5 fields)
    const cronParts = config.schedule.split(' ');
    if (cronParts.length !== 5) {
      throw new Error('Invalid cron schedule format');
    }
  }

  // Validate environment URLs
  if (config.environments) {
    if (config.environments.length > 20) {
      throw new Error('Too many environments in matrix (max 20)');
    }

    for (const env of config.environments) {
      try {
        new URL(env.url);
      } catch {
        throw new Error(`Invalid URL format: ${env.url}`);
      }
    }
  }

  // Validate Lighthouse config path
  if (!config.lighthouseConfig.configPath) {
    throw new Error('Missing Lighthouse config path');
  }

  return true;
}

/**
 * Parses Lighthouse CI workflow results
 */
export function parseWorkflowResults(rawResults: unknown): WorkflowResult {
  if (!rawResults || typeof rawResults !== 'object') {
    throw new Error('Invalid workflow results format');
  }

  const results = rawResults as { reports?: unknown[]; status?: string; timestamp?: string };
  if (!results.reports || !Array.isArray(results.reports)) {
    throw new Error('Invalid workflow results format: missing reports');
  }

  const reports = results.reports.map((report: unknown) => {
    const typedReport = report as {
      scores?: Record<string, number>;
      metrics?: Record<string, number>;
      budgetViolations?: unknown[];
      url?: string;
      timestamp?: string;
    };

    // Convert scores from 0-1 to 0-100
    const scores: Record<string, number> = {};
    if (typedReport.scores) {
      for (const [key, value] of Object.entries(typedReport.scores)) {
        scores[key] = Math.round((value as number) * 100);
      }
    }

    // Normalize metrics names
    const metrics: Record<string, number> = {};
    if (typedReport.metrics) {
      for (const [key, value] of Object.entries(typedReport.metrics)) {
        const normalizedKey = key
          .replace('first-contentful-paint', 'fcp')
          .replace('largest-contentful-paint', 'lcp')
          .replace('cumulative-layout-shift', 'cls')
          .replace('max-potential-fid', 'fid')
          .replace('total-blocking-time', 'tbt');
        metrics[normalizedKey] = value as number;
      }
    }

    const hasBudgetViolations =
      typedReport.budgetViolations && typedReport.budgetViolations.length > 0;
    const performanceScore = scores.performance || 0;
    const passed = !hasBudgetViolations && performanceScore >= 95;

    return {
      url: typedReport.url || 'unknown',
      passed,
      scores,
      metrics,
      budgetViolations: (typedReport.budgetViolations || []) as {
        readonly metric: string;
        readonly actual: number;
        readonly budget: number;
      }[],
    };
  });

  // Calculate summary statistics
  const totalUrls = reports.length;
  const passedUrls = reports.filter((r) => r.passed).length;
  const failedUrls = totalUrls - passedUrls;

  const performanceScores = reports
    .map((r) => r.scores.performance || 0)
    .filter((score) => score > 0);
  const averagePerformanceScore =
    performanceScores.length > 0
      ? Math.round(
          performanceScores.reduce((sum, score) => sum + score, 0) / performanceScores.length,
        )
      : 0;

  const overallPassed = failedUrls === 0 && results.status !== 'failure';

  return {
    passed: overallPassed,
    timestamp: results.timestamp || new Date().toISOString(),
    overallScore: averagePerformanceScore,
    reports,
    summary: {
      totalUrls,
      passedUrls,
      failedUrls,
      averagePerformanceScore,
    },
  };
}

/**
 * Creates a default GitHub Actions workflow for Lighthouse CI
 */
export function createDefaultWorkflow(): unknown {
  return createGitHubWorkflow({
    name: 'Lighthouse CI',
    triggers: ['push', 'pull_request'],
    nodeVersion: '20',
    lighthouseConfig: {
      configPath: './lighthouserc.js',
      uploadResults: true,
      failOnBudgetViolation: true,
      prComments: true,
    },
    cacheStrategy: 'npm',
    bundleAnalysis: false,
  });
}

/**
 * Generates the YAML content for the GitHub Actions workflow
 */
export function generateWorkflowYAML(config: GitHubWorkflowConfig): string {
  const workflow = createGitHubWorkflow(config) as {
    name: string;
    on: Record<string, unknown>;
    jobs: {
      lighthouse: Record<string, unknown> & {
        'runs-on': string;
        strategy?: { matrix: { environment: { name: string; url: string }[] } };
        env?: Record<string, unknown>;
        steps?: {
          name: string;
          uses?: string;
          with?: Record<string, unknown>;
          env?: Record<string, unknown>;
          run?: string;
          if?: string;
        }[];
      };
    };
  };

  // Simple YAML serialization (could use js-yaml library in production)
  const yamlLines: string[] = [];

  yamlLines.push(`name: ${workflow.name}`);
  yamlLines.push('');
  yamlLines.push('on:');

  for (const [trigger, triggerConfig] of Object.entries(workflow.on)) {
    if (trigger === 'schedule') {
      yamlLines.push(`  ${trigger}:`);
      const scheduleConfig = triggerConfig as { cron: string }[];
      for (const schedule of scheduleConfig) {
        yamlLines.push(`    - cron: '${schedule.cron}'`);
      }
    } else {
      const branchConfig = triggerConfig as { branches?: string[] };
      if (branchConfig.branches) {
        yamlLines.push(`  ${trigger}:`);
        yamlLines.push('    branches:');
        for (const branch of branchConfig.branches) {
          yamlLines.push(`      - ${branch}`);
        }
      } else {
        yamlLines.push(`  ${trigger}: {}`);
      }
    }
  }

  yamlLines.push('');
  yamlLines.push('jobs:');
  yamlLines.push('  lighthouse:');
  yamlLines.push(`    runs-on: ${workflow.jobs.lighthouse['runs-on']}`);

  if (workflow.jobs.lighthouse.strategy) {
    yamlLines.push('    strategy:');
    yamlLines.push('      matrix:');
    yamlLines.push('        environment:');
    for (const env of workflow.jobs.lighthouse.strategy.matrix.environment) {
      yamlLines.push(`          - name: ${env.name}`);
      yamlLines.push(`            url: ${env.url}`);
    }
  }

  if (workflow.jobs.lighthouse.env) {
    yamlLines.push('    env:');
    for (const [key, value] of Object.entries(workflow.jobs.lighthouse.env)) {
      yamlLines.push(`      ${key}: ${value}`);
    }
  }

  yamlLines.push('    steps:');
  for (const step of workflow.jobs.lighthouse.steps || []) {
    yamlLines.push(`      - name: ${step.name}`);
    if (step.uses) {
      yamlLines.push(`        uses: ${step.uses}`);
    }
    if (step.run) {
      yamlLines.push(`        run: ${step.run}`);
    }
    if (step.with) {
      yamlLines.push('        with:');
      for (const [key, value] of Object.entries(step.with)) {
        yamlLines.push(`          ${key}: ${value}`);
      }
    }
    if (step.env) {
      yamlLines.push('        env:');
      for (const [key, value] of Object.entries(step.env)) {
        yamlLines.push(`          ${key}: ${value}`);
      }
    }
    if (step.if) {
      yamlLines.push(`        if: ${step.if}`);
    }
  }

  return yamlLines.join('\n');
}
