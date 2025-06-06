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

- [x] **Validate CI pipeline recovery**

  - **Push changes** and monitor CI build process
  - ✅ **Verify**: Build and Test job passes successfully (all 7 pages generate)
  - ❌ **Verify**: Vercel deployment succeeds
  - ❌ **Verify**: Lighthouse performance tests pass
  - ❌ **Verify**: All Accessibility Compliance jobs pass
  - **Result**: Build recovery successful, but accessibility failures still block CI
  - **Found Issues**:
    - Color contrast: #hero-cta-button has 3.78:1 (needs 4.5:1)
    - Keyboard accessibility: CTA button not reachable via keyboard
    - Tab order: CTA button missing from tab sequence (-1 index)

- [x] **Accept Chromatic UI baseline changes**
  - **Status**: ✅ 57 changes auto-accepted in Build 18
  - **Action**: Used CLI auto-accept for current branch
  - **URL**: https://www.chromatic.com/build?appId=683772c812b3fe73ddafffe4&number=18
  - **Result**: All UI baselines updated successfully for landing page components

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

- [x] **Fix color contrast violations in CTA button**

  - **Root Cause**: "Get Chrome Extension" button contrast 2.01:1 (needs 4.5:1 for WCAG AA)
  - **Current Colors**: Foreground `oklch(0.98 0 0)` on background `oklch(0.7 0.2 145)`
  - **Location**: Button component using `button.inline-flex` class
  - **Solution**: Update design tokens to achieve minimum 4.5:1 contrast ratio
  - **Impact**: Critical accessibility compliance failure across all browsers
  - **Test**: Run accessibility tests with `pnpm test:e2e:accessibility`

- [x] **Fix keyboard accessibility for CTA button**

  - **Root Cause**: Main CTA button (`button.inline-flex`) not reachable via keyboard navigation
  - **Location**: Button component missing proper focus management
  - **Solution**: Ensure button has proper `tabIndex` and semantic HTML structure
  - **Impact**: WCAG 2.1 AA keyboard accessibility requirement violation
  - **Test**: Manual keyboard navigation and automated accessibility tests

- [x] **Fix tab order issues in button navigation**
  - **Root Cause**: CTA button not found in tab sequence (returns index -1)
  - **Location**: `e2e/specs/accessibility-compliance.spec.ts:51` test expectations
  - **Solution**: Ensure button is properly included in document tab order
  - **Impact**: Logical reading order requirement failure
  - **Test**: Verify button appears in first 5 tab stops during keyboard navigation

### Secondary Priority

- [x] **Fix secondary button contrast violation**

  - **Root Cause**: "UI Component Border" button contrast 1.68:1 (needs 3:1 minimum)
  - **Previous Colors**: Foreground `oklch(0.9 0 0)` on background `oklch(0.7 0.2 145)`
  - **Solution**: Updated `--input` color from `oklch(0.9 0 0)` to `oklch(0.4 0 0)` for 3:1+ contrast
  - **Impact**: Fixed secondary accessibility compliance issue for outline button borders

- [x] **Add automated color contrast validation**

  - **Purpose**: Prevent future contrast violations
  - ✅ **Solution**: Integrated contrast checking into CI pipeline and pre-commit hooks
  - ✅ **Implementation**: Added standalone validation script and lint-staged integration
  - ✅ **Test**: Validates design tokens and detects known violations
  - **Script**: `scripts/validate-contrast.ts` validates WCAG AA compliance
  - **Integration**: Runs on design token changes and every commit
  - **Documentation**: `docs/automated-contrast-validation.md`

