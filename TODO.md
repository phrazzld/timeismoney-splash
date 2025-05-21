# Todo

## DevOps & Tooling

- [x] **T100 · Fix · P1: Disable strict peer dependencies to temporarily fix CI**

  - **Context:** Issue #3 - CI Build Failures due to peer dependency conflicts
  - **Action:**
    1. Update `.npmrc` file to add `strict-peer-dependencies=false`
    2. Commit and push the change
  - **Done‑when:**
    1. CI builds pass with the updated `.npmrc` setting
  - **Verification:**
    1. PR builds successfully complete on CI
  - **Depends‑on:** none

- [ ] **T101 · Fix · P2: Update eslint-plugin-storybook to support eslint v9**

  - **Context:** Issue #3 - CI Build Failures
  - **Action:**
    1. Update eslint-plugin-storybook to the latest version (currently 0.12.0)
    2. Test compatibility with eslint v9
    3. If needed, investigate alternative solutions (downgrading eslint, etc.)
  - **Done‑when:**
    1. CI builds pass without disabling strict peer dependencies
    2. All eslint and storybook functionality works correctly
  - **Verification:**
    1. CI build passes with strict-peer-dependencies=true
    2. Manual verification of storybook functionality
  - **Depends‑on:** T100

- [x] **T102 · Feature · P1: Add basic Storybook configuration files**

  - **Context:** CI failures due to missing Storybook configuration
  - **Action:**
    1. Create `.storybook` directory with required config files (main.js, preview.js)
    2. Configure main.js with correct story patterns and addons
    3. Configure preview.js to import global CSS and set parameters
  - **Done‑when:**
    1. Storybook starts properly with `npm run storybook`
    2. CI can build Storybook without errors
  - **Verification:**
    1. Storybook runs locally without errors
    2. Chromatic builds successfully in CI
  - **Depends‑on:** none

- [x] **T103 · Feature · P1: Create design token stories for colors**

  - **Context:** Need to visualize design tokens in Storybook for team reference
  - **Action:**
    1. Create a `stories/design-tokens` directory
    2. Create `Colors.stories.tsx` to display the color palette
    3. Import and display all colors from `design-tokens/colors.ts`
  - **Done‑when:**
    1. All colors are correctly displayed in Storybook
    2. Each color shows its name and hex value
  - **Verification:**
    1. Visual verification in Storybook
    2. Successful Chromatic build with color stories
  - **Depends‑on:** T102

- [ ] **T104 · Feature · P2: Create typography design token stories**

  - **Context:** Need to document typography styles in Storybook
  - **Action:**
    1. Create `Typography.stories.tsx` in the design-tokens directory
    2. Import and display all typography tokens from `design-tokens/typography.ts`
    3. Show all text styles with appropriate examples
  - **Done‑when:**
    1. All typography styles are displayed with examples
    2. Font families, sizes, weights, and line heights are documented
  - **Verification:**
    1. Visual verification in Storybook
    2. Successful Chromatic build with typography stories
  - **Depends‑on:** T102, T103

- [ ] **T105 · Setup · P2: Configure Chromatic for visual regression testing**

  - **Context:** Need reliable visual testing for design tokens and components
  - **Action:**
    1. Set up Chromatic GitHub integration if not already done
    2. Configure Chromatic project settings
    3. Add Chromatic to the CI workflow
  - **Done‑when:**
    1. Chromatic builds complete successfully in CI
    2. Visual regression testing is working properly
    3. Team can review UI changes through Chromatic
  - **Verification:**
    1. Successful Chromatic build in CI
    2. UI change detection working as expected
  - **Depends‑on:** T102, T103

- [ ] **T106 · Security · P3: Add CI check for peer dependency issues**

  - **Context:** Prevent future CI failures due to dependency issues
  - **Action:**
    1. Research tools/scripts to detect peer dependency conflicts
    2. Add check to pre-commit hooks or CI pipeline
    3. Document the check in the CONTRIBUTING.md file
  - **Done‑when:**
    1. CI pipeline or pre-commit hook detects peer dependency issues before they cause failures
  - **Verification:**
    1. Test with a deliberate peer dependency conflict to ensure detection
  - **Depends‑on:** T100, T101
