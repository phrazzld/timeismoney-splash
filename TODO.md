# Todo

## Clarifications & Initial Setup

- [x] **T001 · Clarification · P0: obtain specific "green hourglass" theme color values**

  - **Context:** Open Questions #1; Phase 1, Step 1
  - **Action:**
    1. Request and document the precise `oklch` (or hex/HSL) values for primary green, accent (e.g., sand/gold), and other brand colors.
  - **Done‑when:**
    1. Authoritative color values are received and documented.
  - **Blocking?:** yes (for T004)
  - **Depends‑on:** none

- [~] **T002 · Clarification · P0: confirm typography specifics beyond defaults**

  - **Context:** Open Questions #2; Phase 1, Step 2
  - **Action:**
    1. Request and document any specific font weights or letter spacing requirements for different typography variants beyond `Geist Sans/Mono` defaults.
  - **Done‑when:**
    1. Typography specifics are received and documented, or confirmation that defaults are sufficient.
  - **Blocking?:** yes (for T005)
  - **Depends‑on:** none

- [x] **T003 · Clarification · P0: obtain logo asset details and variants**

  - **Context:** Open Questions #3; Phase 3, Step 14
  - **Action:**
    1. Request and document the logo asset (SVG preferred), including any different versions (logomark, logotype, full) and path to the asset.
  - **Done‑when:**
    1. Logo asset(s) and variant information are received and documented.
  - **Blocking?:** yes (for T025)
  - **Depends‑on:** none

- [x] **T004 · Clarification · P1: confirm specific core lucide-react icon names**

  - **Context:** Open Questions #4; Phase 3, Step 13
  - **Action:**
    1. Request and document the exact `lucide-react` names for "clock" and "money" (e.g., `Clock`, `Timer`, `DollarSign`, `Coins`).
    2. Confirm if any other specific icons are immediately required.
  - **Done‑when:**
    1. List of required `lucide-react` icon names is received and documented.
  - **Blocking?:** no (can proceed with placeholders, but better to have)
  - **Depends‑on:** none

- [x] **T005 · Chore · P1: implement `cn` utility for class composition**
  - **Context:** Phase 3, General Step b; Risk Matrix: Styling Conflicts
  - **Action:**
    1. Install `clsx` and `tailwind-merge` dependencies.
    2. Create a `cn` utility function (e.g., in `lib/utils.ts`) that combines `clsx` and `tailwind-merge`.
    3. Ensure the utility is correctly typed and exported.
  - **Done‑when:**
    1. `cn` utility function is implemented, tested, and available for use.
  - **Depends‑on:** none

## Design Tokens & Tailwind Integration

- [x] **T006 · Feature · P1: define brand color palette design tokens**

  - **Context:** Phase 1, Step 1; Architecture Blueprint (Design Tokens `BrandColors`)
  - **Action:**
    1. Create a JS/TS object (e.g., in a dedicated tokens file or `tailwind.config.ts`) defining primary, secondary, accent, neutral, and semantic colors based on values from T001.
    2. Specify colors using `oklch` format.
    3. Define the `BrandColors` TypeScript interface.
  - **Done‑when:**
    1. Color token object and interface are created and reviewed.
    2. Values match confirmed brand guidelines.
  - **Verification:**
    1. Code review of token definitions.
  - **Depends‑on:** [T001]

- [x] **T007 · Feature · P1: define typography scale design tokens**

  - **Context:** Phase 1, Step 2; Architecture Blueprint (Design Tokens `TypographyTokens`)
  - **Action:**
    1. Create a JS/TS object defining font families (`Geist Sans`, `Geist Mono`), font sizes, weights, and line heights for all specified variants, based on values from T002.
    2. Define the `TypographyTokens` TypeScript interface.
  - **Done‑when:**
    1. Typography token object and interface are created and reviewed.
    2. Values match confirmed typography guidelines.
  - **Verification:**
    1. Code review of token definitions.
  - **Depends‑on:** [T002]

- [x] **T008 · Feature · P1: define spacing scale design tokens**

  - **Context:** Phase 1, Step 3; Architecture Blueprint (Design Tokens `SpacingTokens`)
  - **Action:**
    1. Create a JS/TS object defining a consistent spacing scale (e.g., 4px or 8px base unit).
    2. Define the `SpacingTokens` TypeScript interface.
  - **Done‑when:**
    1. Spacing token object and interface are created and reviewed.
  - **Verification:**
    1. Code review of token definitions.
  - **Depends‑on:** none

