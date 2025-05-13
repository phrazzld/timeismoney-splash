# Todo

## Core Tooling Setup
- [x] **T001 · Chore · P0: install core development dependencies**
    - **Context:** PLAN.md > Detailed Build Steps > 1
    - **Action:**
        1. Run `pnpm add -D prettier husky lint-staged eslint-config-prettier @typescript-eslint/parser @typescript-eslint/eslint-plugin`.
    - **Done‑when:**
        1. Packages are listed in `devDependencies` in `package.json`.
        2. `pnpm-lock.yaml` is updated.
    - **Verification:**
        1. `pnpm install` completes successfully after the change.
    - **Depends‑on:** none

- [x] **T002 · Chore · P1: create prettier configuration file**
    - **Context:** PLAN.md > Detailed Build Steps > 2
    - **Action:**
        1. Create `.prettierrc.js` in the project root with the configuration specified in the plan.
    - **Done‑when:**
        1. `.prettierrc.js` exists and contains the exact configuration from the plan.
    - **Verification:**
        1. Run `pnpm prettier --check .` on a file known to conform to the rules; command passes.
    - **Depends‑on:** [T001]

- [x] **T003 · Chore · P1: create prettier ignore file**
    - **Context:** PLAN.md > Detailed Build Steps > 2
    - **Action:**
        1. Create `.prettierignore` in the project root.
        2. Populate it by mirroring `.gitignore` and adding specified generated files/directories (`package-lock.json`, `pnpm-lock.yaml`, `dist/`, `.next/`).
    - **Done‑when:**
        1. `.prettierignore` exists and contains the required ignore patterns.
    - **Verification:**
        1. Run `pnpm prettier --check .` does not report issues in ignored files (e.g., `pnpm-lock.yaml`).
    - **Depends‑on:** [T001]

- [ ] **T004 · Chore · P1: enhance eslint configuration (`eslint.config.mjs`)**
    - **Context:** PLAN.md > Detailed Build Steps > 3
    - **Action:**
        1. Modify `eslint.config.mjs` to use flat config structure as shown in the plan.
        2. Integrate base configs (`tseslint.configs.recommendedTypeChecked`, React, Next.js - using method confirmed by CLR002).
        3. Add custom rules enforcing philosophy (no-any, ban-ts-comment, etc.) and React overrides.
        4. Integrate `eslint-config-prettier` using `FlatCompat` as the *last* configuration item.
        5. Configure `parserOptions.project` pointing to `tsconfig.json`.
    - **Done‑when:**
        1. `eslint.config.mjs` matches the structure and rules specified in the plan.
        2. Type-aware linting is enabled via `parserOptions.project`.
        3. `eslint-config-prettier` is the last configuration applied.
    - **Verification:**
        1. Run `pnpm lint` on the codebase; ensure it runs without config errors (code errors are expected before cleanup).
        2. Temporarily add `any` to a file; verify `pnpm lint` reports the `@typescript-eslint/no-explicit-any` error.
        3. Temporarily add a formatting issue that ESLint might catch but Prettier allows/fixes differently; verify ESLint does *not* report it due to `eslint-config-prettier`.
    - **Depends‑on:** [T001, CLR002]

- [ ] **T005 · Chore · P1: add lint, format, and prepare scripts to `package.json`**
    - **Context:** PLAN.md > Detailed Build Steps > 4
    - **Action:**
        1. Add/update `lint`, `lint:fix`, `format`, `format:check`, and `prepare` scripts in `package.json` exactly as specified.
    - **Done‑when:**
        1. `package.json` contains the specified scripts.
    - **Verification:**
        1. Run `pnpm run lint -- --help` and `pnpm run format -- --help` execute successfully.
        2. Run `pnpm install` triggers the `husky` command output (from the `prepare` script).
    - **Depends‑on:** [T001]

- [ ] **T006 · Chore · P1: configure `lint-staged` in `package.json`**
    - **Context:** PLAN.md > Detailed Build Steps > 6
    - **Action:**
        1. Add the `lint-staged` configuration object to `package.json` as specified in the plan.
    - **Done‑when:**
        1. `package.json` contains the `lint-staged` configuration block targeting the correct file globs and commands.
    - **Verification:**
        1. Manually run `pnpm lint-staged --debug` (may require staging a file) to check configuration validity.
    - **Depends‑on:** [T001]

