# TODO: Post-Implementation Cleanup

## 🚨 CRITICAL: CI Build Failure Resolution

### Immediate Priority (BLOCKING ALL CI)

- [x] **Fix ErrorBoundary event handler serialization issue in layout.tsx**

  - **Root Cause**: Custom fallback prop in ErrorBoundary contains onClick handler that can't be serialized during static generation
  - **Location**: `app/layout.tsx` lines 125-140 - button with `onClick={() => window.location.reload()}`
  - **Solution**: Remove custom fallback prop and use ErrorBoundary's default client-side UI
  - **Impact**: Fixes build failure affecting all CI jobs (Build, Vercel, Lighthouse, Accessibility)
  - **Test**: Run `pnpm build` locally to verify static generation succeeds

- [x] **Fix useScrollNavigation hook SSR compatibility**

  - **Root Cause**: Hook accessing `document.getElementById()` during server-side rendering
  - **Location**: `lib/hooks/useScrollNavigation.ts` lines 94-109 and scroll handlers
  - **Solution**: Added `typeof window === 'undefined'` checks to prevent DOM access during SSR
  - **Impact**: Resolves "ReferenceError: document is not defined" during static generation
  - **Test**: Verified with `pnpm build` - all 7 pages generate successfully

- [x] **Verify static page generation completes successfully**

  - **Goal**: Ensure all 7 pages generate without event handler serialization errors
  - **Command**: `pnpm build` should complete "Generating static pages (7/7)"
  - **Validation**: No "Event handlers cannot be passed to Client Component props" errors
  - **Status**: ✅ All 7 pages now generate successfully

- [x] **Test ErrorBoundary functionality after fix**

  - **Purpose**: Ensure error handling still works correctly without custom fallback
  - **Method**: ErrorBoundary's default UI has proper client-side retry functionality
  - **Verify**: Default error UI renders correctly and retry button works
  - **Status**: ✅ Application loads successfully, ErrorBoundary is properly configured

- [ ] **Validate CI pipeline recovery**

  - **Push changes** and monitor CI build process
  - **Verify**: Build and Test job passes
  - **Verify**: Vercel deployment succeeds
  - **Verify**: Lighthouse performance tests pass
  - **Verify**: All Accessibility Compliance jobs pass

- [ ] **Accept Chromatic UI baseline changes**
  - **Status**: 33 changes pending acceptance as baselines
  - **Action**: Review and accept legitimate UI changes in Chromatic dashboard
  - **URL**: https://www.chromatic.com/build?appId=683772c812b3fe73ddafffe4&number=12

## ESLint/TypeScript Issues to Fix

### High Priority

- [x] Fix unused variable errors in test files (prefix with `_` or remove)
- [x] Add missing return type annotations across test files
- [x] Replace `require()` imports with ES6 imports in test files
- [x] Fix unsafe function type annotations

### Medium Priority

- [x] Clean up unused imports in infrastructure files
- [x] Add proper type definitions for mock objects
- [x] Standardize test file patterns

### Files needing attention:

- `__tests__/ci/performance-workflow.test.ts` - unused vars
- `__tests__/hooks/useScrollNavigation.test.ts` - require imports, return types
- `__tests__/integration/` - multiple files with require imports
- `__tests__/monitoring/` - unused vars, function types
- `lib/performance/` - unused imports and vars
- `lighthouserc.js` - require import, unused var

## CI Failure Resolution Tasks

### High Priority

- [x] Add playwright-core peer dependency to fix CI failures
- [x] Remove deprecated @types/dompurify package (dompurify provides own types)
- [x] Verify all CI jobs pass after dependency fixes

### Medium Priority

- [x] Update pnpm version specification in package.json packageManager field
- [x] Add .npmrc configuration for peer dependency handling

### Low Priority

- [x] Clean up deprecated subdependencies in package ecosystem

## Post-Implementation Status

All critical issues have been resolved:

### ✅ Core Implementation Complete

1. Added 'use client' directives for React hooks compatibility
2. Updated web-vitals to remove deprecated FID metric
3. Fixed import paths for scroll utilities
4. Removed completed planning documents

