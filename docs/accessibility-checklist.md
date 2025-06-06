# Accessibility Testing Checklist

## Pre-Launch Accessibility Checklist ✓

This checklist ensures WCAG 2.1 AA compliance before launching any feature or update.

### ✅ Automated Testing

- [ ] **axe-core audit passes** (0 critical/serious violations)
  ```bash
  pnpm test:a11y
  ```
- [ ] **Color contrast validation passes** (4.5:1 for normal text, 3:1 for large text)
- [ ] **Keyboard navigation tests pass** (no traps, logical order)
- [ ] **CI accessibility workflow passes** (all GitHub Actions green)

### ⌨️ Keyboard Navigation

- [ ] **Tab Navigation**

  - [ ] All interactive elements reachable by keyboard
  - [ ] Tab order follows visual layout
  - [ ] No keyboard traps exist
  - [ ] Shift+Tab works for reverse navigation

- [ ] **Focus Management**

  - [ ] Focus indicators visible on all elements
  - [ ] Focus indicators have 3:1 contrast minimum
  - [ ] Focus doesn't jump unexpectedly
  - [ ] Focus returns properly after modal close

- [ ] **Keyboard Shortcuts**
  - [ ] Enter activates links and buttons
  - [ ] Space activates buttons and checkboxes
  - [ ] Escape closes modals/dropdowns
  - [ ] Arrow keys work in menus/selects

### 🔊 Screen Reader Testing

- [ ] **Content Structure**

  - [ ] Page has descriptive title
  - [ ] Headings create logical outline
  - [ ] Landmarks properly defined
  - [ ] Lists marked up correctly

- [ ] **Images and Media**

  - [ ] Informative images have alt text
  - [ ] Decorative images have empty alt=""
  - [ ] Complex images have long descriptions
  - [ ] Videos have captions/transcripts

- [ ] **Forms and Inputs**

  - [ ] All inputs have labels
  - [ ] Required fields indicated
  - [ ] Error messages associated with fields
  - [ ] Form instructions clear

- [ ] **Dynamic Content**
  - [ ] Status messages announced
  - [ ] Live regions configured properly
  - [ ] Loading states communicated
  - [ ] Error alerts announced

### 🎨 Visual Accessibility

- [ ] **Color and Contrast**

  - [ ] Text meets contrast requirements
  - [ ] UI components have 3:1 contrast
  - [ ] Information not conveyed by color alone
  - [ ] Focus indicators sufficiently visible

- [ ] **Responsive Design**

  - [ ] Content readable at 200% zoom
  - [ ] No horizontal scrolling at 200% zoom
  - [ ] Touch targets ≥ 44x44px
  - [ ] Content reflows properly

- [ ] **Motion and Animation**
  - [ ] Respects prefers-reduced-motion
  - [ ] No seizure-inducing content
  - [ ] Pause/stop controls for animation
  - [ ] Static alternatives available

### 📱 Mobile Accessibility

- [ ] **Touch Interaction**

  - [ ] Touch targets meet size requirements
  - [ ] Adequate spacing between targets
  - [ ] Gestures have alternatives
  - [ ] No hover-only interactions

- [ ] **Mobile Screen Readers**
  - [ ] VoiceOver (iOS) navigation works
  - [ ] TalkBack (Android) navigation works
  - [ ] Rotor/reading controls function
  - [ ] Gestures properly announced

### 🧪 Cross-Browser Testing

- [ ] **Desktop Browsers**

  - [ ] Chrome + NVDA
  - [ ] Firefox + NVDA
  - [ ] Safari + VoiceOver
  - [ ] Edge + Narrator

- [ ] **Mobile Browsers**
  - [ ] iOS Safari + VoiceOver
  - [ ] Android Chrome + TalkBack

### 📋 Manual Testing Completed

- [ ] **Keyboard Testing**

  - [ ] Tested without mouse
  - [ ] All functionality accessible
  - [ ] Documented any issues

- [ ] **Screen Reader Testing**

  - [ ] Full page navigation tested
  - [ ] Content makes sense when linearized
  - [ ] Interactive elements properly announced

- [ ] **Visual Testing**
  - [ ] Zoom testing completed
  - [ ] High contrast mode verified
  - [ ] Text spacing bookmarklet tested

### 📊 Performance Impact

- [ ] **Testing Performance**
  - [ ] Accessibility tests complete in < 2 minutes
  - [ ] No significant impact on page load
  - [ ] ARIA doesn't break functionality

### 📝 Documentation

- [ ] **Issue Tracking**

  - [ ] All issues logged with severity
  - [ ] Remediation plan created
  - [ ] Timeline established

- [ ] **Compliance Records**
  - [ ] Test results archived
  - [ ] VPAT updated if needed
  - [ ] Accessibility statement current

## Quick Test Commands

```bash
# Run all accessibility tests
pnpm test:a11y

# Generate detailed report
pnpm test:a11y:report

# Run specific test file
pnpm test:e2e e2e/specs/accessibility-compliance.spec.ts

# Run in headed mode for debugging
pnpm test:e2e:debug --grep @accessibility
```

## Severity Levels

| Level        | Description              | Example            | Action            |
| ------------ | ------------------------ | ------------------ | ----------------- |
| **Critical** | Blocks access completely | No keyboard access | Fix immediately   |
| **Serious**  | Major barriers           | Missing alt text   | Fix before launch |
| **Moderate** | Significant issues       | Poor contrast      | Fix within sprint |
| **Minor**    | Small improvements       | Redundant ARIA     | Fix when possible |

## Sign-Off

### Development Team

- [ ] Developer testing complete
- [ ] Code review includes accessibility
- [ ] Automated tests passing

### QA Team

- [ ] Manual testing complete
- [ ] Cross-browser verified
- [ ] Mobile testing done

### Product Team

- [ ] Accessibility requirements met
- [ ] User impact assessed
- [ ] Launch criteria satisfied

---

**Date Completed**: **\*\***\_\_\_**\*\***

**Tested By**: **\*\***\_\_\_**\*\***

**Approved By**: **\*\***\_\_\_**\*\***

## Notes

_Use this space to document any exceptions, known issues, or follow-up items:_

---

Remember: Accessibility is not a one-time checklist but an ongoing commitment to inclusive design.