- [ ] **T007 · Chore · P1: configure husky pre-commit hook**
    - **Context:** PLAN.md > Detailed Build Steps > 5
    - **Action:**
        1. Ensure `prepare` script is in `package.json` (via T005).
        2. Run `pnpm husky` if `.husky/` directory doesn't exist (or `pnpm install` should have done this).
        3. Run `pnpm husky add .husky/pre-commit "pnpm lint-staged"`.
        4. Verify `.husky/pre-commit` is executable.
    - **Done‑when:**
        1. `.husky/pre-commit` file exists, contains `pnpm lint-staged`, and has execute permissions.
    - **Verification:**
        1. Stage a file and run `git commit -m "test"`; observe output indicating `lint-staged` was executed.
    - **Depends‑on:** [T005, T006]

- [ ] **T008 · Chore · P1: configure CI pipeline checks**
    - **Context:** PLAN.md > Detailed Build Steps > 7; Risk Matrix > CI pipeline misconfiguration
    - **Action:**
        1. Update the CI workflow file (e.g., `.github/workflows/main.yml`) with steps for `pnpm lint` and `pnpm format:check` after dependency install and before build.
        2. Ensure these steps fail the build on non-zero exit codes.
    - **Done‑when:**
        1. CI configuration file is updated with the mandatory lint and format check steps.
    - **Verification:**
        1. (Requires T014) Verify CI fails on violations.
        2. (Requires T013) Verify CI passes on clean code.
    - **Depends‑on:** [T005]

## Cleanup, Verification & Documentation
- [ ] **T009 · Chore · P2: perform initial codebase cleanup**
    - **Context:** PLAN.md > Detailed Build Steps > 8
    - **Action:**
        1. Run `pnpm format` on the entire codebase.
        2. Run `pnpm lint:fix` on the entire codebase.
        3. Manually review and fix any remaining lint errors reported by `pnpm lint`.
        4. Commit all the cleanup changes.
    - **Done‑when:**
        1. `pnpm format:check` passes.
        2. `pnpm lint` passes (exits 0, no errors/warnings due to `--max-warnings=0` in script).
        3. A commit containing only cleanup changes is created.
    - **Depends‑on:** [T002, T003, T004, T005, T006]

- [ ] **T010 · Chore · P2: document code quality workflow**
    - **Context:** PLAN.md > Detailed Build Steps > 9
    - **Action:**
        1. Update `README.md` or create/update `CONTRIBUTING.md`.
        2. Include sections explaining the automated hook setup, available scripts (`lint`, `format`, etc.), CI enforcement policy, and the policy against bypassing hooks.
    - **Done‑when:**
        1. Documentation accurately reflects the implemented workflow and policies.
    - **Verification:**
        1. A team member unfamiliar with the setup can understand the process from the documentation.
    - **Depends‑on:** [T007, T008]

- [ ] **T011 · Test · P2: verify local pre-commit hook for ESLint violations**
    - **Context:** PLAN.md > Testing Strategy > Local Verification
    - **Action:**
        1. Introduce a deliberate, non-auto-fixable ESLint violation (e.g., use `any`) in a file.
        2. Stage the file.
        3. Attempt to commit (`git commit -m "test"`).
    - **Done‑when:**
        1. The commit is blocked by the pre-commit hook.
        2. An error message from ESLint is displayed.
    - **Verification:**
        1. Fix the violation, stage the file again, and verify the commit now succeeds.
    - **Depends‑on:** [T004, T007]

- [ ] **T012 · Test · P2: verify local pre-commit hook for Prettier violations**
    - **Context:** PLAN.md > Testing Strategy > Local Verification
    - **Action:**
        1. Introduce a deliberate formatting violation (e.g., wrong indentation, missing semicolon) in a file.
        2. Stage the file.
        3. Attempt to commit (`git commit -m "test"`).
    - **Done‑when:**
        1. Prettier automatically formats the file (due to `prettier --write` in `lint-staged`).
        2. The commit succeeds with the auto-formatted file included.
    - **Verification:**
        1. Inspect the committed file; verify the formatting violation is fixed.
    - **Depends‑on:** [T002, T007]

