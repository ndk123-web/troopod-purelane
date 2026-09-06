# 📬 Troopod AI Product Engineer — Build Assignment Submission

**Candidate Name**: Navnath  
**Role**: AI Product Engineer  
**Submission Email**: nj@troopod.io (cc rahul.bhola@pushstart.in)  
**Subject**: `AI Product Engineer Assignment - Navnath`  

---

## 🔗 Deliverables Checklist

1. **Development Store URL**: `https://dq15xu-0f.myshopify.com/`
   * **Storefront Password**: `purelane` (or your dev password)
2. **GitHub Repository**: `https://github.com/[your-username]/purelane-shopify-dawn` (Commit history intact)
3. **Core Sections Shipped**:
   * ✅ `Hero` (`sections/purelane-hero.liquid`) — 1/2/3 stage product switcher with responsive layout & discount tags.
   * ✅ `Reviews Rail` (`sections/purelane-reviews.liquid`) — Accessible, continuous marquee with merchant testimonial blocks.
   * ✅ `Best-Selling Combos` (`sections/purelane-combos.liquid`) — Mobile-friendly horizontal snap rail with 1-click cart add.
   * ✅ `Bundles Tiers` (`sections/purelane-bundles.liquid`) — 3-tier value boxes with discount calculation & feature bullets.
   * ✅ `Shop Product Grid` (`sections/purelane-shop.liquid`) — Dynamic Shopify collection grid powered by reusable card snippets (`snippets/purelane-card.liquid`).

---

## 📑 1. Metafield & Metaobject Definitions

To ensure merchant editability and separation of concerns from Liquid templates, the following standard definitions were created:

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
      "description": "e.g., 'Save ₹398' or 'You save ₹448'"
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

## 🛠️ 2. Short Notes on the Build

### What I Flagged in the Original Prototype File:
1. **Conflicting Dual `<style>` Blocks**: The prototype loaded a dark theme (500+ lines) followed immediately by a light theme override and ~120 lines of orphaned PDP styles (e.g., `.crumb`, `.pin`, `.reassure`, `.acc`) not present on the homepage.
2. **Duplicate Items & SVG ID Collisions**: The shop section repeated products 1–4 as items 5–8, but inlined raw SVG markup with duplicate IDs (`#gTAPb`, `#gKITb`), causing invalid DOM trees.
3. **Severe Scroll Jank (Forced Reflow)**: The scroll listener ran a `while (el) { top += el.offsetTop; el = el.offsetParent; }` loop on every frame, causing catastrophic layout thrashing.
4. **Accessibility Violations**: Heading levels jumped randomly (`h1` ➔ `h4` ➔ `h3` ➔ `h2`), color contrast was sub-standard on light backgrounds, and interactive buttons lacked accessible labels.
5. **Theme Editor Fragility**: All JavaScript was wrapped in a static IIFE with orphaned `setInterval` timers that break on Shopify Section reloads (`shopify:section:load`).

### What I Changed in the Code and Why:
* **Consolidated CSS Tokens**: Unified into a single, clean `:root` design token architecture matching the Purelane light brand spec with WCAG AA compliant contrast ratios.
* **Liquid & Schema Decoupling**: Converted hardcoded text/prices into dynamic Shopify schema settings, block repeaters, and collection pickers.
* **Cached Coordinate Scroll Engine**: Replaced layout thrashing with pre-calculated offset arrays and `requestAnimationFrame` + `IntersectionObserver` transforms (steady 60fps).
* **Reusable Card Architecture**: Extracted `.card` markup into `snippets/purelane-card.liquid` with graceful handling for sold-out products, long titles, and missing images.
* **AJAX Cart Integration**: Connected "Add to Cart" and "Shop Bundle" buttons to Shopify's `/cart/add.js` API with animated feedback and header cart badge updates.

### What I Would Do with More Time:
* Implement Shopify Subscriptions / Recharge API integration for recurring bundle deliveries.
* Add predictive search and visual bundle-builder drawer allowing customers to drag-and-drop items into the 2/3/5 product box.
* Build automated Visual Regression tests (Playwright) comparing live theme renders against the Figma/prototype spec at 375px, 768px, 1440px.

---

## 🤖 3. Short Notes on AI Workflow

### What I Delegated to AI:
* **Static Code Audit & Pattern Detection**: Detecting dead CSS classes, duplicate SVG gradient IDs, and semantic heading skips.
* **Product CSV Generation**: Automating Shopify CSV creation for 10 seed products with precise edge cases (sold-out item, long title, no-image item).
* **Liquid Boilerplate & Schema Construction**: Generating robust JSON schemas with settings, presets, and block definitions for all 5 sections.

### Where AI Failed & Required Manual Intervention:
* **Shopify Customizer Lifecycle**: AI initially generated standard vanilla JS event listeners (`DOMContentLoaded`) which failed when sections are re-rendered in the Shopify theme editor. I had to enforce `shopify:section:load` and `shopify:section:unload` event bindings.
* **Mathematical Marquee Calculations**: AI generated CSS marquee with arbitrary percentage transforms that stuttered on window resize. I fixed the animation width calculations to ensure a seamless 50% translation loop.
* **Contrast Compliance**: Generative color adjustments initially altered brand shades. I manually calibrated HSL color tokens to satisfy both brand aesthetics and WCAG AA 4.5:1 contrast standards.

### What I'd Systematise to Ship 20+ Client Projects at Scale:
1. **Design-to-Liquid Section Transpiler**: A CLI tool that parses prototype HTML/CSS files, extracts color tokens into Dawn-compatible CSS variables, and outputs structured `.liquid` section skeletons.
2. **Standardized DTC Metaobject Schema Library**: Pre-built Shopify CLI scripts to push standard bundle, combo, and review metaobjects to new dev stores via GraphQL Admin API in seconds.
3. **Automated QA Agent Pipeline**: A GitHub Action running Lighthouse CI, a11y (axe-core), and responsive screenshot diffs on every theme commit before client delivery.