- [x] **T009 · Feature · P1: integrate design tokens into tailwind.config.ts**

  - **Context:** Phase 1, Step 4; `tailwind.config.ts`
  - **Action:**
    1. Modify `tailwind.config.ts` to extend `theme` with the color (T006), typography (T007), and spacing (T008) tokens.
    2. Configure Tailwind's `darkMode` strategy to `class`.
  - **Done‑when:**
    1. `tailwind.config.ts` is updated with all design tokens.
    2. Dark mode strategy is configured.
  - **Verification:**
    1. Build process completes without Tailwind configuration errors.
  - **Depends‑on:** [T006, T007, T008]

- [x] **T010 · Feature · P1: update app/globals.css with token-derived custom properties**

  - **Context:** Phase 1, Step 5; `app/globals.css`
  - **Action:**
    1. Align/update CSS custom properties (e.g., `--primary`) in `app/globals.css` with the new brand colors from `tailwind.config.ts` (T009).
    2. Ensure Tailwind's base, components, and utilities styles are correctly imported.
  - **Done‑when:**
    1. `app/globals.css` reflects new brand colors via CSS custom properties.
    2. Tailwind directives are correctly imported.
  - **Verification:**
    1. Inspect `app/globals.css` in the browser dev tools to confirm custom properties are set.
  - **Depends‑on:** [T009]

- [x] **T011 · Test · P1: verify design token application visually**
  - **Context:** Phase 1, Step 6; Risk: Inconsistent/Incorrect Design Token Application, Dark Mode Implementation Issues
  - **Action:**
    1. Temporarily apply new token-based Tailwind classes to elements on a test page/component.
    2. Visually confirm correct application of colors, typography, and spacing.
    3. Check dark mode application by toggling the theme.
  - **Done‑when:**
    1. Visual verification confirms correct token application in both light and dark modes.
    2. Test elements are removed or tests are integrated into Storybook.
  - **Verification:**
    1. Manually inspect elements in browser dev tools.
    2. Toggle dark mode and confirm styles update as expected.
  - **Depends‑on:** [T010]

## Storybook Setup

- [x] **T012 · Chore · P1: install and initialize storybook**

  - **Context:** Phase 2, Step 7; `.storybook/`
  - **Action:**
    1. Add Storybook dependencies: `storybook`, `@storybook/react-vite` (or `@storybook/nextjs`).
    2. Initialize Storybook configuration using `pnpm dlx storybook@latest init`.
  - **Done‑when:**
    1. Storybook packages are installed.
    2. `.storybook/` directory and initial configuration files are created.
  - **Verification:**
    1. `pnpm storybook` starts Storybook successfully.
  - **Depends‑on:** none

- [x] **T013 · Chore · P1: configure storybook for tailwind css**

  - **Context:** Phase 2, Step 8; Risk: Storybook Configuration Complexity
  - **Action:**
    1. Ensure Storybook's `preview.ts` imports `app/globals.css` (from T010).
    2. Configure PostCSS for Storybook if not handled automatically by the Storybook preset.
  - **Done‑when:**
    1. Tailwind styles are correctly applied to components within Storybook.
  - **Verification:**
    1. Create a simple story with Tailwind classes; verify rendering in Storybook.
  - **Depends‑on:** [T010, T012]

- [x] **T014 · Chore · P1: install and configure essential storybook addons**

  - **Context:** Phase 2, Step 9; Risk: Accessibility Oversights, Dark Mode Implementation Issues
  - **Action:**
    1. Install `@storybook/addon-essentials`, `@storybook/addon-interactions`, `@storybook/addon-a11y`.
    2. Install and configure an addon for theme switching (e.g., `@storybook/addon-themes`) for light/dark mode.
    3. Register addons in `.storybook/main.ts`.
  - **Done‑when:**
    1. Essential addons are installed, configured, and functional in Storybook UI.
    2. Theme toggling for light/dark mode works.
  - **Verification:**
    1. Check for addon panels (Controls, A11y, etc.) and theme toggle functionality in Storybook.
  - **Depends‑on:** [T012]

- [x] **T015 · Test · P2: verify complete storybook setup with a test story**

  - **Context:** Phase 2, Step 10
  - **Action:**
    1. Create a placeholder story for a simple HTML element styled with Tailwind classes.
    2. Ensure it renders correctly and responds to addon controls (e.g., theme toggle, a11y checks).
  - **Done‑when:**
    1. Placeholder story renders correctly with Tailwind styles.
    2. Storybook addons (a11y, theme toggle) function as expected with the story.
  - **Verification:**
    1. Run `pnpm storybook` and manually inspect the placeholder story and addon interactions.
  - **Depends‑on:** [T013, T014]

