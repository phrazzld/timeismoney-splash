import { URL } from 'node:url';
import process from 'node:process';

/**
 * Validates the NEXT_PUBLIC_SITE_URL environment variable.
 * Fails the build for production contexts if the variable is missing or invalid.
 */

const VAR_NAME = 'NEXT_PUBLIC_SITE_URL';
const siteUrl = process.env[VAR_NAME];
const isProductionContext = process.env.NODE_ENV === 'production';

let isValid = true;
let errorMessage = '';

console.log(`[ENV_VALIDATION] Validating ${VAR_NAME}...`);
console.log(`[ENV_VALIDATION] Detected NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`[ENV_VALIDATION] Is production context: ${isProductionContext}`);

if (!siteUrl) {
  errorMessage = `${VAR_NAME} is not set.`;
  if (isProductionContext) {
    isValid = false;
  } else {
    console.warn(
      `[ENV_VALIDATION] Warning: ${errorMessage} This variable is critical for production builds.`,
    );
  }
} else {
  try {
    const parsedUrl = new URL(siteUrl);

    // Validate protocol
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      errorMessage = `${VAR_NAME} ("${siteUrl}") has an invalid protocol. Must be http: or https:.`;
      if (isProductionContext) {
        isValid = false;
      } else {
        console.warn(`[ENV_VALIDATION] Warning: ${errorMessage}`);
      }
    }

    // Production-specific validation: no localhost URLs
    if (
      isProductionContext &&
      (parsedUrl.hostname === 'localhost' || parsedUrl.hostname === '127.0.0.1')
    ) {
      errorMessage = `${VAR_NAME} ("${siteUrl}") must not be a localhost URL in a production context.`;
      isValid = false;
    }
  } catch (error) {
    errorMessage = `${VAR_NAME} ("${siteUrl}") is not a valid URL. Error: ${
      error instanceof Error ? error.message : String(error)
    }`;
    if (isProductionContext) {
      isValid = false;
    } else {
      console.warn(`[ENV_VALIDATION] Warning: ${errorMessage}`);
    }
  }
}

// Handle validation results
if (!isValid && isProductionContext) {
  console.error(`\n❌ [ENV_VALIDATION] Critical Error: ${errorMessage}`);
  console.error(`   Build failed due to invalid or missing ${VAR_NAME} in a production context.`);
  console.error(
    `   Please ensure ${VAR_NAME} is correctly set in your environment variables for production deployments.\n`,
  );
  process.exit(1);
} else if (isValid && siteUrl) {
  console.log(
    `✅ [ENV_VALIDATION] ${VAR_NAME} is set to "${siteUrl}" and meets validation criteria for the current context.`,
  );
} else if (!siteUrl && !isProductionContext) {
  console.log(
    `ℹ️  [ENV_VALIDATION] ${VAR_NAME} is not set (non-production context). Build proceeds.`,
  );
} else if (!isValid && !isProductionContext) {
  console.log(
    `ℹ️  [ENV_VALIDATION] ${VAR_NAME} ("${siteUrl}") has validation warnings (non-production context). Build proceeds.`,
  );
}

// Validate GA_MEASUREMENT_ID
const GA_VAR_NAME = 'NEXT_PUBLIC_GA_MEASUREMENT_ID';
const gaMeasurementId = process.env[GA_VAR_NAME];

console.log(`\n[ENV_VALIDATION] Validating ${GA_VAR_NAME}...`);

if (!gaMeasurementId && isProductionContext) {
  console.error(`\n❌ [ENV_VALIDATION] Critical Error: ${GA_VAR_NAME} is not set.`);
  console.error(`   Build failed due to missing ${GA_VAR_NAME} in a production context.`);
  console.error(`   Please ensure ${GA_VAR_NAME} is set for production analytics tracking.\n`);
  process.exit(1);
} else if (gaMeasurementId) {
  // Validate GA Measurement ID format (should start with G- for GA4)
  if (!gaMeasurementId.startsWith('G-')) {
    if (isProductionContext) {
      console.error(`\n❌ [ENV_VALIDATION] Critical Error: ${GA_VAR_NAME} has invalid format.`);
      console.error(`   GA4 Measurement IDs must start with 'G-'.`);
      console.error(`   Current value: "${gaMeasurementId}"\n`);
      process.exit(1);
    } else {
      console.warn(`[ENV_VALIDATION] Warning: ${GA_VAR_NAME} should start with 'G-' for GA4.`);
    }
  } else {
    console.log(`✅ [ENV_VALIDATION] ${GA_VAR_NAME} is set to "${gaMeasurementId}".`);
  }
} else if (!gaMeasurementId && !isProductionContext) {
  console.log(
    `ℹ️  [ENV_VALIDATION] ${GA_VAR_NAME} is not set (non-production context). Analytics will be disabled.`,
  );
}