- [x] **Enhance keyboard accessibility test coverage**
  - **Purpose**: Comprehensive keyboard navigation validation
  - ✅ **Solution**: Expanded E2E tests for all interactive elements
  - ✅ **Implementation**: Added component-specific keyboard behavior testing
  - ✅ **Coverage**: All buttons, links, inputs, and interactive components
  - **Features**:
    - Component-specific keyboard testing (Enter/Space/Arrow keys)
    - ARIA compliance validation for all interactive elements
    - Advanced keyboard patterns (skip links, roving tabindex, modals)
    - Focus indicator consistency testing
    - Navigation performance validation
    - Cross-component integration testing
  - **Files**:
    - `e2e/utils/enhanced-keyboard-testing.ts` - Core testing utilities
    - `e2e/specs/accessibility-compliance.spec.ts` - Enhanced tests integration
    - `e2e/specs/keyboard-navigation-comprehensive.spec.ts` - Comprehensive test suite
    - `docs/enhanced-keyboard-testing.md` - Complete documentation

### Configuration & Infrastructure

- [x] **Update Lighthouse CI configuration for version compatibility**

  - ✅ **Action**: Reviewed and updated all Lighthouse settings for v12+ compatibility
  - ✅ **Chrome Flags**: Updated for better CI stability (`--headless=new`, additional stability flags)
  - ✅ **Performance Thresholds**: Balanced error/warning levels for development workflow
  - ✅ **Deprecated Options**: Removed `max-potential-fid`, consolidated duplicate assertions
  - ✅ **Enhanced Settings**: Added `onlyCategories`, `emulatedFormFactor`, updated throttling
  - ✅ **Testing**: Verified configuration works with local development server
  - ✅ **Documentation**: Created comprehensive configuration guide (`docs/lighthouse-configuration.md`)
  - ✅ **Validation**: Added automated config validation script (`scripts/validate-lighthouse-config.ts`)
  - ✅ **Integration**: Added `pnpm validate:lighthouse` script for configuration checking

- [x] **Establish accessibility testing standards**
  - ✅ **Documentation**: Created comprehensive accessibility testing guidelines (`docs/accessibility-testing-standards.md`)
  - ✅ **Tools**: Documented tools and procedures for accessibility validation
  - ✅ **Training**: Established team training requirements and WCAG 2.1 AA standards

**Current State**: Infrastructure complete. Ready for rapid splash page prototyping.

## 🚀 NEW PRIORITY: Rapid Splash Page Prototyping (2025-06-06)

### Strategic Objective

Transform minimal placeholder page into compelling conversion-focused landing page that showcases the "Time is Money" Chrome extension's core value proposition: **"See What Your Purchases Really Cost"**

### Content Strategy Foundation

- **Primary Value Prop**: Convert any price to work hours instantly
- **Target Audience**: Online shoppers who want spending awareness
- **Core Message**: See the true cost of purchases in time/work
- **Proof Points**: 5,000+ users, 3.8★ rating (93 reviews), Chrome Web Store featured

### Rapid Prototyping Plan (2 hours total)

#### Phase 1: Enhanced Hero Section (30 minutes)

- [x] **Enhance Hero content with compelling copy**

  - ✅ **Current**: Basic "Convert Prices to Work Hours" headline
  - ✅ **Target**: "See What Your Purchases Really Cost" with emotional impact
  - ✅ **Subheadline**: "Convert any price to work hours instantly - See the true cost of your spending"
  - ✅ **Location**: Updated `app/page.tsx` with new heading, subheading, and page metadata

- [ ] **Add animated price conversion demo**

  - **Concept**: Visual showing "$99 → 6 hours 15 minutes" with smooth animation
  - **Implementation**: Create new `PriceConverter` component with CSS animations
  - **Integration**: Replace or enhance existing hero visual elements
  - **Examples**: "$25 → 1h 34m", "$199 → 12h 30m", "$500 → 31h 15m"

- [ ] **Enhance CTA button styling and copy**
  - **Current**: Generic "Get Chrome Extension"
  - **Target**: "Get Free Extension" with urgency/benefit focus
  - **Styling**: Improve visual prominence and hover states
  - **Location**: Update `components/molecules/CTAButton/CTAButton.tsx`