- [x] **T015.1 · Chore · P2: implement theme decorator for storybook**

  - **Context:** Phase 2, Step 10; Risk: Dark Mode Implementation Issues
  - **Action:**
    1. Create a proper ThemeProvider decorator for Storybook that works with the theme toggle.
    2. Ensure dark mode classes are correctly applied when the theme is switched.
  - **Done‑when:**
    1. Theme toggle in Storybook correctly applies dark mode classes.
    2. Components in stories react appropriately to theme changes.
  - **Verification:**
    1. Test the theme toggle functionality in Storybook with multiple components.
  - **Depends‑on:** [T013, T014]

- [x] **T015.2 · Fix · P1: resolve eslint configuration for storybook files**

  - **Context:** Phase 2, Step 10; Risk: Code Quality
  - **Action:**
    1. Update ESLint configuration to properly handle Storybook TypeScript files.
    2. Fix all ESLint errors in Storybook configuration files.
  - **Done‑when:**
    1. ESLint runs successfully on all Storybook files without errors.
    2. Pre-commit hooks pass for Storybook-related changes.
  - **Verification:**
    1. Run ESLint manually on Storybook files to confirm no errors.
    2. Make a small change to a Storybook file and ensure it can be committed without bypassing hooks.
  - **Depends‑on:** [T013]

- [x] **T015.3 · Fix · P1: resolve linting issues in test components**

  - **Context:** Phase 2, Step 10; Risk: Code Quality
  - **Action:**
    1. Fix ESLint errors and warnings in test components.
    2. Ensure proper typing and function return types for all components.
    3. Add appropriate JSDoc comments for improved documentation.
  - **Done‑when:**
    1. All test components pass linting without errors.
    2. Pre-commit hooks pass when modifying test components.
  - **Verification:**
    1. Run ESLint manually on test components to confirm no errors.
    2. Successfully commit changes without bypassing pre-commit hooks.
  - **Depends‑on:** [T015]

- [x] **T015.4 · Fix · P1: resolve linting issues in story files**
  - **Context:** Phase 2, Step 10; Risk: Code Quality
  - **Action:**
    1. Update ESLint configuration to properly handle story files or fix the warnings in them.
    2. Ensure story files can be modified without triggering ESLint warnings during pre-commit.
  - **Done‑when:**
    1. Story files can be committed without any warnings or errors.
    2. Pre-commit hooks pass when modifying story files.
  - **Verification:**
    1. Run ESLint manually on story files to confirm no errors or ignored warnings.
    2. Successfully commit changes to story files without bypassing pre-commit hooks.
  - **Depends‑on:** [T015.2, T015.3]

## Atom Components

### Typography Component

- [x] **T016 · Feature · P1: implement `Typography` atom component**

  - **Context:** Phase 3, Step 11 (a, b, c); `components/atoms/Typography/Typography.tsx`
  - **Action:**
    1. Create `Typography.tsx` with the `TypographyProps` interface as defined in the plan.
    2. Implement the component using Tailwind CSS classes derived from design tokens (T007), using the `cn` utility (T005).
    3. Ensure component adheres to WCAG 2.1 AA by using correct semantic HTML elements or allowing override via `as` prop.
  - **Done‑when:**
    1. `Typography` component correctly renders text with specified variants and styles.
    2. `as` prop allows tag override.
    3. Semantic HTML structure is appropriate for accessibility.
  - **Depends‑on:** [T005, T007, T009]

- [x] **T017 · Feature · P2: create `Typography` storybook stories and documentation**

  - **Context:** Phase 3, Step 11 (d, e, f); `components/atoms/Typography/Typography.stories.tsx`
  - **Action:**
    1. Create `Typography.stories.tsx`.
    2. Write stories covering all variants, `as` prop usage, text wrapping, different content lengths, and add TSDoc for props.
  - **Done‑when:**
    1. Comprehensive stories for `Typography` are available in Storybook.
    2. Props are documented via TSDoc and Storybook Controls.
  - **Verification:**
    1. Review stories in Storybook for all variants, content lengths, and `as` prop functionality.
    2. Check light/dark mode rendering.
    3. Verify `@storybook/addon-a11y` passes.
  - **Depends‑on:** [T015, T016]

