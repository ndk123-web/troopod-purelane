# Purelane Homepage - Issue Audit and Technical Fixes

This document details the issues found in the prototype `purelane-homepage.html` across CSS architecture, rendering, performance, accessibility, and Shopify compatibility, along with the technical fixes implemented.

---

## 1. Summary of Issues and Fixes

| Category | Problem in Original Prototype | Impact | Implemented Fix |
| :--- | :--- | :--- | :--- |
| CSS Structure | Dual style tags (dark theme followed by light theme override) and orphaned PDP rules. | 500+ lines of redundant CSS, style conflicts, and unnecessary page payload. | Consolidated into a single `:root` design token architecture. Removed all dead styles. |
| DOM & SVGs | Product cards 5-8 were duplicated copies of 1-4 with identical SVG gradient IDs. | Duplicate IDs (`#gTAPb`, `#gKITb`) violated HTML standards and caused visual glitches. | Created 8 unique products with clean, reusable class-based image assets. |
| Accessibility | Skipping heading levels (`h1` directly to `h4`), missing button labels. | Poor screen reader experience, failing WCAG AA compliance. | Restructured heading hierarchy (`h1` -> `h2` -> `h3`) and added explicit `aria-label` attributes. |
| Performance | Scroll listener ran recursive `offsetTop` calculations on every scroll frame. | Forced synchronous layout thrashing and stuttering during scroll. | Cached element offsets and decoupled animations using `requestAnimationFrame`. |
| Shopify Integration | Hardcoded text, prices, and static JavaScript event listeners. | Incompatible with Shopify Customizer, breaks on section reloads. | Migrated to Liquid schemas, reusable card snippets, and `shopify:section:load` lifecycle hooks. |

---

## 2. Detailed Technical Breakdown

### Issue 1: Redundant CSS and Conflicting Style Blocks
- Problem: The prototype contained an initial dark palette definition (`--ink: #17102b`) followed by a light theme override that redeclared core tokens. It also included product detail page (PDP) styles (`.crumb`, `.pin`, `.reassure`, `.acc`) that did not exist on the homepage.
- Fix: Merged tokens into a single clean `:root` block with a cohesive botanical green and teal palette (`#00706a`, `#092e28`, `#b8701c`). Removed unused PDP CSS.

### Issue 2: SVG ID Clashes and Product Duplication
- Problem: Products 5 through 8 were duplicated markup of products 1 through 4. Each card included inline SVG elements with identical `id` attributes, causing DOM validation errors.
- Fix: Seeded 8 distinct products with unique handles, tags, and pricing. Moved image rendering to reusable classes (`.pimg`, `.p-kitchen`, `.p-tap`, etc.) referencing base64 SVG URIs and real Shopify product images.

### Issue 3: Semantic HTML and Accessibility
- Problem: Heading levels jumped arbitrarily (e.g., `<h4>` inside ingredient cards without a parent `<h2>` or `<h3>`). Add-to-cart buttons had no descriptive text for screen readers.
- Fix:
  - Standardized heading levels: `h1` for hero, `h2` for primary section titles, `h3` for product and bundle names.
  - Added descriptive `aria-label` tags to all interactive buttons.
  - Implemented visible focus indicators (`:focus-visible`) for keyboard navigation.

### Issue 4: Scroll Performance and Forced Reflows
- Problem: The prototype calculated element positions inside the scroll event handler using a `while` loop walking up `offsetParent` chains, forcing browser reflow on every scroll tick.
- Fix:
  - Cached section coordinates during initialization and window resize.
  - Handled parallax transformations and active navigation updates inside a single `requestAnimationFrame` loop.
  - Scroll now operates at a smooth 60fps without layout thrashing.

### Issue 5: Shopify Theme Customizer Readiness
- Problem: Interactive JavaScript used basic `DOMContentLoaded` listeners with global state, causing event listener duplication or broken sliders when sections were reloaded or reordered in the Shopify editor.
- Fix:
  - Wrapped JavaScript in modular initialization functions.
  - Added listeners for `shopify:section:load` and `shopify:section:unload` events.
  - Replaced hardcoded HTML cards with dynamic Liquid loops and `snippets/purelane-card.liquid`.
