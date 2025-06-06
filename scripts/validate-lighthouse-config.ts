#!/usr/bin/env tsx

/**
 * Lighthouse CI Configuration Validator
 *
 * Validates the Lighthouse CI configuration for:
 * - Syntax correctness
 * - Required properties
 * - Threshold appropriateness
 * - Chrome flags compatibility
 * - Performance budget sanity checks
 */

import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';

interface LighthouseConfig {
  ci: {
    collect: {
      url: string[];
      numberOfRuns: number;
      settings: {
        chromeFlags: string;
        preset: string;
        throttling: Record<string, unknown>;
        onlyCategories: string[];
        emulatedFormFactor: string;
        locale: string;
      };
    };
    assert: {
      assertions: Record<string, [string, Record<string, unknown>]>;
    };
    upload: {
      target: string;
    };
  };
}

interface ValidationResult {
  success: boolean;
  errors: string[];
  warnings: string[];
  info: string[];
}

class LighthouseConfigValidator {
  private config: LighthouseConfig;
  private result: ValidationResult;

  constructor(configPath: string) {
    this.result = {
      success: true,
      errors: [],
      warnings: [],
      info: [],
    };
    this.config = {} as LighthouseConfig;
    this.loadConfig(configPath);
  }

  private loadConfig(configPath: string): void {
    try {
      // Use createRequire for CommonJS compatibility in ES modules
      const require = createRequire(import.meta.url);
      this.config = require(configPath);
    } catch (error) {
      this.result.success = false;
      this.result.errors.push(`Failed to load config: ${error}`);
    }
  }

  validate(): ValidationResult {
    this.validateStructure();
    this.validateCollectSettings();
    this.validateChromeFlags();
    this.validateAssertions();
    this.validateThresholds();
    this.validateUploadSettings();

    return this.result;
  }

  private validateStructure(): void {
    if (!this.config.ci) {
      this.addError('Missing required "ci" configuration object');
      return;
    }

    if (!this.config.ci.collect) {
      this.addError('Missing required "ci.collect" configuration');
    }

    if (!this.config.ci.assert) {
      this.addError('Missing required "ci.assert" configuration');
    }

    if (!this.config.ci.upload) {
      this.addError('Missing required "ci.upload" configuration');
    }
  }

  private validateCollectSettings(): void {
    const collect = this.config.ci?.collect;
    if (!collect) return;

    // Validate URLs
    if (!collect.url || !Array.isArray(collect.url)) {
      this.addError('ci.collect.url must be an array');
    } else if (collect.url.length === 0) {
      this.addWarning('ci.collect.url is empty - no URLs to test');
    }

    // Validate number of runs
    if (typeof collect.numberOfRuns !== 'number') {
      this.addError('ci.collect.numberOfRuns must be a number');
    } else if (collect.numberOfRuns < 1) {
      this.addError('ci.collect.numberOfRuns must be at least 1');
    } else if (collect.numberOfRuns > 5) {
      this.addWarning('ci.collect.numberOfRuns > 5 may slow down CI significantly');
    }

    // Validate settings
    if (!collect.settings) {
      this.addError('Missing ci.collect.settings');
      return;
    }

    this.validateLighthouseSettings(collect.settings);
  }

  private validateLighthouseSettings(
    settings: LighthouseConfig['ci']['collect']['settings'],
  ): void {
    // Validate preset
    const validPresets = ['perf', 'experimental', 'desktop'];
    if (!validPresets.includes(settings.preset)) {
      this.addWarning(
        `Unknown preset "${settings.preset}". Valid presets: ${validPresets.join(', ')}`,
      );
    }

    // Validate categories
    const validCategories = ['performance', 'accessibility', 'best-practices', 'seo', 'pwa'];
    if (settings.onlyCategories) {
      const invalidCategories = settings.onlyCategories.filter(
        (cat) => !validCategories.includes(cat),
      );
      if (invalidCategories.length > 0) {
        this.addWarning(`Unknown categories: ${invalidCategories.join(', ')}`);
      }
    }

    // Validate form factor
    const validFormFactors = ['mobile', 'desktop'];
    if (settings.emulatedFormFactor && !validFormFactors.includes(settings.emulatedFormFactor)) {
      this.addWarning(
        `Unknown emulatedFormFactor "${settings.emulatedFormFactor}". Valid: ${validFormFactors.join(', ')}`,
      );
    }

    // Validate throttling
    if (settings.throttling) {
      this.validateThrottlingSettings(settings.throttling);
    }
  }

