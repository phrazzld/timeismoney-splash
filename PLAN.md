# Plan: ESLint, Prettier, and Pre-commit Hook Configuration

## Chosen Approach (One‑liner)

Implement a robust, automated code quality and formatting enforcement system using ESLint, Prettier, Husky, and lint-staged, ensuring all code adheres to defined standards before commit and during CI, rooted in simplicity and maintainability.

## Architecture Blueprint

- **Modules / Packages**
  - `eslint`: Core static analysis tool. Responsibility: Define and enforce code quality rules (leveraging `eslint-config-next`, `@typescript-eslint/eslint-plugin`).
  - `@typescript-eslint/parser`: ESLint parser for TypeScript. Responsibility: Enable ESLint to understand TypeScript syntax.
  - `prettier`: Opinionated code formatter. Responsibility: Ensure consistent code style.
  - `eslint-config-prettier`: Disables ESLint rules that conflict with Prettier. Responsibility: Ensure Prettier and ESLint formatting rules don't clash.
  - `husky`: Git hooks manager. Responsibility: Trigger scripts at specific Git events (e.g., pre-commit).
  - `lint-staged`: File lister for Git staged files. Responsibility: Run commands only on files staged for commit, improving performance.
- **Public Interfaces / Contracts**
  - `eslint.config.mjs`: Single source-of-truth for ESLint configuration, including Next.js, TypeScript, and custom project rules.
  - `.prettierrc.js` (or `.json`): Single source-of-truth for Prettier formatting rules.
  - `package.json`:
    - `devDependencies`: Lists all tooling dependencies.
    - `scripts`: Provides commands for manual linting (`lint`), formatting (`format`, `format:check`).
    - `husky` configuration (via `prepare` script and `.husky/` directory).
    - `lint-staged` configuration: Defines commands to run on staged files.
  - `.husky/pre-commit`: Git hook script managed by Husky, executes `lint-staged`.
  - CI Workflow File (e.g., Vercel project settings or `.github/workflows/main.yml`): Defines CI steps, including mandatory linting and formatting checks that fail the build on violations.
- **Data Flow Diagram**

  ```mermaid
  graph TD
      A[Developer writes code] --> B{git add .};
      B --> C{git commit -m "..."};
      C -- Pre-commit Hook (Husky) --> D[lint-staged executes];
      D -- Staged Files --> E{Run ESLint --fix & Prettier --write};
      subgraph "Lint & Format Staged Files"
          direction LR
          E --> F{Violations Found?};
      end
      F -- Yes --> G[Auto-fix (if possible) & Stage Changes];
      G --> H{Remaining Errors?};
      F -- No --> I[Commit Proceeds];
      H -- Yes --> J[Commit Aborted - Fix Manually];
      H -- No --> I;
      I --> K[Developer Pushes Code];
      K -- Trigger --> L[CI Pipeline Starts];
      L --> M[Checkout Code];
      M --> N[Install Dependencies];
      N --> O[Run ESLint --max-warnings=0 .];
      O -- Violations --> P[CI Build Fails];
      O -- No Violations --> Q[Run Prettier --check .];
      Q -- Violations --> P;
      Q -- No Violations --> R[CI Build Succeeds / Continues];
  ```

- **Error & Edge‑Case Strategy**
  - **Linting/Formatting Violations (Local):** Pre-commit hook (Husky + lint-staged) blocks commits with violations. ESLint and Prettier attempt to auto-fix; unfixable errors require manual intervention.
  - **Linting/Formatting Violations (CI):** CI pipeline runs lint and format checks on the entire codebase. Any violation results in a failed build, preventing merge of non-compliant code. This is the ultimate source of truth.
  - **Configuration Conflicts (ESLint vs. Prettier):** `eslint-config-prettier` is used and placed last in the ESLint configuration array to disable ESLint's stylistic rules that conflict with Prettier.
  - **Performance of Pre-commit Hooks:** `lint-staged` ensures that linters and formatters run _only_ on staged files, significantly speeding up the pre-commit process, especially in large repositories.
  - **Bypassing Hooks:** Discouraged by `DEVELOPMENT_PHILOSOPHY.md`. The CI pipeline acts as a non-bypassable backstop. The `husky` setup can be configured to make bypassing harder if necessary, but policy and CI are primary.
  - **New Files:** `lint-staged` correctly picks up newly added staged files.
  - **Partial Commits:** `lint-staged` operates only on the content that is staged for commit.

## Detailed Build Steps

