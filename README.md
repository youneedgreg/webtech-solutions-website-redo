# webtech-solutions-website-redo

Official website for Webtech Solutions KE — a full-service digital agency in Nairobi. Hand-coded static HTML/CSS/JS with structured schema markup, optimised meta, sitemap and .htaccess configuration targeting web development, SEO, software systems and AI agent services in the Kenyan market.

## Pages

| File | Purpose |
|---|---|
| `index.html` | Home — hero, services overview, Webtech AI flagship, portfolio & blog teasers, AI lead-capture chat |
| `services.html` | Full service catalogue with anchor links (`#web`, `#seo`, `#ecommerce`, …) |
| `portfolio.html` | Project gallery (drop screenshots onto the image slots) |
| `blog.html` | Article listing with client-side topic filter |
| `about.html` | Story, values, team placeholders, process |
| `contact.html` | Contact channels, AI lead-capture chat, FAQ (with FAQPage schema) |
| `privacy.html` / `terms.html` | Legal pages |
| `404.html` | Custom not-found page (wired via `.htaccess`) |

## Shared assets

- `assets/styles.css` — single stylesheet for all pages
- `assets/site.js` — nav scroll state, mobile menu, scroll reveals, blog filter
- `assets/lead-agent.js` — AI lead-capture chat (used on home + contact)
- `assets/image-slot.js` — drag-and-drop image placeholder component

## SEO

- Per-page titles, descriptions, canonicals, Open Graph/Twitter cards
- JSON-LD: `ProfessionalService` + `WebSite` (home), `BreadcrumbList` (all pages), `ItemList` (services), `Blog`, `FAQPage` (contact)
- `sitemap.xml` (clean URLs — `.htaccess` strips `.html`), `robots.txt`
- `.htaccess`: HTTPS + non-www redirects, extension-less URLs, gzip, caching, security headers, custom 404

## Before launch

- Drop real images onto the portfolio/blog/team image slots
- Fill in the social profile URLs in the footers (currently `#`)
- Replace placeholder blog teasers with real article pages and add them to `sitemap.xml`