  private validateThrottlingSettings(throttling: Record<string, unknown>): void {
    const requiredProps = ['rttMs', 'throughputKbps', 'cpuSlowdownMultiplier'];
    const missingProps = requiredProps.filter((prop) => !(prop in throttling));

    if (missingProps.length > 0) {
      this.addWarning(`Missing throttling properties: ${missingProps.join(', ')}`);
    }

    // Validate reasonable ranges
    if (typeof throttling.rttMs === 'number') {
      if (throttling.rttMs < 0 || throttling.rttMs > 1000) {
        this.addWarning('throttling.rttMs should be between 0-1000ms');
      }
    }

    if (typeof throttling.cpuSlowdownMultiplier === 'number') {
      if (throttling.cpuSlowdownMultiplier < 1 || throttling.cpuSlowdownMultiplier > 10) {
        this.addWarning('throttling.cpuSlowdownMultiplier should be between 1-10');
      }
    }
  }

  private validateChromeFlags(): void {
    const chromeFlags = this.config.ci?.collect?.settings?.chromeFlags;
    if (!chromeFlags) {
      this.addWarning('No Chrome flags specified - may cause issues in CI');
      return;
    }

    const flags = chromeFlags.split(' ').filter((flag) => flag.length > 0);
    const recommendedFlags = [
      '--no-sandbox',
      '--disable-dev-shm-usage',
      '--headless',
      '--disable-gpu',
    ];

    const missingRecommended = recommendedFlags.filter(
      (flag) => !flags.some((f) => f.startsWith(flag)),
    );

    if (missingRecommended.length > 0) {
      this.addWarning(`Missing recommended Chrome flags: ${missingRecommended.join(', ')}`);
    }

    // Check for deprecated flags
    const deprecatedFlags = ['--headless=old'];
    const foundDeprecated = flags.filter((flag) =>
      deprecatedFlags.some((dep) => flag.includes(dep)),
    );

    if (foundDeprecated.length > 0) {
      this.addWarning(`Deprecated Chrome flags found: ${foundDeprecated.join(', ')}`);
    }
  }

  private validateAssertions(): void {
    const assertions = this.config.ci?.assert?.assertions;
    if (!assertions) {
      this.addError('Missing ci.assert.assertions');
      return;
    }

    const assertionCount = Object.keys(assertions).length;
    if (assertionCount === 0) {
      this.addWarning('No assertions defined - Lighthouse CI will always pass');
    }

    // Validate assertion format
    for (const [key, assertion] of Object.entries(assertions)) {
      if (!Array.isArray(assertion) || assertion.length !== 2) {
        this.addError(`Invalid assertion format for "${key}": must be [level, config]`);
        continue;
      }

      const [level, config] = assertion;
      if (!['error', 'warn', 'off'].includes(level)) {
        this.addError(
          `Invalid assertion level "${level}" for "${key}": must be error, warn, or off`,
        );
      }

      if (typeof config !== 'object' || config === null) {
        this.addError(`Invalid assertion config for "${key}": must be an object`);
      }
    }
  }