- [x] **T018 · Test · P1: write unit and accessibility tests for `Typography` component**
  - **Context:** Phase 3, Step 11 (g); `components/atoms/Typography/Typography.test.tsx`
  - **Action:**
    1. Create `Typography.test.tsx` using React Testing Library and Jest.
    2. Write tests for rendering, variant application, `as` prop behavior, and accessibility using `jest-axe`.
  - **Done‑when:**
    1. Unit tests pass with high coverage (aim for 90%+).
    2. `jest-axe` accessibility tests pass.
  - **Depends‑on:** [T016]

### Button Component

- [x] **T019 · Feature · P1: implement `Button` atom component**

  - **Context:** Phase 3, Step 12 (a, b, c); `components/atoms/Button/Button.tsx`
  - **Action:**
    1. Create `Button.tsx` with the `ButtonProps` interface.
    2. Implement using Tailwind CSS (T009), `cn` utility (T005), including `variant`, `size`, `isLoading`, `disabled` states, and `asChild` prop. Primary CTA uses brand primary green.
    3. Ensure WCAG 2.1 AA (focus states, ARIA attributes).
  - **Done‑when:**
    1. `Button` component renders all variants, sizes, and states correctly.
    2. `isLoading` and `asChild` props function as expected.
    3. Accessibility requirements (focus, ARIA) are met.
  - **Depends‑on:** [T005, T009]

- [x] **T020 · Feature · P2: create `Button` storybook stories and documentation**

  - **Context:** Phase 3, Step 12 (d, e, f); `components/atoms/Button/Button.stories.tsx`
  - **Action:**
    1. Create `Button.stories.tsx`.
    2. Write stories covering all variants, sizes, states (default, hover, focus, active, disabled, isLoading), `asChild` usage, and add TSDoc.
  - **Done‑when:**
    1. Comprehensive stories for `Button` are available in Storybook.
    2. Props documented via TSDoc and Storybook Controls. Actions addon logs interactions.
  - **Verification:**
    1. Review stories for all states and interactions. Check light/dark mode. Verify `@storybook/addon-a11y`.
  - **Depends‑on:** [T015, T019]

- [x] **T021 · Test · P1: write unit and accessibility tests for `Button` component**
  - **Context:** Phase 3, Step 12 (g); `components/atoms/Button/Button.test.tsx`
  - **Action:**
    1. Create `Button.test.tsx`.
    2. Test click handlers, states, ARIA attributes, variants, sizes, and accessibility with `jest-axe`.
  - **Done‑when:**
    1. Unit tests pass with high coverage. `jest-axe` tests pass.
  - **Depends‑on:** [T019]

### Icon Component

- [x] **T022 · Feature · P1: implement `Icon` atom component**

  - **Context:** Phase 3, Step 13 (a, b, c); `components/atoms/Icon/Icon.tsx`
  - **Action:**
    1. Install `lucide-react`. Create `Icon.tsx` with `IconProps` interface.
    2. Implement component to dynamically render `lucide-react` icons, supporting `name`, `size`, `color`, `strokeWidth`, `className` (via `cn` utility T005). Default color to `currentColor`.
    3. Ensure accessibility (e.g., `aria-hidden="true"` for decorative icons).
  - **Done‑when:**
    1. `Icon` component renders specified Lucide icons with correct props.
    2. Accessibility considerations are addressed.
  - **Depends‑on:** [T004, T005]

- [x] **T023 · Feature · P2: create `Icon` storybook stories and documentation**

  - **Context:** Phase 3, Step 13 (d, e, f); `components/atoms/Icon/Icon.stories.tsx`
  - **Action:**
    1. Create `Icon.stories.tsx`.
    2. Write stories demonstrating core icons (from T004), various other icons, sizes, colors, and add TSDoc.
  - **Done‑when:**
    1. Comprehensive stories for `Icon` are available in Storybook. Props documented.
  - **Verification:**
    1. Review stories for icon rendering, prop effects. Check light/dark mode. Verify `@storybook/addon-a11y`.
  - **Depends‑on:** [T004, T015, T022]

- [x] **T024 · Test · P1: write unit and accessibility tests for `Icon` component**
  - **Context:** Phase 3, Step 13 (g); `components/atoms/Icon/Icon.test.tsx`
  - **Action:**
    1. Create `Icon.test.tsx`.
    2. Test rendering of different icons, prop application, and accessibility with `jest-axe`.
  - **Done‑when:**
    1. Unit tests pass with high coverage. `jest-axe` tests pass.
  - **Depends‑on:** [T022]