1.  **Install Development Dependencies:**
    Execute the following command to install Prettier, Husky, lint-staged, and necessary ESLint plugins/configs.

    ```bash
    pnpm add -D prettier husky lint-staged eslint-config-prettier @typescript-eslint/parser @typescript-eslint/eslint-plugin
    ```

    _Rationale: Minimal, targeted dependencies as per "Simplicity" and "Modularity"._

2.  **Configure Prettier:**
    Create a `.prettierrc.js` file in the project root.

    ```javascript
    // .prettierrc.js
    /** @type {import("prettier").Config} */
    const config = {
      semi: true,
      singleQuote: true,
      trailingComma: 'all', // Consistent with modern JS/TS practices
      printWidth: 100, // Balances readability and line length
      tabWidth: 2,
      arrowParens: 'always', // Improves clarity for arrow functions
      // Add other project-specific preferences if absolutely necessary,
      // but lean towards Prettier's defaults for simplicity.
    };

    export default config;
    ```

    Create a `.prettierignore` file in the project root, mirroring `.gitignore` and adding any generated files not intended for formatting (e.g., `package-lock.json`, `pnpm-lock.yaml`, `dist/`, `.next/`).
    _Rationale: "Formatting with Prettier is 'absolutely non-negotiable'". Central, versioned config._

3.  **Enhance ESLint Configuration (`eslint.config.mjs`):**
    Modify the existing `eslint.config.mjs` to integrate TypeScript-specific rules, Next.js best practices, and Prettier compatibility.

    ```javascript
    // eslint.config.mjs
    import { dirname } from 'node:path';
    import { fileURLToPath } from 'node:url';
    import { FlatCompat } from '@eslint/eslintrc';
    import globals from 'globals';
    import tseslint from 'typescript-eslint';
    import nextPlugin from '@next/eslint-plugin-next'; // Assuming this is how Next.js plugin is used in flat config
    import reactRecommended from 'eslint-plugin-react/configs/recommended.js';
    import reactJsxRuntime from 'eslint-plugin-react/configs/jsx-runtime.js';
    import prettierConfig from 'eslint-config-prettier'; // Used to disable conflicting rules

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);

    const compat = new FlatCompat({
      baseDirectory: __dirname,
      resolvePluginsRelativeTo: __dirname,
    });

    export default tseslint.config(
      {
        // Global ignores
        ignores: ['node_modules/', '.next/', 'dist/', '.DS_Store'],
      },
      // Base configurations
      ...tseslint.configs.recommendedTypeChecked, // Strictest TypeScript rules, requires parserOptions.project
      reactRecommended,
      reactJsxRuntime,
      {
        // Next.js specific configurations (ensure this is the correct way for flat config)
        plugins: {
          '@next/next': nextPlugin,
        },
        rules: {
          ...nextPlugin.configs.recommended.rules,
          ...nextPlugin.configs['core-web-vitals'].rules,
        },
      },

      // Custom rules and overrides
      {
        languageOptions: {
          parserOptions: {
            project: ['./tsconfig.json'], // Essential for type-aware linting
            tsconfigRootDir: __dirname,
          },
          globals: {
            ...globals.browser,
            ...globals.node,
          },
        },
        settings: {
          // Required for eslint-plugin-react
          react: {
            version: 'detect',
          },
        },
        rules: {
          // --- DEVELOPMENT_PHILOSOPHY_APPENDIX_TYPESCRIPT.md Enforcements ---
          '@typescript-eslint/no-explicit-any': [
            'error',
            { fixToUnknown: true, ignoreRestArgs: false },
          ],
          '@typescript-eslint/no-unused-vars': [
            'error',
            { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
          ],
          '@typescript-eslint/explicit-function-return-type': 'warn', // Start with warn, can move to error
          '@typescript-eslint/explicit-module-boundary-types': 'warn', // Start with warn
          '@typescript-eslint/no-misused-promises': ['error', { checksVoidReturn: false }], // Next.js often uses async void for event handlers

          // Disallow @ts-ignore, @ts-expect-error, @ts-nocheck, @ts-check without explanation
          '@typescript-eslint/ban-ts-comment': [
            'error',
            {
              'ts-expect-error': 'allow-with-description',
              'ts-ignore': 'allow-with-description',
              'ts-nocheck': 'allow-with-description',
              'ts-check': false, // Allow @ts-check for JS files
              minimumDescriptionLength: 10, // Require a meaningful explanation
            },
          ],
          // Forbid 'as any' - a stricter custom rule
          'no-restricted-syntax': [
            'error',
            {
              selector: "TSAsExpression[typeAnnotation.type='TSAnyKeyword']",
              message:
                "Type assertion to 'any' is forbidden. Use 'unknown' or a specific type. If 'any' is truly unavoidable, provide a detailed justification comment prefixed with '// ALLOWANCE: '.",
            },
            {
              selector: "TSTypeAssertion[typeAnnotation.type='TSAnyKeyword']",
              message:
                "Type assertion to 'any' is forbidden. Use 'unknown' or a specific type. If 'any' is truly unavoidable, provide a detailed justification comment prefixed with '// ALLOWANCE: '.",
            },
          ],
          // --- End Philosophy Enforcements ---

          // React specific
          'react/prop-types': 'off', // Handled by TypeScript
          'react/react-in-jsx-scope': 'off', // Next.js handles this
        },
      },

      // Prettier compatibility - MUST BE LAST
      // Use compat.config for eslint-config-prettier as it might be a legacy config
      ...compat.config(prettierConfig).map((config) => ({
        ...config,
        // Ensure Prettier rules apply to all relevant files it formats
        files: ['**/*.{js,jsx,ts,tsx,mjs,cjs}'],
      })),
    );
    ```

    _Rationale: Enforces "no any" and TypeScript best practices. Integrates with Next.js. Ensures Prettier compatibility. Type-aware linting is key._
    _Note: The Next.js ESLint plugin integration for flat config might need adjustment based on the `@next/eslint-plugin-next` version and its flat config support. The example above is a common pattern._

