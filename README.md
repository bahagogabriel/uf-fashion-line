# UF Fashion Line — storefront catalogue (Build 1)

A lightweight static storefront for a Nigerian fashion retailer, built from 22 product screenshots dated 20 November 2026. No npm dependencies, backend, or payment processing.

## Contents
- `index.html`, `styles.css`, `site.js`: responsive storefront, searchable products, filtering, product-details dialog and shopping cart.
- `catalog.js`: 22 products with exact listing names/prices from merchant screenshots and available sizes as shown.
- `assets/products/item-01.webp` … `item-22.webp`: crops of the photos visible in the merchant-supplied screenshots. Low-resolution first-release imagery; originals can be replaced later.
- `assets/images/`: clearly illustrative campaign visuals (NOT exact items from the screenshot catalogue).
- `assets/brand/`: UF brand logo SVGs.
- `site.config.js`: verified business WhatsApp number (+234 813 214 6287); cart items are sent to WhatsApp with a prefilled message for the seller.

## IMPORTANT
Product names, prices and sizes are quoted from the original merchant listings and were not independently checked. Do not treat branded names, words like 'Original', or photographs as proof of authenticity. Please verify stock, legitimacy, sizes, prices and permission to use the photos before a paid transaction. No secure checkout is claimed or implemented.

## Cloudflare Pages (Git integration)
1. Go to https://dash.cloudflare.com/ and select **Workers & Pages → Create application → Pages → Connect to Git** (wording can change).
2. Authorize GitHub and choose `bahagogabriel/uf-fashion-line`, branch `main`.
3. Select framework **None** / no framework. **Build command:** none (leave empty). **Build output:** `/` (repository root). Project name `uf-fashion-line` if available; Cloudflare may offer another slug.
4. Deploy, then use the assigned `*.pages.dev` URL. GitHub commits to `main` redeploy automatically.
5. Cart messages use the seller-verified number (+234 813 214 6287). Confirm stock, prices, sizes and delivery with the seller before collecting payments.

## Update catalogue
Edit `catalog.js` and add/update images in `assets/products/`; or use the optional `tools/import_catalog.py` with a CSV. Pricing is numeric NGN.

## Notes
Marketing hero photographs are AI-designed illustrative branding, clearly distinguished from the merchandise listing photos. Check that business owner approves logo and rights to imagery before public promotion.
