# Shoplane full SEO audit

**Site:** https://shoplane.com.au
**Business:** Australian Shopify Partner selling ready-made dropshipping stores and ecommerce services
**Date:** 23 August 2026 (AEST)
**Scope:** every URL in the live sitemaps, plus host/robots/policy/search/catalog checks
**URLs measured:** 22 products, 26 collections, 25 pages, 19 blog URLs, homepage, `/collections/all`, `/search`, 4 `/policies/*`, `/agents.md`, `/llms.txt`, host variants

No rankings, traffic, impressions, or Core Web Vitals were invented. Everything below was read from live HTML, headers, sitemaps, Atom feeds, or search JSON.

Supporting detail (every URL, measured fields, suggested copy):

- [Sitewide technical](report-sitewide.md)
- [Products](report-products.md)
- [Collections and pages](report-collections-pages.md)
- [Blogs](report-blogs.md)

---

## What is working (do not break)

- HTTPS apex is the only 200 homepage. HTTP and www 301 correctly. HSTS is on.
- Homepage document title already targets the money query: `Shoplane - Ready Made Dropshipping Shopify Stores Australia` (59 characters).
- Homepage canonical is self-referencing. Viewport, charset, OG image, `og:locale=en_AU` are present.
- `robots.txt` blocks cart, checkout, account, theme previews, and the main Shopify sort/filter crawl traps. Stores, services, collections, and blogs are allowed.
- Live `/sitemap.xml` is 200 (curl). Child sitemaps exist for products, pages, collections, blogs.
- Policy pages on `/policies/*` have real legal copy. Footer already points at those URLs.
- Several service and store product pages have usable commercial copy once schema and titles are cleaned up.

---

## The five problems that matter most

### 1. The entire blog is 404 and still in the sitemap

All 19 `/blogs/*` URLs return a hard 404 (`pageType=404`, canonical `https://shoplane.com.au/404`). They are still listed in `sitemap_blogs_1.xml`. `robots.txt` allows `/blogs/`.

The articles still exist. Atom feeds and Shopify search return the bodies. The published theme is not rendering blog or article templates.

Header “Blog” goes to a thin `/pages/blogs` stub (200). Footer “Blog” goes to `/blogs/business-entrepreneurship` (404).

Until this is fixed, Google is being told to crawl 19 dead URLs.

**Fix:** restore blog + article templates so those URLs 200 with Article/BlogPosting schema. Or unpublish every blog URL and drop `sitemap_blogs_1.xml` until the templates work. Do not leave 404s in the sitemap.

### 2. Index bloat: junk URLs are live, self-canonical, and sitemapped

Nothing on the storefront is `noindex`. That includes:

- Gift card product (in the products sitemap)
- `/search` (reuses the homepage meta description)
- IndexNow key published as `/pages/d63b4a75f5d94d4a906bc00391069538` (meta is the raw key)
- Wishlist, `/pages/llm-txt`, data-sharing opt-out
- ReviewVault and SkuShine stubs (some say “Draft Version”)
- Duplicate legal pages: `/pages/privacy-policy` vs `/policies/privacy-policy`, `/pages/terms-conditions` vs `/policies/terms-of-service` (~99% the same text, each self-canonical)
- 12 empty collections that say “No stores found”
- Leftover default collections: `tools` (title is “Fitness & Home Gym Equipment”), `pre-purchase-funnel`, `occasions`, `jewelry-accessories`, `party-supplies-decorations`, `toys-educational-products-for-kids`

**Fix:** noindex or unpublish every utility/app/empty URL and remove them from sitemaps. 301 the duplicate policies to `/policies/*`. Host the IndexNow key as a `.txt` file, not a theme page.

### 3. Product and Organization schema is broken