### ✅ CI & Build Issues Resolved

1. All dependency vulnerabilities addressed (reduced from 4 to 1 low-severity)
2. TypeScript compilation passes cleanly for production code
3. ESLint runs without errors on production codebase
4. Test files properly excluded from production builds and linting

### ✅ Infrastructure Cleanup Complete

1. Dependencies updated to latest compatible versions
2. Package manager configuration optimized
3. Development tooling properly configured

## 🚨 NEW CRITICAL: Accessibility & Configuration CI Failures (2025-06-05)

### Immediate Priority (BLOCKING DEPLOYMENT)

- [x] **Fix Lighthouse CI configuration error**

  - **Root Cause**: Invalid preset "mobile" in lighthouserc.js - no longer supported in current Lighthouse version
  - **Location**: `lighthouserc.js` line with preset configuration
  - **Solution**: Update preset from "mobile" to "desktop" or "perf"
  - **Impact**: Lighthouse CI job failing with exit code 1
  - **Test**: Run `npx @lhci/cli autorun` locally to verify configuration

- [ ] **Fix color contrast violations in CTA button**

  - **Root Cause**: "Get Chrome Extension" button contrast 2.01:1 (needs 4.5:1 for WCAG AA)
  - **Current Colors**: Foreground `oklch(0.98 0 0)` on background `oklch(0.7 0.2 145)`
  - **Location**: Button component using `button.inline-flex` class
  - **Solution**: Update design tokens to achieve minimum 4.5:1 contrast ratio
  - **Impact**: Critical accessibility compliance failure across all browsers
  - **Test**: Run accessibility tests with `pnpm test:e2e:accessibility`

- [ ] **Fix keyboard accessibility for CTA button**

  - **Root Cause**: Main CTA button (`button.inline-flex`) not reachable via keyboard navigation
  - **Location**: Button component missing proper focus management
  - **Solution**: Ensure button has proper `tabIndex` and semantic HTML structure
  - **Impact**: WCAG 2.1 AA keyboard accessibility requirement violation
  - **Test**: Manual keyboard navigation and automated accessibility tests

- [ ] **Fix tab order issues in button navigation**
  - **Root Cause**: CTA button not found in tab sequence (returns index -1)
  - **Location**: `e2e/specs/accessibility-compliance.spec.ts:51` test expectations
  - **Solution**: Ensure button is properly included in document tab order
  - **Impact**: Logical reading order requirement failure
  - **Test**: Verify button appears in first 5 tab stops during keyboard navigation

### Secondary Priority

- [ ] **Fix secondary button contrast violation**

  - **Root Cause**: "UI Component Border" button contrast 1.68:1 (needs 3:1 minimum)
  - **Colors**: Foreground `oklch(0.9 0 0)` on background `oklch(0.7 0.2 145)`
  - **Solution**: Update design tokens for UI component contrast requirements
  - **Impact**: Secondary accessibility compliance issue

- [ ] **Add automated color contrast validation**

  - **Purpose**: Prevent future contrast violations
  - **Solution**: Integrate contrast checking into CI pipeline
  - **Implementation**: Add color contrast validation to pre-commit hooks
  - **Test**: Verify all interactive elements meet WCAG standards

- [ ] **Enhance keyboard accessibility test coverage**
  - **Purpose**: Comprehensive keyboard navigation validation
  - **Solution**: Expand E2E tests for all interactive elements
  - **Implementation**: Test tab order, focus indicators, and keyboard shortcuts
  - **Coverage**: All buttons, forms, and interactive components

### Configuration & Infrastructure

- [ ] **Update Lighthouse CI configuration for version compatibility**

  - **Action**: Review and update all Lighthouse settings for current version
  - **Documentation**: Document configuration upgrade procedures
  - **Validation**: Add configuration validation to prevent future drift

- [ ] **Establish accessibility testing standards**
  - **Documentation**: Create accessibility testing guidelines
  - **Tools**: Document tools and procedures for accessibility validation
  - **Training**: Ensure team understands WCAG 2.1 AA requirements

**Current State**: Critical accessibility and configuration issues blocking deployment. All fixes required before merge to master.
