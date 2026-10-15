# RUPAI SHOP — Premium Fashion

A static, responsive storefront starter using the RUPAI burgundy brand color `#861830`.

## Files
- `index.html` — storefront structure
- `styles.css` — responsive design
- `app.js` — interactive demo catalog
- `assets/rupai-logo.jpg` — supplied RUPAI logo

## Important
The products currently shown are demo preview data, not live supplier inventory. No supplier API credentials are included. Next step is to create a Cloudflare Worker that calls `POST https://api.shadamonshop.com/rest/v1/rpc/get_reseller_catalog` using Cloudflare Secrets and returns only safe public product fields. Never expose `reseller_price`, `apikey`, or `Authorization` to browser code.

Pricing mapping discussed for this shop:
- `original_price`: display/sale price
- `price`: previous/list price (show crossed out only if greater than display price)
- `reseller_price`: private reseller cost, never return to public catalog

## Run locally
Open `index.html` in a browser. For live deployment, upload the files to GitHub and connect the repository to Cloudflare Pages.