- Homepage `ProfessionalService` JSON-LD is invalid JSON (trailing comma in `sameAs`; Instagram/LinkedIn URLs end with `?`). Parsed types left: WebSite, SearchAction, BreadcrumbList. No Organization, no LocalBusiness, no FAQPage.
- 21 of 22 product pages have Product JSON-LD in the HTML that does not parse (raw newlines inside `description`). Only Flairedelux parses, and its description is empty.
- No FAQPage or Review schema on any product, even where an FAQ UI exists.

**Fix:** emit valid JSON-LD. Add Organization (logo, sameAs, email `hello@shoplane.com.au`). Repair Product/Offer on every store and service. Add FAQPage only for questions that are visible on the page.

### 4. Commercial pages that should convert are unfinished or fighting each other

- `/pages/book-a-call`: 11 words in `<main>`, no booking embed in the HTML.
- `/pages/how-shoplane-works-…`: 62 words, stops before the process.
- `/pages/about-us`: H1 “About Us”, 121 words.
- `/pages/service`: strongest service copy (537 words) but title is `service – Shoplane` and there is no meta. It cannibalises `/collections/shopify-ecommerce-services` (90-character title).
- `/collections/branding-identity` is titled “Store Optimisation & Performance”. `/collections/growth-management` is titled “Branding & Identity”.
- 8+ collections share the H1 “Ready-to-Launch Stores” and the same intro sentence.
- Homepage links to **zero** product URLs and does not link `/collections/all`. Catalog title is `Products – Shoplane` (19 characters), no meta, not in the collections sitemap.

**Fix:** finish Book a Call and How it Works. Pick one services hub. Unswap the two collection titles. Unique H1 + intro on every live collection. Add featured store/service links on the homepage.

### 5. Product copy and titles are messy; unique descriptions are thin

All 22 products are 200 and indexable. Page word counts look large because of chrome. Unique product descriptions are 0–88 words.

Worst:

1. Gift card — utility SKU, indexable, store FAQ template
2. Flairedelux — empty unique copy, wrong OG image
3. HomeAurora — 558-character meta (body dump)
4. Ozclearance handle still live; page is MyFurnitureWarehouse
5. Social media setup — 98-character stuffed title, overlaps management
6. Store maintenance — product description is the exclusions list; H1 is “Store Care Program”
7. FloofiBoopie — 70-character stuffed handle, domain-only H1
8. GadgetDirect — 288-character meta; electronics overlap with OZHIFI

16 titles are over 60 characters. 11 service pages still ship leftover `Feature title` placeholders. Store FAQs are identical across stores and the gift card.

---

## Inventory

| Type | In sitemap | HTTP | Notes |
|---|---:|---|---|
| Homepage | Yes (inside **products** sitemap) | 200 | Title good; H1/schema/internal links weak |
| Products | 22 + homepage | 22 × 200 | Schema broken on 21 |
| Collections | 26 (`/collections/all` **absent**) | 26 × 200 | 12 empty |
| Pages | 25 | 25 × 200 | ~17 should be noindex/remove/301 |
| Blog hubs + articles | 19 | **19 × 404** | Bodies still in Atom/search |
| `/search` | No | 200 | Indexable, thin, homepage meta |
| `/policies/*` | No | 200 | Keep; 301 `/pages/*` copies here |
| `/favicon.ico` | — | **404** | No `rel=icon` in HTML |

Empty collections (0 products, “No stores found”):

beauty-and-skincare, health-and-wellness-supplements, gift-and-novelty, travel-and-luggage, gaming-accessories, sports-and-fitness, jewelry-accessories, party-supplies-decorations, occasions, toys-educational-products-for-kids, tools, pre-purchase-funnel.

Empty blog hubs (0 Atom entries): `/blogs/dropshipping`, `/blogs/tech-tools`.

---

## Fix order (do this first)

### This week

1. **Restore blogs or pull them from the sitemap.** 19 404s in a live sitemap is the highest-urgency crawl issue on the site.
2. **Repair homepage JSON-LD** (valid ProfessionalService / Organization, clean `sameAs`, matching email).
3. **Repair Product JSON-LD** on all 22 products (escape description text; no raw newlines).
4. **Noindex + unpublish junk:** IndexNow page, wishlist, llm-txt, ReviewVault/SkuShine stubs, gift card, `/search`, empty leftover collections.
5. **301** `/pages/privacy-policy` → `/policies/privacy-policy` and `/pages/terms-conditions` → `/policies/terms-of-service`.
6. **Upload a favicon.**