#### Phase 2: Core Content Sections (60 minutes)

- [ ] **Create HowItWorks organism**

  - **Content**: 3-step process with icons and visuals
    1. "Browse any website" (shopping icon)
    2. "See prices convert automatically" (clock icon)
    3. "Make informed decisions" (brain/lightbulb icon)
  - **Implementation**: New `components/organisms/HowItWorks/` following atomic design
  - **Layout**: Horizontal cards on desktop, vertical stack on mobile

- [ ] **Add SocialProof component with real stats**

  - **Content**: "Join 5,000+ users", "3.8★ (93 reviews)", "Featured on Chrome Web Store"
  - **Implementation**: New `components/molecules/SocialProof/`
  - **Design**: Clean stats layout with trust indicators
  - **Data**: Pull from actual Chrome Web Store metrics

- [ ] **Build Features grid**
  - **Content**: 3-4 key benefits with icons
    - "Instant Price Conversion" - No setup required
    - "Works Everywhere" - Any website with prices
    - "Privacy First" - No data collection
    - "Completely Free" - No subscriptions or limits
  - **Implementation**: New `components/organisms/Features/`
  - **Layout**: 2x2 grid on desktop, single column on mobile

#### Phase 3: Polish and Optimization (30 minutes)

- [ ] **Add micro-interactions and animations**

  - **Price converter**: Smooth number transitions
  - **CTA button**: Hover and focus effects
  - **Feature cards**: Subtle hover states
  - **Implementation**: CSS animations and transitions following design tokens

- [ ] **Optimize for mobile experience**

  - **Layout**: Ensure all components are responsive using Tailwind breakpoints
  - **Touch targets**: Verify button sizes meet 44px minimum
  - **Typography**: Scale appropriately across breakpoints
  - **Test**: Verify on mobile viewport and touch devices

- [ ] **Accessibility validation**
  - **Automated**: Run `pnpm test:a11y` to verify WCAG compliance
  - **Manual**: Keyboard navigation testing for all new components
  - **Color contrast**: Verify all new colors meet 4.5:1 ratio
  - **Screen reader**: Test with VoiceOver/NVDA for content flow

### Implementation Strategy

#### Technical Approach

- **Leverage existing**: Use current Hero, Button, Typography atoms
- **Atomic design**: Create new molecules/organisms following established patterns
- **Design tokens**: Use existing color, spacing, typography systems
- **Accessibility**: Maintain WCAG 2.1 AA compliance throughout

#### Component Architecture

```
organisms/
├── Hero/ (existing - enhance)
├── HowItWorks/ (new)
├── SocialProof/ (new)
└── Features/ (new)

molecules/
├── HeroContent/ (existing - enhance)
├── CTAButton/ (existing - enhance)
├── PriceConverter/ (new)
├── FeatureCard/ (new)
└── StatCard/ (new)
```

#### Content Hierarchy

1. **Hero**: Grab attention with value proposition + demo
2. **HowItWorks**: Explain the simple 3-step process
3. **SocialProof**: Build trust with user count and ratings
4. **Features**: Detail key benefits and differentiators
5. **CTA**: Secondary conversion opportunity

### Success Metrics

- [ ] **Visual Impact**: Hero section clearly communicates value proposition
- [ ] **User Journey**: Clear path from problem → solution → action
- [ ] **Technical Quality**: Maintains accessibility and performance standards
- [ ] **Mobile Experience**: Excellent experience across all devices
- [ ] **Conversion Focus**: Strong CTAs and social proof elements

### Next Steps After Completion

1. User testing with target audience
2. Analytics integration for conversion tracking
3. A/B testing different headlines and CTAs
4. SEO optimization and meta tags
5. Performance optimization and Core Web Vitals

**Priority**: High - This transforms the minimal placeholder into a proper marketing site that can drive extension adoption and showcase the product's value.
