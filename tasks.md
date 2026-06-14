# Pre-production task list

Ordered by priority. Everything not listed here (SEO tags, image-slots, blog links, nav/footer consistency, JSON-LD, image sizes, security headers, sitemap/robots.txt) was checked and is already in good shape.

## P1 — Broken / dead functionality (fix before launch)

- [x] **AI agent "live demo" links point to subdomains that don't exist yet** ([ai-agents.html](ai-agents.html))
  - Fixed: replaced the 7 `*.webtechsolutionske.com` subdomain links with local, self-contained interactive dashboard demos in the style of the floricore demo — `demo-booking.html`, `demo-invoices.html`, `demo-receptionist.html`, `demo-shop.html`, `demo-reports.html`, `demo-inbox.html`, `demo-shortlet.html`. Each is `noindex` (not in sitemap) and shares `assets/demo-app.css` / `assets/demo-app.js`.

- [x] **Contact form has no backend** ([contact.html:220](contact.html#L220))
  - Fixed: form now submits via Web3Forms (`assets/form-submit.js` + `assets/contact-form.js`), with an inline success/error message and a honeypot anti-spam field. Quote form and AI lead chat also now auto-send (see below).
  - **Action needed before launch:** `assets/form-submit.js` has a placeholder `ACCESS_KEY = 'YOUR_WEB3FORMS_ACCESS_KEY'` — get a free key at web3forms.com and paste it in, otherwise submissions will show the "something went wrong" error.

- [x] **Quote form is a UI skeleton only** ([assets/quote-form.js:1](assets/quote-form.js#L1))
  - Fixed: `finish()` now also sends the quote details via Web3Forms (same access key as above) in addition to building the WhatsApp deep link. If the auto-send fails, an inline note on the success screen tells the visitor to tap WhatsApp as a backup.

- [x] **AI lead-capture chat doesn't auto-deliver leads** ([assets/lead-agent.js](assets/lead-agent.js), home + contact)
  - Fixed: `finish()` now also sends the captured lead via Web3Forms. WhatsApp remains as an additional one-tap option; if auto-send fails, the bot adds a note nudging the visitor to use WhatsApp.

> All three lead-capture paths share one Web3Forms access key in `assets/form-submit.js` — set it once and all three start working.

- [x] **AI lead-capture chat now answers free-text questions via Mistral** ([api/lead-ai.php](api/lead-ai.php), [assets/lead-ai.js](assets/lead-ai.js), [assets/lead-agent.js](assets/lead-agent.js), [contact.html](contact.html))
  - Fixed: when a visitor types a question (contains "?") at any text step, or uses the new "Have a question instead?" field on chip steps, the assistant calls a server-side PHP proxy to Mistral's API for a brief, on-brand answer grounded in the site's services/FAQ content, then returns to the current step. If the AI endpoint is unavailable (opened via `file://`, not configured yet, or rate-limited), the chat falls back to a friendly message nudging toward WhatsApp — the structured lead flow itself is unaffected either way.
  - **Configured:** `api/config.php` (gitignored) has a real Mistral API key and `allowed_origins` set to the production domain (plus localhost for testing).
  - **Recommended before launch:** set a low monthly spend cap on the Mistral account/API key — the endpoint is reachable by anyone who can load the contact page (Origin checks + a per-IP daily cap of 30 requests reduce but don't eliminate abuse risk).

## P2 — Analytics & Search Console

- [x] Add Google Analytics / GTM — GTM container `GTM-PCMSJTHF` added to every page (head snippet + body noscript). Meta Pixel skipped for now (no ads running); can be added as a tag inside GTM later with no code changes.
  - **Action needed in GTM:** confirm a GA4 Configuration tag (Measurement ID `G-MZ77DCNJZ4`) exists, fires on All Pages, then **Submit → Publish** the container — tracking won't go live until published.
- [ ] Verify the site in Google Search Console and submit `sitemap.xml` so indexing/search performance can be monitored.

## P3 — Dead footer social links

- [x] Footer social icons fixed on all 17 pages that have them: X now links to `https://x.com/webtechsolke`, LinkedIn to `https://www.linkedin.com/in/webtech-solutions-575833416/` (both open in new tab with `rel="noopener"`); the GitHub icon was removed entirely.

## P4 — Final QA pass

- [ ] Run the headless-Chrome mobile/desktop sweep (instructions.md §5/§7 — real device emulation, no console errors, no horizontal overflow, screenshots) on the pages added most recently and not yet verified: `ai-agents.html` and the 5 new blog posts (`rank-your-business-on-google-kenya.html`, `whatsapp-ai-agent-for-kenyan-businesses.html`, `mpesa-checkout-online-store.html`, `website-cost-in-kenya.html`, `google-business-profile-local-seo-checklist.html`, `whatsapp-business-vs-ai-agent.html`).
- [ ] After deploy, smoke-test `.htaccess` rewrite rules on the real Apache host: HTTPS force, non-www redirect, and extension-less clean URLs — these can't be verified by opening files locally.
- [ ] After deploy, smoke-test `/api/lead-ai.php`: ask a question in the contact-page lead chat and confirm a relevant AI reply appears; confirm a request from another Origin gets 403; confirm a 31st request from the same IP in one day gets the rate-limit fallback.

## P5 — Minor housekeeping

- [ ] Remove the stray `uploads/WhatsApp Image 2026-06-08 at 19.30.05.jpeg` (gitignored + crawl-blocked, but likely stale local clutter).
- [ ] `assets/webtech-logo.png` (used as OG/Twitter image) is 172KB — within budget but the largest asset on the site; a WebP version would trim it slightly. Low priority since OG images aren't render-blocking.

Deployment steps
Upload the new/changed files to your Apache host:

api/lead-ai.php
api/config.php — this is gitignored, so if you deploy via git pull, it won't come along automatically. Upload it separately via SFTP/cPanel file manager. Confirm it's NOT web-readable as a directory listing (Apache won't serve .php source anyway, so this is fine).
assets/lead-ai.js, updated assets/lead-agent.js, assets/styles.css
contact.html (new script tags) and the other 16 HTML files (cache-bust bump)
Confirm allowed_origins in api/config.php — it's already set to https://webtechsolutionske.com, which matches your canonical domain (your .htaccess forces non-www + HTTPS), so this should be correct out of the box.

Confirm PHP ≥ 7.4 is enabled on the host (cPanel → MultiPHP Manager, or ask your host). Almost all shared Apache hosts have this by default.

File permissions — PHP needs write access to api/ so it can create the api/.rate-limit/ directory on first request. Standard shared-hosting permissions (script runs as the site's user) handle this fine; no action usually needed.

Smoke-test on the live site (already noted in tasks.md P4):

Open the real contact page, ask a question in the lead chat → confirm a relevant AI reply (not the fallback).
curl -i -X POST https://webtechsolutionske.com/api/lead-ai.php -H "Origin: https://evil.com" -d '{"message":"hi"}' → should return 403.
(Optional) hammer it 31 times in a day from the same IP to confirm the 429 rate-limit fallback.
Set a low spend cap on the Mistral key at console.mistral.ai before going live — the endpoint is publicly reachable from the contact page.

If php -S works locally and you want, I can walk through the local test live with you now.