- [ ] **T013 · Test · P2: verify CI passes on clean codebase**
    - **Context:** PLAN.md > Testing Strategy > CI Verification
    - **Action:**
        1. Ensure the current state of the main branch is clean (passes `pnpm lint` and `pnpm format:check`).
        2. Push the clean commit (or trigger CI on the clean main branch).
    - **Done‑when:**
        1. The CI pipeline completes successfully, passing the lint and format check steps.
    - **Verification:**
        1. Review CI logs to confirm successful execution of `pnpm lint` and `pnpm format:check`.
    - **Depends‑on:** [T008, T009]

- [ ] **T014 · Test · P2: verify CI fails on lint/format violations**
    - **Context:** PLAN.md > Testing Strategy > CI Verification; Risk Matrix > CI pipeline misconfiguration
    - **Action:**
        1. Create a test branch.
        2. Introduce a deliberate ESLint violation (non-auto-fixable) OR a Prettier formatting violation.
        3. Commit and push the test branch.
    - **Done‑when:**
        1. The CI pipeline fails.
        2. The failure occurs specifically at the `pnpm lint` or `pnpm format:check` step.
    - **Verification:**
        1. Review CI logs to confirm the failure step and error message.
    - **Depends‑on:** [T008]

## Risk Mitigation & Enhancements
- [ ] **T015 · Chore · P1: specify node and pnpm versions in `package.json` engines**
    - **Context:** PLAN.md > Risk Matrix > Inconsistent Node/pnpm versions
    - **Action:**
        1. Add or update the `engines` field in `package.json` specifying the project's required Node.js and pnpm versions (e.g., `"node": ">=20", "pnpm": ">=8"`).
    - **Done‑when:**
        1. `package.json` includes the `engines` field with appropriate version constraints.
    - **Verification:**
        1. (Optional) Attempt `pnpm install` with an incompatible Node/pnpm version; observe warning/error.
    - **Depends‑on:** none

- [ ] **T016 · Chore · P2: add dependency vulnerability audit to CI pipeline**
    - **Context:** PLAN.md > Risk Matrix > New dependencies introduce vulnerabilities
    - **Action:**
        1. Add a step to the CI workflow (after `pnpm install`) that runs `pnpm audit --prod` or `pnpm audit --audit-level=high`.
        2. Ensure the step fails the build if vulnerabilities meeting the threshold are found.
    - **Done‑when:**
        1. CI workflow includes a `pnpm audit` step configured to fail on relevant vulnerabilities.
    - **Verification:**
        1. (Optional) Temporarily add a known vulnerable dependency; verify the CI audit step fails.
    - **Depends‑on:** [T008]

- [ ] **T017 · Chore · P2: add IDE configuration guidance to documentation**
    - **Context:** PLAN.md > Risk Matrix > IDEs not picking up configurations
    - **Action:**
        1. Add a section to the documentation (created/updated in T010) with basic setup instructions for VSCode ESLint and Prettier extensions.
    - **Done‑when:**
        1. Documentation includes guidance for setting up common IDE extensions for real-time feedback.
    - **Verification:**
        1. Follow the instructions in a clean VSCode setup; verify extensions load and provide feedback based on project configs.
    - **Depends‑on:** [T010]

## Clarifications & Assumptions
- [ ] **CLR001 · Issue:** clarify if additional project-specific ESLint rules are needed
    - **Context:** PLAN.md > Open Questions > 1
    - **Blocking?:** no

- [ ] **CLR002 · Issue:** confirm correct flat-config integration method for `@next/eslint-plugin-next`
    - **Context:** PLAN.md > Open Questions > 2; PLAN.md > Detailed Build Steps > 3 (Note)
    - **Blocking?:** yes (for T004)

- [ ] **CLR003 · Issue:** clarify if specific Prettier plugins (e.g., Tailwind CSS) are required
    - **Context:** PLAN.md > Open Questions > 3
    - **Blocking?:** no

- [ ] **CLR004 · Issue:** clarify if commit message convention enforcement (e.g., commitlint) should be integrated now
    - **Context:** PLAN.md > Open Questions > 4
    - **Blocking?:** no