  private validateThresholds(): void {
    const assertions = this.config.ci?.assert?.assertions;
    if (!assertions) return;

    // Check Core Web Vitals thresholds
    this.validateMetricThreshold('first-contentful-paint', 3000, 'ms');
    this.validateMetricThreshold('largest-contentful-paint', 4000, 'ms');
    this.validateMetricThreshold('cumulative-layout-shift', 0.25, 'CLS score');
    this.validateMetricThreshold('total-blocking-time', 600, 'ms');

    // Check category score thresholds
    this.validateCategoryThreshold('categories:performance', 0.5, 1.0);
    this.validateCategoryThreshold('categories:accessibility', 0.8, 1.0);
    this.validateCategoryThreshold('categories:best-practices', 0.5, 1.0);
    this.validateCategoryThreshold('categories:seo', 0.8, 1.0);

    // Check for deprecated metrics
    if (assertions['max-potential-fid']) {
      this.addWarning('max-potential-fid is deprecated, use total-blocking-time instead');
    }
  }

  private validateMetricThreshold(metric: string, maxReasonable: number, unit: string): void {
    const assertions = this.config.ci?.assert?.assertions;
    if (!assertions) return;

    const assertion = assertions[metric];
    if (!assertion) return;

    const [, config] = assertion;
    const threshold = (config as unknown)?.maxNumericValue;

    if (typeof threshold === 'number') {
      if (threshold <= 0) {
        this.addError(`${metric} threshold must be positive`);
      } else if (threshold > maxReasonable) {
        this.addWarning(
          `${metric} threshold ${threshold}${unit} seems very high (max reasonable: ${maxReasonable}${unit})`,
        );
      }
    }
  }

  private validateCategoryThreshold(
    category: string,
    minReasonable: number,
    maxValue: number,
  ): void {
    const assertions = this.config.ci?.assert?.assertions;
    if (!assertions) return;

    const assertion = assertions[category];
    if (!assertion) return;

    const [, config] = assertion;
    const threshold = (config as unknown)?.minScore;

    if (typeof threshold === 'number') {
      if (threshold < 0 || threshold > maxValue) {
        this.addError(`${category} threshold must be between 0 and ${maxValue}`);
      } else if (threshold < minReasonable) {
        this.addWarning(
          `${category} threshold ${threshold} seems very low (min reasonable: ${minReasonable})`,
        );
      }
    }
  }

  private validateUploadSettings(): void {
    const upload = this.config.ci?.upload;
    if (!upload) return;

    const validTargets = ['temporary-public-storage', 'lhci', 'filesystem'];
    if (!validTargets.includes(upload.target)) {
      this.addError(
        `Invalid upload target "${upload.target}". Valid targets: ${validTargets.join(', ')}`,
      );
    }

    if (upload.target === 'lhci') {
      this.addInfo('Using LHCI server - ensure serverBaseUrl and token are configured');
    }
  }

  private addError(message: string): void {
    this.result.errors.push(message);
    this.result.success = false;
  }

  private addWarning(message: string): void {
    this.result.warnings.push(message);
  }

  private addInfo(message: string): void {
    this.result.info.push(message);
  }
}

function formatResults(result: ValidationResult): string {
  const lines: string[] = [];

  if (result.success) {
    lines.push('✅ Lighthouse CI configuration validation passed');
  } else {
    lines.push('❌ Lighthouse CI configuration validation failed');
  }

  if (result.errors.length > 0) {
    lines.push('\n🚨 Errors:');
    result.errors.forEach((error) => lines.push(`  - ${error}`));
  }

  if (result.warnings.length > 0) {
    lines.push('\n⚠️  Warnings:');
    result.warnings.forEach((warning) => lines.push(`  - ${warning}`));
  }

  if (result.info.length > 0) {
    lines.push('\n📝 Info:');
    result.info.forEach((info) => lines.push(`  - ${info}`));
  }

  return lines.join('\n');
}

function main(): void {
  const configPath = path.resolve(process.cwd(), 'lighthouserc.js');

  if (!fs.existsSync(configPath)) {
    console.error('❌ lighthouserc.js not found in current directory');
    process.exit(1);
  }

  const validator = new LighthouseConfigValidator(configPath);
  const result = validator.validate();

  console.log(formatResults(result));

  if (!result.success) {
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { LighthouseConfigValidator, ValidationResult };
