# Pre-production task list

Ordered by priority. Everything not listed here (SEO tags, image-slots, blog links, nav/footer consistency, JSON-LD, image sizes, security headers, sitemap/robots.txt) was checked and is already in good shape.

## P1 — Broken / dead functionality (fix before launch)

- [x] **AI agent "live demo" links point to subdomains that don't exist yet** ([ai-agents.html](ai-agents.html))
  - Fixed: replaced the 7 `*.webtechsolutionske.co.ke` subdomain links with local, self-contained interactive dashboard demos in the style of the floricore demo — `demo-booking.html`, `demo-invoices.html`, `demo-receptionist.html`, `demo-shop.html`, `demo-reports.html`, `demo-inbox.html`, `demo-shortlet.html`. Each is `noindex` (not in sitemap) and shares `assets/demo-app.css` / `assets/demo-app.js`.

- [ ] **Contact form has no backend** ([contact.html:220](contact.html#L220))
  - `<form ... action="#" method="post">` with no JS handler — submitting it does nothing and loses the data.
  - Needs a real submission path (PHP mail script on the Apache host, or a static-friendly form endpoint like Web3Forms/Formspree).

- [ ] **Quote form is a UI skeleton only** ([assets/quote-form.js:1](assets/quote-form.js#L1))
  - Comment confirms: "no backend submission yet." It only builds a WhatsApp deep link — if the visitor doesn't tap "Send on WhatsApp," the quote is lost with no record anywhere.

- [ ] **AI lead-capture chat doesn't auto-deliver leads** ([assets/lead-agent.js](assets/lead-agent.js), home + contact)
  - Same pattern as the quote form — ends on a manual "Send on WhatsApp" button, nothing lands in an inbox/CRM automatically.

> All three lead-capture paths share one fix: wire up a real submission endpoint so leads reach you even if the visitor never clicks through to WhatsApp.

## P2 — Analytics & Search Console

- [ ] Add Google Analytics / GTM (and Meta Pixel if running ads) — currently no tracking anywhere on the site.
- [ ] Verify the site in Google Search Console and submit `sitemap.xml` so indexing/search performance can be monitored.

## P3 — Dead footer social links

- [ ] Footer social icons (X, LinkedIn, GitHub) are `href="#"` on every page (e.g. [index.html:569-571](index.html#L569-L571)). Add real profile URLs or remove the icons — dead `#` links look unfinished.

## P4 — Final QA pass

- [ ] Run the headless-Chrome mobile/desktop sweep (instructions.md §5/§7 — real device emulation, no console errors, no horizontal overflow, screenshots) on the pages added most recently and not yet verified: `ai-agents.html` and the 5 new blog posts (`rank-your-business-on-google-kenya.html`, `whatsapp-ai-agent-for-kenyan-businesses.html`, `mpesa-checkout-online-store.html`, `website-cost-in-kenya.html`, `google-business-profile-local-seo-checklist.html`, `whatsapp-business-vs-ai-agent.html`).
- [ ] After deploy, smoke-test `.htaccess` rewrite rules on the real Apache host: HTTPS force, non-www redirect, and extension-less clean URLs — these can't be verified by opening files locally.

## P5 — Minor housekeeping

- [ ] Remove the stray `uploads/WhatsApp Image 2026-06-08 at 19.30.05.jpeg` (gitignored + crawl-blocked, but likely stale local clutter).
- [ ] `assets/webtech-logo.png` (used as OG/Twitter image) is 172KB — within budget but the largest asset on the site; a WebP version would trim it slightly. Low priority since OG images aren't render-blocking.
