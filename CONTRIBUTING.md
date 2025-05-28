# Contributing to Time Is Money Marketing Site

This document outlines the process and standards for contributing to the Time Is Money marketing site. Following these guidelines ensures code quality and maintains project standards.

## Development Philosophy

Our development follows strict principles of simplicity, modularity, testability, explicitness, and automation. We prioritize code quality at every step of the development process through automated tools and checks.

## Development Environment Setup

### Prerequisites

- Node.js >=20
- pnpm >=8 (REQUIRED - enforced by multiple mechanisms)
- VSCode (recommended) or another editor with ESLint and Prettier support

### Package Manager Requirements

**This project strictly enforces pnpm usage.** Do not use npm or yarn.

Enforcement mechanisms:

- `.npmrc` prevents npm/yarn lockfile creation
- Preinstall script blocks non-pnpm installations
- Git hooks check for unwanted lockfiles
- CI pipeline validates pnpm usage
- Corepack enforces the declared package manager

If you encounter package manager errors:

1. Ensure pnpm is installed: `npm install -g pnpm`
2. Remove any `package-lock.json` or `yarn.lock` files
3. Run `pnpm install`

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd timeismoney-splash

# Install dependencies (MUST use pnpm)
pnpm install
```

The `pnpm install` command will automatically set up Husky pre-commit hooks through the `prepare` script in package.json.

### IDE Configuration

For the best development experience, we recommend using VSCode with the following extensions. These provide real-time feedback for code quality issues and automatic formatting.

#### VSCode Setup

1. **Install Required Extensions:**

   - [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) - Integrates ESLint into VSCode
   - [Prettier - Code formatter](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) - Integrates Prettier into VSCode

2. **Configure VSCode Settings:**

   Add the following to your VSCode workspace settings (`.vscode/settings.json`) or user settings:

   ```json
   {
     "editor.formatOnSave": true,
     "editor.defaultFormatter": "esbenp.prettier-vscode",
     "eslint.enable": true,
     "eslint.format.enable": false,
     "[typescript]": {
       "editor.defaultFormatter": "esbenp.prettier-vscode"
     },
     "[typescriptreact]": {
       "editor.defaultFormatter": "esbenp.prettier-vscode"
     },
     "[javascript]": {
       "editor.defaultFormatter": "esbenp.prettier-vscode"
     },
     "[javascriptreact]": {
       "editor.defaultFormatter": "esbenp.prettier-vscode"
     }
   }
   ```

3. **Verify Your Setup:**
   - Open any `.ts` or `.tsx` file in the project
   - You should see ESLint warnings/errors in the Problems panel (View → Problems)
   - When you save a file, it should automatically format according to Prettier rules
   - Hovering over ESLint errors should show fix suggestions

#### Troubleshooting

- **Extensions not working?**

  - Restart VSCode after installing extensions
  - Ensure extensions are enabled for the workspace
  - Check the VSCode Output panel (View → Output) and select "ESLint" or "Prettier" for error logs

- **Formatting conflicts?**

  - Make sure ESLint doesn't conflict with Prettier by ensuring `eslint.format.enable` is set to `false`
  - Prettier should be your default formatter for all JavaScript and TypeScript files

- **ESLint not detecting issues?**
  - Run `pnpm lint` in the terminal to verify ESLint is configured correctly
  - Check if the ESLint extension is using the correct Node version (should match your terminal)

## Code Quality Tools

This project enforces code quality through several automated tools:

### 1. ESLint

We use ESLint with TypeScript support to statically analyze our code. Our configuration enforces strict TypeScript rules and prevents common errors.

```bash
# Run ESLint to check for issues
pnpm lint

# Run ESLint with automatic fixing where possible
pnpm lint:fix
```

### 2. Prettier

Prettier enforces consistent code formatting across the project. Format rules are defined in `.prettierrc.js` and ignored paths in `.prettierignore`.

```bash
# Format all files
pnpm format

