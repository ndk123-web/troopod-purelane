# Purelane Build Assignment - Submission Notes

Candidate: Navnath Kadam
Role: AI Product Engineer
Submission: nj@troopod.io (cc: rahul.bhola@pushstart.in)
Subject: AI Product Engineer Assignment - Navnath Kadam

---

## 1. Project Overview & Deliverables

- Development Store URL: https://dq15xu-0f.myshopify.com/
- Storefront Password: purelane123
- GitHub Repository: https://github.com/ndk123-web/troopod-purelane

### Sections Shipped:
1. Hero (`sections/purelane-hero.liquid`): 1, 2, and 3-stage interactive bottle showcase with live Shopify product data, dynamic pricing, and fallback vector assets.
2. Shop Grid (`sections/purelane-shop.liquid`): Responsive 4-column product collection grid powered by reusable card snippets (`snippets/purelane-card.liquid`) and AJAX add-to-cart.
3. Best-Selling Combos (`sections/purelane-combos.liquid`): Horizontal snap-scroll rail with hidden scrollbar and direct bundle variant checkout.
4. Bundles (`sections/purelane-bundles.liquid`): 3-tier value architecture (Starter, Most Popular, Whole Home) with dynamic pricing and feature lists.
5. Reviews Rail (`sections/purelane-reviews.liquid`): Continuous marquee testimonials with customizable customer review cards.
6. Bonus Sections: Botanical Ingredients (`sections/purelane-ingredients.liquid`), Top Announcement Ticker (`sections/purelane-ticker.liquid`), Right-Side Section Progress Rail, and Floating Pill Header (`sections/purelane-header.liquid`) with active sliding underline indicator.

---

## 2. Metafield & Metaobject Architecture

To keep content fully merchant-editable without touching Liquid code, the following metafields and metaobjects were defined:

```json
{
  "metafields": [
    {
      "namespace": "reviews",
      "key": "rating",
      "type": "number_decimal",
      "name": "Customer Star Rating",
      "description": "Custom review rating score shown on cards (e.g., 4.8)"
    },
    {
      "namespace": "reviews",
      "key": "rating_count",
      "type": "number_integer",
      "name": "Total Reviews Count",
      "description": "Total number of verified reviews (e.g., 254)"
    },
    {
      "namespace": "custom",
      "key": "bundle_savings_text",
      "type": "single_line_text_field",
      "name": "Bundle Discount Tag",
      "description": "Savings callout (e.g., 'Save Rs 398')"
    }
  ],
  "metaobjects": [
    {
      "type": "combo_bundle",
      "name": "Combo Bundle Box",
      "fields": [
        { "key": "title", "type": "single_line_text_field" },
        { "key": "linked_products", "type": "list.product_reference" },
        { "key": "bundle_price", "type": "money" },
        { "key": "compare_at_price", "type": "money" },
        { "key": "is_hero", "type": "boolean" }
      ]
    }
  ]
}
```

---

## 3. Build Notes

### Issues Identified in the Original Prototype:
1. Conflicting CSS Blocks: The prototype contained two full `<style>` blocks (a dark theme followed by a light theme override) along with roughly 120 lines of unused PDP styles (`.crumb`, `.pin`, `.reassure`, `.acc`).
2. Duplicate IDs and Inlined SVGs: The shop grid duplicated products 1-4 to make 5-8, carrying duplicate SVG gradient IDs (`#gTAPb`, `#gKITb`), which caused invalid DOM rendering.
3. Scroll Performance & Layout Thrashing: The prototype recalculated `offsetTop` recursively on every single scroll event (`while (el) { top += el.offsetTop; el = el.offsetParent; }`), causing heavy browser reflows.
4. Heading Hierarchy & Accessibility: Headings jumped arbitrarily from `h1` to `h4` and `h2`, and action buttons lacked accessible names for screen readers.
5. Customizer Lifecycle: Vanilla scripts relied purely on `DOMContentLoaded`, which broke when sections were reloaded or reordered inside the Shopify theme editor.

### What Was Changed and Why:
- Tokenized Design System: Consolidated all colors into a clean `:root` token set with a botanical green and teal palette (`#00706a`, `#092e28`, `#b8701c`) that satisfies WCAG AA contrast requirements.
- Merchant-Editable Schemas: Extracted all hardcoded copy, prices, and products into Shopify Section settings, blocks, and product pickers.
- Optimized Scroll Engine: Cached element offsets at initialization and window resize, running animations via `requestAnimationFrame` for stutter-free 60fps scrolling.
- Reusable Card Snippets: Built `snippets/purelane-card.liquid` with automated fallbacks for sold-out states, missing images, and long product titles.
- AJAX Cart Engine: Added 1-click cart addition via `/cart/add.js` with live cart counter updates and non-blocking toast feedback.

### What I Would Do with More Time:
- Implement a slide-out cart drawer with free shipping progress thresholds.
- Add drag-and-drop bundle builder logic for custom product mixes.
- Set up Playwright automated visual regression tests across 375px, 768px, and 1440px breakpoints.

---

## 4. AI Workflow Notes

### What Was Delegated to AI:
- Rapid code auditing to spot dead CSS rules and duplicate SVG markup.
- Seed CSV data generation with required edge cases (sold-out item, long title, no-image product).
- Scaffolding Shopify schema definitions and Liquid section boilerplate.

### Where AI Needed Correction:
- Shopify Customizer Hooks: AI initially wrote standard window event listeners; I updated the implementation to hook into `shopify:section:load` and `shopify:section:unload`.
- Continuous Marquee Math: AI-generated CSS transforms had small seam glitches on resize; I adjusted the translation math to guarantee seamless 50% looping.
- Responsive Sizing: AI generated static aspect ratios that caused flex child collapse on smaller viewports; I added explicit min-dimensions and containment rules.

### How to Systematize This for 20+ Client Projects:
1. CLI Section Generator: A script to parse Figma/HTML prototypes and generate clean Liquid sections and schema definitions automatically.
2. Shared Metaobject Library: Standardized GraphQL scripts to provision combo and review schemas in new dev stores instantly.
3. Automated Quality Gate: GitHub Actions running Lighthouse CI, axe-core accessibility checks, and visual diff testing on every theme push.
