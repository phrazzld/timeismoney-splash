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

- [x] **T101 · Fix · P2: Update eslint-plugin-storybook to support eslint v9**

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

- [x] **T104 · Feature · P2: Create typography design token stories**

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

- [x] **T105 · Setup · P2: Configure Chromatic for visual regression testing** _(Awaiting manual token setup)_

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

- [x] **T106 · Security · P3: Add CI check for peer dependency issues**

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

## CI/CD Infrastructure

- [x] **T107 · Chore · P0: Add `CHROMATIC_PROJECT_TOKEN` to GitHub repository secrets**

  - **Context:** CI Resolution Plan - Immediate Action Required - Add Chromatic Project Token
  - **Action:**
    1. Repository Admin: Sign in to Chromatic (https://www.chromatic.com/start) using GitHub authentication
    2. Repository Admin: Create/select the project for `phrazzld/timeismoney-splash` and copy the project token from the project's Manage screen
    3. Repository Admin: Navigate to the `phrazzld/timeismoney-splash` GitHub repository Settings → Secrets and variables → Actions, create a new repository secret named `CHROMATIC_PROJECT_TOKEN`, paste the copied token value, and save
  - **Done‑when:**
    1. The `CHROMATIC_PROJECT_TOKEN` secret is present and correctly configured in the `phrazzld/timeismoney-splash` GitHub repository secrets
  - **Verification:**
    1. Navigate to GitHub repository Settings → Secrets and variables → Actions
    2. Confirm `CHROMATIC_PROJECT_TOKEN` is listed (value will be masked)
  - **Depends‑on:** none

- [x] **T108 · Test · P0: Verify Chromatic workflow passes on PR #2 after token addition**

  - **Context:** CI Resolution Plan - Immediate Action Required - Verify Fix
  - **Action:**
    1. Re-run the failed Chromatic GitHub Action workflow on PR #2 in the `phrazzld/timeismoney-splash` repository
    2. Monitor the workflow logs for successful execution
  - **Done‑when:**
    1. The "Publish to Chromatic" step in the Chromatic workflow on PR #2 completes successfully
    2. The Chromatic CI check shows a green/passed status on PR #2
    3. Visual regression testing functionality is confirmed by reviewing the build on Chromatic for PR #2
  - **Verification:**
    1. Observe the GitHub Checks tab on PR #2; the Chromatic status should be green
    2. Click the Chromatic build link from the PR check and confirm visual tests are running or have passed
  - **Depends‑on:** T107

## CI/CD Workflow

- [ ] **T109 · Refactor · P1: Implement pre-flight check for `CHROMATIC_PROJECT_TOKEN` in CI workflow**

  - **Context:** CI Resolution Plan - Process Improvements - Add Pre-flight Secret Check
  - **Action:**
    1. Modify the `.github/workflows/chromatic.yml` file in the `phrazzld/timeismoney-splash` repository
    2. Add a new step before the Chromatic execution step to check for `CHROMATIC_PROJECT_TOKEN` presence using the script:
       ```yaml
       - name: Check for Chromatic Project Token
         run: |
           if [ -z "${{ secrets.CHROMATIC_PROJECT_TOKEN }}" ]; then
             echo "::error::CHROMATIC_PROJECT_TOKEN is not set. Please add it as a GitHub repository secret."
             exit 1
           fi
       ```
  - **Done‑when:**
    1. The `.github/workflows/chromatic.yml` file is updated to include the pre-flight check
    2. The Chromatic workflow fails with the specified error message if the `CHROMATIC_PROJECT_TOKEN` secret is not set
    3. The workflow proceeds normally past the check if the secret is set
  - **Verification:**
    1. On a test branch, temporarily remove or misconfigure the `CHROMATIC_PROJECT_TOKEN` secret (if repository admin access allows safe testing)
    2. Trigger the Chromatic workflow and confirm it fails at the new check step with the "CHROMATIC_PROJECT_TOKEN is not set" error message
    3. Restore the secret and confirm the workflow passes the check
  - **Depends‑on:** none

## Development Process

- [ ] **T110 · Chore · P1: Update definition of done for tasks with external service integrations**

  - **Context:** CI Resolution Plan - Process Improvements - Update Definition of Done
  - **Action:**
    1. Identify the project's primary "Definition of Done" documentation (e.g., `CONTRIBUTING.md`, team wiki)
    2. Amend the Definition of Done to explicitly state that tasks integrating external services are only "complete" when: all code changes are merged, external accounts/projects are created, **all required secrets are configured and verified**, and the service executes successfully in CI at least once
  - **Done‑when:**
    1. The project's official Definition of Done documentation is updated to include the new criteria for external service integration tasks
  - **Verification:**
    1. Review the updated documentation to confirm the new criteria are present, clear, and accurately reflect the plan
  - **Depends‑on:** none

- [ ] **T111 · Chore · P2: Document CI process improvements in `CONTRIBUTING.md`**

  - **Context:** CI Resolution Plan - Verification Checklist - Process improvements documented in CONTRIBUTING.md
  - **Action:**
    1. Edit the `CONTRIBUTING.md` file (or the project's main developer contribution guide)
    2. Document the updated Definition of Done criteria for external service integrations (referencing outcome of T110)
    3. Document the existence and purpose of the pre-flight secret check in the Chromatic CI workflow (referencing outcome of T109)
  - **Done‑when:**
    1. `CONTRIBUTING.md` (or equivalent developer guide) is updated to reflect the new process improvements regarding external service secret configuration and CI checks
  - **Verification:**
    1. Review the updated `CONTRIBUTING.md` to ensure the process improvements are clearly and accurately documented for developers
  - **Depends‑on:** T109, T110

## Documentation

- [ ] **T112 · Chore · P2: Enhance `docs/chromatic-setup.md` with mandatory token setup and verification**

  - **Context:** CI Resolution Plan - Process Improvements - Documentation Updates
  - **Action:**
    1. Edit the `docs/chromatic-setup.md` file in the `phrazzld/timeismoney-splash` repository
    2. Emphasize that configuring the `CHROMATIC_PROJECT_TOKEN` is a mandatory prerequisite for Chromatic integration
    3. Add clear, actionable verification steps for users to confirm their Chromatic setup (including token configuration) is correct and functional (e.g., how to trigger a test run, what to look for)
  - **Done‑when:**
    1. `docs/chromatic-setup.md` clearly states that `CHROMATIC_PROJECT_TOKEN` setup is mandatory
    2. `docs/chromatic-setup.md` includes actionable verification steps for the complete Chromatic setup
  - **Verification:**
    1. Review the updated `docs/chromatic-setup.md` for clarity, accuracy, and completeness of the new information
  - **Depends‑on:** none
