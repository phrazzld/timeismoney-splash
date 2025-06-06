# Accessibility Testing Guide

This guide provides comprehensive procedures for testing the Time is Money marketing site for WCAG 2.1 AA compliance.

## Table of Contents

1. [Automated Testing](#automated-testing)
2. [Manual Testing Procedures](#manual-testing-procedures)
3. [Keyboard Navigation Testing](#keyboard-navigation-testing)
4. [Screen Reader Testing](#screen-reader-testing)
5. [Visual Testing](#visual-testing)
6. [Mobile Accessibility](#mobile-accessibility)
7. [Common Issues and Solutions](#common-issues-and-solutions)

## Automated Testing

### Running Accessibility Tests

```bash
# Run all accessibility tests
pnpm test:a11y

# Generate HTML report
pnpm test:a11y:report

# Run in CI mode
CI=true pnpm test:e2e:accessibility
```

### What's Tested Automatically

- **WCAG 2.1 AA Compliance**: Via axe-core integration
- **Keyboard Navigation**: Tab order, focus indicators, keyboard traps
- **Color Contrast**: Text and UI component contrast ratios
- **ARIA Implementation**: Proper roles, labels, and landmarks
- **Semantic HTML**: Heading hierarchy, form labels, alt text

### Interpreting Results

Test output includes:

- Total violations found
- Severity levels (critical, serious, moderate, minor)
- Specific elements affected
- How to fix each issue

## Manual Testing Procedures

While automated tests catch many issues, manual testing is essential for:

- User experience validation
- Complex interaction patterns
- Subjective assessments
- Cross-browser/device compatibility

### Prerequisites

1. **Browsers**: Latest versions of Chrome, Firefox, Safari, Edge
2. **Screen Readers**:
   - NVDA (Windows) - [Download](https://www.nvaccess.org/download/)
   - JAWS (Windows) - Commercial
   - VoiceOver (macOS) - Built-in
   - TalkBack (Android) - Built-in
3. **Tools**:
   - [WAVE Browser Extension](https://wave.webaim.org/extension/)
   - [axe DevTools](https://www.deque.com/axe/devtools/)
   - Browser DevTools

## Keyboard Navigation Testing

### Test Procedure

1. **Initial Setup**

   - Put away your mouse
   - Start from the browser address bar
   - Press Tab to enter the page

2. **Navigation Checklist**

   - [ ] **Tab Order**

     - Tab through all interactive elements
     - Verify order matches visual layout (left-to-right, top-to-bottom)
     - No unexpected jumps in focus order

   - [ ] **Focus Indicators**

     - Every focused element has visible indicator
     - Focus indicator has sufficient contrast (3:1 minimum)
     - Focus indicator doesn't obscure content

   - [ ] **Interactive Elements**

     - All buttons activate with Enter/Space
     - Links activate with Enter
     - Form controls respond to expected keys
     - Custom controls follow ARIA patterns

   - [ ] **Skip Links**

     - First Tab reveals skip link(s)
     - Skip links navigate to correct targets
     - Focus moves to target, not just viewport

   - [ ] **No Keyboard Traps**

     - Can Tab through entire page
     - Can Shift+Tab backwards
     - Can escape from any component

   - [ ] **Modal/Popup Behavior**
     - Focus moves into modal when opened
     - Tab cycles within modal
     - Escape closes modal
     - Focus returns to trigger element

### Key Commands Reference

| Action                | Keys           |
| --------------------- | -------------- |
| Forward navigation    | Tab            |
| Backward navigation   | Shift + Tab    |
| Activate button       | Enter or Space |
| Activate link         | Enter          |
| Close modal/popup     | Escape         |
| Navigate radio/select | Arrow keys     |
| Check checkbox        | Space          |

## Screen Reader Testing

### NVDA (Windows)

1. **Setup**

   - Download and install [NVDA](https://www.nvaccess.org/download/)
   - Start NVDA (Ctrl + Alt + N)
   - Use NVDA + Space to toggle browse/focus mode

2. **Testing Checklist**

   - [ ] **Page Structure**

     - Title announced on load
     - Landmarks properly announced
     - Heading hierarchy makes sense

   - [ ] **Navigation**

     - Can navigate by headings (H)
     - Can navigate by landmarks (D)
     - Can navigate by links (K)
     - List items properly announced

   - [ ] **Content**

     - All text content is read
     - Images have appropriate descriptions
     - Decorative images ignored
     - Tables have proper headers

   - [ ] **Forms**

     - Form fields announce labels
     - Required fields indicated
     - Error messages associated
     - Help text announced

   - [ ] **Dynamic Content**
     - Status messages announced
     - Live regions update properly
     - Loading states communicated

### VoiceOver (macOS)

1. **Setup**

   - Enable: Cmd + F5
   - VoiceOver key (VO) = Ctrl + Option

2. **Key Commands**

   - Navigate: VO + Arrow keys
   - Rotor: VO + U
   - Next heading: VO + Cmd + H
   - Next link: VO + Cmd + L
   - Interact: VO + Shift + Down

3. **Testing Focus**
   - Rotor navigation works
   - Web spots identified correctly
   - Form hints announced
   - Gestures work on touch devices

### Screen Reader Testing Scenarios

1. **Homepage Navigation**

   ```
   Expected flow:
   1. Page title announced
   2. Can navigate to main content
   3. Hero heading readable
   4. CTA button purpose clear
   5. Can navigate between sections
   ```

2. **Form Interaction** (if applicable)
   ```
   Expected behavior:
   1. Form purpose announced
   2. Field labels read correctly
   3. Required fields indicated
   4. Error messages associated
   5. Success feedback provided
   ```

## Visual Testing

### Zoom Testing

1. **Browser Zoom to 200%**

   - Ctrl/Cmd + Plus to zoom
   - Content remains readable
   - No horizontal scrolling required
   - Interactive elements still usable
   - Text doesn't overlap

2. **Text Spacing**
   - Use bookmarklet: [Text Spacing Bookmarklet](http://www.html5accessibility.com/tests/tsbookmarklet.html)
   - Content remains readable with:
     - Line height: 1.5x font size
     - Paragraph spacing: 2x font size
     - Letter spacing: 0.12x font size
     - Word spacing: 0.16x font size

### High Contrast Mode

1. **Windows High Contrast**

   - Press Alt + Left Shift + Print Screen
   - All content visible
   - Focus indicators visible
   - Interactive elements identifiable

2. **Browser Extensions**
   - Install High Contrast extension
   - Test with different color schemes
   - Ensure no information lost

### Motion and Animation

1. **Reduced Motion**
   - Enable `prefers-reduced-motion` in OS
   - Animations should respect preference
   - Essential animations still function
   - No parallax scrolling

## Mobile Accessibility

### Touch Target Testing

1. **Minimum Sizes**

   - Interactive elements ≥ 44x44px (iOS)
   - Interactive elements ≥ 48x48dp (Android)
   - Adequate spacing between targets

2. **Gesture Testing**
   - All functionality available via simple gestures
   - No complex gestures required
   - Alternative methods for custom gestures

### Mobile Screen Reader

1. **VoiceOver (iOS)**

   - Settings > Accessibility > VoiceOver
   - Swipe to navigate
   - Double-tap to activate
   - Rotor gesture works

2. **TalkBack (Android)**
   - Settings > Accessibility > TalkBack
   - Swipe to navigate
   - Double-tap to activate
   - Reading controls work

## Common Issues and Solutions

### Issue: Low Color Contrast

**Detection**: Automated tests flag contrast violations

**Solution**:

1. Use color contrast analyzer
2. Adjust colors to meet ratios:
   - Normal text: 4.5:1
   - Large text: 3:1
   - UI components: 3:1

### Issue: Missing Focus Indicators

**Detection**: Keyboard testing shows no visual focus

**Solution**:

```css
:focus {
  outline: 2px solid #0066cc;
  outline-offset: 2px;
}
```

### Issue: Keyboard Trap

**Detection**: Can't Tab past certain element

**Solution**:

1. Check for `tabindex` values > 0
2. Ensure modal escape handlers
3. Review focus management code

### Issue: Unlabeled Form Fields

**Detection**: Screen reader announces "edit blank"

**Solution**:

```html
<!-- Option 1: Visible label -->
<label for="email">Email</label>
<input id="email" type="email" />

<!-- Option 2: ARIA label -->
<input type="email" aria-label="Email address" />

<!-- Option 3: Hidden label -->
<label for="email" class="visually-hidden">Email</label>
<input id="email" type="email" />
```

## Reporting Issues

When documenting accessibility issues:

1. **Severity**: Critical, Serious, Moderate, Minor
2. **Location**: Page URL and element selector
3. **Issue**: What's wrong
4. **Impact**: How it affects users
5. **Solution**: How to fix it
6. **WCAG Criterion**: Which standard it violates

### Example Issue Report

```markdown
**Severity**: Serious
**Location**: Homepage hero button (#hero-cta)
**Issue**: Insufficient color contrast (3.2:1)
**Impact**: Users with low vision cannot read button text
**Solution**: Change background color to #0066cc for 4.5:1 ratio
**WCAG**: 1.4.3 Contrast (Minimum)
```

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/TR/wai-aria-practices-1.1/)
- [WebAIM Resources](https://webaim.org/resources/)
- [A11y Project Checklist](https://www.a11yproject.com/checklist/)

## Continuous Improvement

1. **Regular Audits**: Run monthly accessibility audits
2. **User Testing**: Include users with disabilities
3. **Training**: Keep team updated on best practices
4. **Tooling**: Update testing tools regularly
5. **Documentation**: Keep this guide current
