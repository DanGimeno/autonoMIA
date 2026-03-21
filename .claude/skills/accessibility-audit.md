---
name: accessibility-audit
description: Run a WCAG accessibility audit on a page or component
user_invocable: true
---

# Accessibility Audit (WCAG 2.2 AA+)

Audit a page or component for WCAG 2.2 compliance.

## Arguments
- File path or route to audit (e.g., `src/app/(app)/invoices/page.tsx` or `/invoices`)

## Audit checklist

### Perceptible
- [ ] All images have descriptive `alt` text
- [ ] Decorative icons use `aria-hidden="true"`
- [ ] Color contrast >= 4.5:1 for normal text, >= 3:1 for large text
- [ ] Information not conveyed by color alone (icons + text + patterns)
- [ ] Content readable at 200% zoom without horizontal scroll

### Operable
- [ ] All interactive elements reachable via Tab key
- [ ] Focus indicator visible on all focusable elements (`focus-visible:ring-2`)
- [ ] Tab order follows logical reading order
- [ ] Modals trap focus and return it on close
- [ ] Escape closes modals/dropdowns
- [ ] No keyboard traps
- [ ] Skip link present ("Saltar al contenido principal")

### Comprensible
- [ ] `<html lang="es">`
- [ ] All form inputs have associated `<label>` elements
- [ ] Error messages are specific and associated via `aria-describedby`
- [ ] Destructive actions require confirmation dialog (not `window.confirm`)
- [ ] Dynamic content updates announced via `aria-live="polite"`
- [ ] Consistent patterns across the app

### Robusto
- [ ] Semantic HTML: `<main>`, `<nav>`, `<header>`, `<section>`, etc.
- [ ] Data tables use `<th scope="col">` and `<caption>`
- [ ] ARIA roles used correctly (not duplicated or invented)
- [ ] Landmarks present: navigation, main content
- [ ] No `tabIndex` > 0

## Output
For each issue found:
1. Describe the problem
2. Reference the WCAG criterion (e.g., "1.4.3 Contrast")
3. Provide the fix (code change)
4. Apply the fix

## Fix priority
1. **Critical**: Keyboard traps, missing labels, no focus indicator
2. **High**: Contrast failures, missing alt text, no error association
3. **Medium**: Missing landmarks, missing aria-live, inconsistent patterns
4. **Low**: Missing skip link, caption on tables, fieldset grouping