### Logo Component

- [x] **T025 · Feature · P1: implement `Logo` atom component**

  - **Context:** Phase 3, Step 14 (a, b, c); `components/atoms/Logo/Logo.tsx`
  - **Action:**
    1. Create `Logo.tsx` with `LogoProps` interface, using SVG asset from T003.
    2. Implement component using `cn` utility (T005).
    3. Ensure accessibility (appropriate `alt` text if image, or `role="img"` and `aria-label` if inline SVG).
  - **Done‑when:**
    1. `Logo` component renders the brand logo correctly.
    2. Accessibility requirements are met.
  - **Depends‑on:** [T003, T005]

- [x] **T026 · Feature · P2: create `Logo` storybook stories and documentation**

  - **Context:** Phase 3, Step 14 (d, e, f); `components/atoms/Logo/Logo.stories.tsx`
  - **Action:**
    1. Create `Logo.stories.tsx`.
    2. Write stories displaying the logo, any variants (from T003), test responsiveness if applicable, and add TSDoc.
  - **Done‑when:**
    1. Stories for `Logo` are available in Storybook. Props documented.
  - **Verification:**
    1. Review stories for logo rendering, responsiveness. Check light/dark mode. Verify `@storybook/addon-a11y`.
  - **Depends‑on:** [T003, T015, T025]

- [x] **T027 · Test · P1: write unit and accessibility tests for `Logo` component**
  - **Context:** Phase 3, Step 14 (g); `components/atoms/Logo/Logo.test.tsx`
  - **Action:**
    1. Create `Logo.test.tsx`.
    2. Test for correct rendering and accessibility attributes with `jest-axe`.
  - **Done‑when:**
    1. Unit tests pass with high coverage. `jest-axe` tests pass.
  - **Depends‑on:** [T025]

## Final Review, Testing & Documentation

- [x] **T028 · Chore · P1: set up visual regression testing with Chromatic**

  - **Context:** Testing Strategy - Visual Regression Tests
  - **Action:**
    1. Install and configure Chromatic for the Storybook project.
    2. Establish an initial baseline of component snapshots.
  - **Done‑when:**
    1. Chromatic is integrated and captures snapshots from Storybook.
    2. CI workflow for Chromatic is set up.
  - **Verification:**
    1. First Chromatic build passes and establishes baseline.
  - **Depends‑on:** [T015] (or after first few component stories are ready)

- [x] **T029 · Chore · P1: conduct final review and polish of all atom components**

  - **Context:** Phase 3, Step 15
  - **Action:**
    1. Review all components and stories for consistency with design tokens and brand identity.
    2. Ensure all components support light/dark mode correctly in Storybook.
  - **Done‑when:**
    1. All atom components and stories are consistent and polished.
    2. Light/dark mode support is verified for all atoms.
  - **Verification:**
    1. Manually review all atom stories in Storybook across themes.
    2. Check against design guidelines.
  - **Depends‑on:** [T017, T020, T023, T026]

- [~] **T030 · Test · P1: run all tests and linters for foundational UI**

  - **Context:** Phase 3, Step 15
  - **Action:**
    1. Execute `pnpm test` to run all unit and accessibility tests.
    2. Execute `pnpm lint` to check for code style issues.
  - **Done‑when:**
    1. All tests pass.
    2. Linters report no errors.
  - **Verification:**
    1. CI build passes successfully.
  - **Notes:**
    1. Fixed several linting issues in the component files.
    2. Remaining linting issues are in the scripts directory, not in UI components.
    3. There are test configuration issues with Jest's handling of JSX that need to be addressed.
  - **Depends‑on:** [T018, T021, T024, T027, T029]

- [x] **T031 · Documentation · P3: create overview README for atom components**

  - **Context:** Documentation - README Updates
  - **Action:**
    1. Create or update `README.md` in `components/atoms/` providing an overview of the atom components and their purpose.
  - **Done‑when:**
    1. `components/atoms/README.md` is created/updated with relevant information.
  - **Notes:**
    1. Found an existing comprehensive README.md that documents all atom components with usage examples and design system information.
  - **Depends‑on:** [T029]

- [ ] **T032 · Documentation · P3: update project README with link to Storybook**
  - **Context:** Documentation - README Updates
  - **Action:**
    1. Update the main project `README.md` to include a link to the deployed Storybook instance as the component library documentation.
  - **Done‑when:**
    1. Project `README.md` links to Storybook.
  - **Depends‑on:** [T015] (or when Storybook is deployed)