### Next

7. Finish `/pages/book-a-call` (real scheduler + copy) and `/pages/how-shoplane-works-…` (actual steps).
8. Rewrite `/pages/service` title/meta. Pick it **or** the services collection as the hub; do not rank both.
9. Unswap branding-identity / growth-management titles.
10. Homepage: H1 that names ready-made Shopify stores in Australia; unique meta; featured product links; link the catalog.
11. Unique title / meta / H1 / 150+ words of collection copy on every **stocked** collection. Noindex the rest until they have stores.
12. Product titles under ~60 characters. Kill `Feature title` leftovers. Unique FAQs per store. Fix Ozclearance handle, HomeAurora meta, Flairedelux copy, FloofiBoopie handle.
13. When blogs 200 again: refresh 2024 posts for 2026, remove Oberlo, strip ChatGPT DOM, add internal links to stores/services/Book a Call, merge the two setup guides and the two “pre-made store” posts.

---

## Suggested copy (highest-traffic surfaces)

**Homepage H1**
Ready-Made Shopify Stores in Australia

(Keep “Launch Your Brand. Not Just a Store.” as a subhead.)

**Homepage meta (~155)**
Buy a ready-made Shopify dropshipping store in Australia, or book setup, branding and growth services. Built by a Shopify Partner. Free consultation.

**Services page title**
Shopify Services Australia — Setup, Optimise & Grow – Shoplane

**Services page meta**
Done-for-you Shopify setup, optimisation, branding and growth services for Australian store owners. One-time pricing, clear scope, Shopify Partner.

**Catalog `/collections/all` title**
Ready-Made Shopify Stores & Services – Shoplane

More title/meta/H1 rewrites for commercial pages and the 8 worst products are in the section reports.

---

## Blog content (once URLs 200)

Measured from Atom feeds / search, not from live HTML.

| Verdict | Article | Why |
|---|---|---|
| Best body | Email marketing & automation | 837 words, clearest how-to. Still 404; ChatGPT leftover; 0 product links |
| Longest | Getting Started with Shopify | 1,109 words; cannibalises the 7-steps post; ChatGPT `conversation-turn` leftover |
| Worst | How a Pre-Made Shopify Store Saves You Time | 447 words, no headings, no links, no CTA |
| Stale year | Features 2024, marketing 2024, social 2024, SEO body “in 2024” | Audit is Aug 2026 |
| Factually wrong | Top 10 apps (Oberlo #1, Sep 2024); product-research tools (Oberlo + Audience Insights, published 5 Apr 2026) | Oberlo shut down in 2022 |

10 of 12 articles published 23 Sep 2024. Sitemap lastmod in April 2026 is a touch, not a rewrite. Zero in-body links to Shoplane products or services.

---

## What this audit could not see

- Google Search Console (index coverage, queries, impressions)
- Analytics (traffic, conversions)
- Core Web Vitals / Lighthouse
- Backlinks

Connecting Search Console later would show which of these 404s and empty collections Google has already indexed.

---

## File index

| File | What it is |
|---|---|
| `Shoplane-SEO-Audit-Full-2026-08-23.md` | This summary |
| `report-sitewide.md` | Host, robots, sitemaps, homepage, search, policies |
| `report-products.md` | All 22 products, measured fields, 8 title/meta rewrites |
| `report-collections-pages.md` | All 26 collections + 25 pages, noindex list, 6 commercial rewrites |
| `report-blogs.md` | All 19 blog URLs, 404 evidence, article-quality notes |
| `data-*.json` | Parsed fields used for the tables |
| `sitemap_*.xml` | Sitemap snapshots from 23 Aug 2026 |