4.  **Add Scripts to `package.json`:**
    Define scripts for manual linting and formatting.

    ```json
    {
      "scripts": {
        "dev": "next dev --turbopack", // Preserve the existing turbopack flag
        "build": "next build",
        "start": "next start",
        "lint": "eslint . --ext .js,.jsx,.ts,.tsx,.mjs --max-warnings=0",
        "lint:fix": "eslint . --ext .js,.jsx,.ts,.tsx,.mjs --fix",
        "format": "prettier --write \"**/*.{js,jsx,ts,tsx,mjs,cjs,json,css,scss,md,mdx,html,yaml,yml}\"",
        "format:check": "prettier --check \"**/*.{js,jsx,ts,tsx,mjs,cjs,json,css,scss,md,mdx,html,yaml,yml}\"",
        "prepare": "husky"
      }
    }
    ```

    _Rationale: Provides unified, simple commands for developers and CI._

5.  **Configure Husky:**
    The `prepare` script (added in step 4) will run `husky` on `pnpm install`.
    Initialize Husky (if `prepare` script hasn't run yet or for first-time setup):

    ```bash
    pnpm husky
    ```

    Add the pre-commit hook:

    ```bash
    pnpm husky add .husky/pre-commit "pnpm lint-staged"
    ```

    Ensure `.husky/pre-commit` is executable (`chmod +x .husky/pre-commit`). Husky typically handles this.
    _Rationale: Automates hook setup for all developers. Minimal manual intervention._

6.  **Configure `lint-staged`:**
    Add the following configuration to your `package.json`:

    ```json
    {
      "lint-staged": {
        "*.{js,jsx,ts,tsx,mjs}": ["eslint --fix --max-warnings=0"],
        "*.{js,jsx,ts,tsx,mjs,cjs,json,css,scss,md,mdx,html,yaml,yml}": ["prettier --write"]
      }
    }
    ```

    _Rationale: Runs fast, targeted checks only on staged files. Auto-fixes where possible._

7.  **Configure CI Pipeline:**
    Update your CI workflow (e.g., Vercel project settings or `.github/workflows/main.yml`) to include steps for linting and formatting checks. These steps _must_ fail the build if violations are found.

    Example for GitHub Actions:

    ```yaml
    # .github/workflows/main.yml
    name: CI

    on: [push, pull_request]

    jobs:
      build_and_test:
        runs-on: ubuntu-latest
        steps:
          - name: Checkout Code
            uses: actions/checkout@v4

          - name: Setup PNPM
            uses: pnpm/action-setup@v3
            with:
              version: latest # Or your project's pnpm version

          - name: Setup Node.js
            uses: actions/setup-node@v4
            with:
              node-version: '20' # Or your project's Node.js version
              cache: 'pnpm'

          - name: Install Dependencies
            run: pnpm install --frozen-lockfile

          - name: Lint Code
            run: pnpm lint # Fails on errors due to --max-warnings=0

          - name: Check Formatting
            run: pnpm format:check # Fails if files are not formatted

          - name: Build Project
            run: pnpm build

          # Add other steps like running tests, deployment, etc.
    ```

    _Rationale: Enforces standards at the CI level, acting as the ultimate gatekeeper._

8.  **Initial Codebase Cleanup:**
    After setting up all configurations, run the formatters and linters on the entire codebase to establish a clean baseline.

    ```bash
    pnpm format
    pnpm lint:fix
    ```

    Review any changes, fix remaining lint errors manually, and commit.
    _Rationale: Ensures the project starts with compliant code._

9.  **Document the Workflow:**
    Update `README.md` or a `CONTRIBUTING.md` file:
    - Explain that pre-commit hooks are active and automatically installed via `pnpm install`.
    - List the available `package.json` scripts (`lint`, `format`, etc.).
    - State the policy that CI will fail on linting/formatting violations and that bypassing hooks locally is against development philosophy.
    - Briefly mention that editor integrations for ESLint/Prettier are highly recommended for real-time feedback.
      _Rationale: "Documentation" principle. Ensures developers are aware of the new standards and tools._

## Testing Strategy

- **Local Verification (Manual):**
  1.  Introduce a deliberate ESLint violation (e.g., use `any` where forbidden) in a staged file. Attempt to commit. Verify the commit is blocked and an error message is shown.
  2.  Introduce a deliberate Prettier formatting violation in a staged file. Attempt to commit. Verify Prettier auto-formats the file (if `lint-staged` is configured to do so and add back) or blocks the commit.
  3.  Ensure that after fixes, a clean commit proceeds smoothly.
  4.  Run `pnpm lint` and `pnpm format:check` manually to confirm they pass on a clean codebase.
- **CI Verification:**
  1.  Push a clean commit: Verify all CI checks (lint, format) pass.
  2.  (On a test branch) Push a commit with deliberate ESLint or Prettier violations: Verify the CI pipeline fails at the appropriate linting or formatting check step.
- **What to mock:** Not applicable for this tooling setup task. Testing involves direct interaction with the tools and Git.
- **Coverage targets:** Not applicable for tooling configuration. The goal is 100% enforcement of configured rules.

## Risk Matrix

| Risk                                                     | Severity | Mitigation                                                                                                                                 |
| :------------------------------------------------------- | :------- | :----------------------------------------------------------------------------------------------------------------------------------------- |
| Developers bypass pre-commit hooks (`--no-verify`)       | High     | CI pipeline enforces checks and fails the build (non-bypassable). Reinforce policy via `DEVELOPMENT_PHILOSOPHY.md` and team communication. |
| Configuration conflicts (ESLint vs. Prettier)            | Medium   | Use `eslint-config-prettier` as the last ESLint configuration. Thoroughly test the final configuration.                                    |
| Pre-commit hooks are too slow, disrupting workflow       | Medium   | `lint-staged` processes only staged files. If specific rules are slow, profile and optimize ESLint rule configuration.                     |
| CI pipeline misconfiguration (not failing on violations) | High     | Manually test CI pipeline with intentional violations to ensure it fails as expected. Review CI configuration carefully.                   |
| Inconsistent Node/pnpm versions causing hook issues      | Low      | Specify Node/pnpm versions in `package.json` (`engines` field) and CI. Use lockfiles (`pnpm-lock.yaml`).                                   |
| New dependencies introduce vulnerabilities               | Low      | Regularly run `pnpm audit`. Consider adding automated dependency vulnerability checks to CI.                                               |
| IDEs not picking up configurations correctly             | Low      | Ensure standard configuration file names are used. Provide basic guidance in documentation for VSCode (most common IDE).                   |

## Open Questions

1.  Are there any additional project-specific ESLint rules (e.g., custom naming conventions, specific import orders not covered by Prettier, complexity limits) that need to be codified in `eslint.config.mjs` beyond the standard Next.js/TypeScript recommendations and philosophy-driven rules already planned?
2.  Confirm the exact method for integrating `@next/eslint-plugin-next` within a flat `eslint.config.mjs` to ensure it aligns with the latest Next.js 15.3.2 practices. (The provided example is a common approach but should be verified against Next.js docs for flat config).
3.  Should any specific Prettier plugins be considered (e.g., `prettier-plugin-tailwindcss` if Tailwind CSS is in use and requires class sorting)?
4.  Is there a preferred mechanism or existing tool for enforcing commit message conventions (e.g., Conventional Commits via `commitlint`), and should this be integrated into Husky at this time or deferred?
