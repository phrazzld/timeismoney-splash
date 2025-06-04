# TODO: Post-Implementation Cleanup

## ESLint/TypeScript Issues to Fix

### High Priority

- [x] Fix unused variable errors in test files (prefix with `_` or remove)
- [x] Add missing return type annotations across test files
- [x] Replace `require()` imports with ES6 imports in test files
- [x] Fix unsafe function type annotations

### Medium Priority

- [x] Clean up unused imports in infrastructure files
- [ ] Add proper type definitions for mock objects
- [ ] Standardize test file patterns

### Files needing attention:

- `__tests__/ci/performance-workflow.test.ts` - unused vars
- `__tests__/hooks/useScrollNavigation.test.ts` - require imports, return types
- `__tests__/integration/` - multiple files with require imports
- `__tests__/monitoring/` - unused vars, function types
- `lib/performance/` - unused imports and vars
- `lighthouserc.js` - require import, unused var

## Rationale for Current Commit

The current changes fix critical Next.js build errors:

1. Added 'use client' directives for React hooks compatibility
2. Updated web-vitals to remove deprecated FID metric
3. Fixed import paths for scroll utilities
4. Removed completed planning documents

All core functionality works correctly. The ESLint issues are primarily in test/infrastructure files and don't affect runtime behavior.