# Check if files are properly formatted
pnpm format:check
```

### 3. Husky Pre-commit Hooks

Husky runs pre-commit hooks to ensure code quality before each commit. **These hooks are mandatory and must not be bypassed**. The pre-commit hook runs:

- ESLint on staged JavaScript and TypeScript files
- Prettier on all supported staged files

### 4. lint-staged

lint-staged runs the linters and formatters only on the files that are staged for commit, making the process efficient.

## Available Scripts

| Script              | Description                                          |
| ------------------- | ---------------------------------------------------- |
| `pnpm dev`          | Starts the development server using Turbopack        |
| `pnpm build`        | Builds the application for production                |
| `pnpm start`        | Starts the production server                         |
| `pnpm lint`         | Lints the codebase with ESLint (no warnings allowed) |
| `pnpm lint:fix`     | Lints and automatically fixes issues where possible  |
| `pnpm format`       | Formats all files with Prettier                      |
| `pnpm format:check` | Checks if files are properly formatted               |

## Commit Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification for commit messages. This enables automatic versioning and changelog generation.

### Format

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Types

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation-only changes
- `style`: Changes that do not affect the meaning of the code (white-space, formatting, etc.)
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `perf`: A code change that improves performance
- `test`: Adding missing or correcting existing tests
- `chore`: Changes to the build process or auxiliary tools and libraries
- `ci`: Changes to CI configuration files and scripts

### Examples

```
feat(auth): add user login functionality
fix(dashboard): correct date formatting in reports
docs: update API documentation
chore: update dependencies
```

## CI Pipeline

Our GitHub Actions workflow automatically runs on all pushed branches and pull requests. The pipeline:

1. Sets up Node.js and pnpm
2. Installs dependencies
3. Checks formatting with Prettier
4. Lints code with ESLint
5. Builds the application

**All checks must pass** before code can be merged into the main branch.

## Dependency Management

### Peer Dependencies

This project enforces strict peer dependency checking to prevent runtime issues and ensure compatibility.

#### Automatic Checks

1. **Pre-commit Hook**: Runs `pnpm doctor` to detect peer dependency issues (and other problems) before commits
2. **CI Pipeline**: Enforces peer dependencies via `strict-peer-dependencies=true` in `.npmrc`

#### Resolving Peer Dependency Issues

When you encounter peer dependency conflicts:

1. **Check the error message**: Run `pnpm install` to see detailed information about the conflict
2. **Update packages**: Try updating the conflicting packages:
   ```bash
   pnpm update <package-name>
   # or update all packages
   pnpm update
   ```
3. **Check compatibility**: Research if the packages are actually compatible despite the version mismatch
4. **Add exceptions (if justified)**: For known-compatible packages, add rules to `package.json`:
   ```json
   {
     "pnpm": {
       "peerDependencyRules": {
         "ignoreMissing": ["@types/react"],
         "allowedVersions": {
           "react": "17.x || 18.x"
         }
       }
     }
   }
   ```

#### Manual Checks

- Run `pnpm doctor` for a comprehensive health check
- Run `pnpm install` to verify all dependencies are correctly resolved
- Run `pnpm ls` to inspect the dependency tree
- Run `node scripts/check-peer-deps.mjs` for a focused peer dependency check

#### Best Practices

1. Always resolve peer dependency issues before committing
2. Keep dependencies up to date with regular updates
3. Document any peer dependency exceptions in code comments
4. Test thoroughly after resolving dependency conflicts

## Quality Policy

- **Pre-commit hooks are MANDATORY** and must be run before every commit
- **Bypassing hooks (e.g., using `--no-verify`) is STRICTLY FORBIDDEN**
- All code must pass the CI pipeline before being merged
- No ESLint errors or warnings are accepted (strict `--max-warnings=0` policy)
- All code must be properly formatted according to Prettier rules
- All peer dependency issues must be resolved before committing

## Definition of Done

A task is considered complete only when it meets all applicable criteria below:

### General Criteria (All Tasks)

1. All code changes are implemented according to specifications
2. Code passes all linting and formatting checks
3. All tests pass (unit, integration, and any relevant E2E tests)
4. The build completes successfully
5. Code has been reviewed and approved (for PRs)
6. Changes are merged to the main branch
7. CI pipeline passes all checks

### External Service Integration Tasks

For tasks that integrate external services (e.g., analytics, monitoring, deployment platforms, visual testing tools), the following additional criteria must be met:

1. **External Setup Complete**: All required external accounts, projects, or configurations are created and properly configured
2. **Secrets Configured**: All required API keys, tokens, or credentials are:
   - Generated from the external service
   - Added to the appropriate secret storage (e.g., GitHub repository secrets)
   - Verified to be correctly named and accessible
3. **Service Verification**: The external service integration has been verified by:
   - Successfully executing in the CI pipeline at least once
   - Confirming data/functionality flows correctly to/from the external service
   - Reviewing any dashboards or interfaces to ensure proper connection

**Important**: A task involving external services is NOT complete if the code is merged but the service is not functional in CI/production due to missing configuration.

## Pull Request Process

1. Create a branch from `main` for your changes
2. Make your changes, following the code quality guidelines
3. Ensure all lint, format, and build checks pass locally
4. Submit a PR to the `main` branch
5. Wait for CI checks to pass
6. Address any review feedback
7. Once approved, your changes will be merged
