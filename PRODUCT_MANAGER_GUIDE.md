# UF Fashion Line — Product Manager Guide

**Website:** https://uf-fashion-line-ng.pages.dev  
**Editor:** https://app.pagescms.org  
**GitHub repository:** https://github.com/bahagogabriel/uf-fashion-line

The shop remains hosted on Cloudflare Pages. The product editor is Pages CMS, which commits changes directly to this GitHub repository. No custom admin server or monthly database bill is required.

## One-time setup (repository owner)

1. Open https://app.pagescms.org and **Sign in with GitHub**.
2. If asked to install or authorize the **Pages CMS GitHub App**, select **Only select repositories** and grant access to `bahagogabriel/uf-fashion-line`.
3. Open **UF Fashion Line** in Pages CMS. The file `.pages.yml` already defines the product editor; you do **not** need to recreate it.
4. Open **Products — UF Fashion Line**. The existing 22 products are already loaded from `data/products.json`.
5. Bookmark the editor on your phone.

## Change a price

1. Open **Products — UF Fashion Line** and locate the product.
2. Update **Price (NGN)** using digits, e.g., `7500`. Do not type a naira sign or comma.
3. Save the change. Pages CMS writes a GitHub commit. Cloudflare Pages deploys the change automatically.
4. Refresh https://uf-fashion-line-ng.pages.dev and confirm the new price appears. Check its Cloudflare deployment status if it has not appeared yet.

## Add a product

1. Open the Products editor and add a new item to the list.
2. Enter **Product Name**, **Category**, **Price**, and upload a **Main Product Photo**.
3. Optionally add **More Product Photos**, **Sizes**, **Colour**, **Description** and a clearly labelled **Styled-on-Model Concept Photo**.
4. Keep **In Stock?** and **Show on Website?** switched on if you want it available to customers.
5. Save. The editor creates an automatic product ID; you should not edit the ID yourself.

For the first release, categories are **Jerseys, Shorts, Slides, and Clogs**. Contact the site maintainer before introducing an entirely new category.

## Mark an item sold out or hide it

- **In Stock? = Off:** Keeps it visible with a **SOLD OUT** label, disables **Add to Cart**, and removes it from saved carts the next time those customers load the updated site.
- **Show on Website? = Off:** Removes it from the shop and from any saved carts when customers next load the updated site.
- **In Stock? = On / Show on Website? = On:** Makes it available to browse and add to cart again.

## Add multiple photos

Use **Main Product Photo** for a genuine photo of the item. Use **More Product Photos** for additional real angles. Use **Styled-on-Model Concept Photo** only for an illustrative lifestyle image: the shop labels AI-styled views as concepts, not exact merchandise. Upload only images the seller has permission to use.

## Give the store owner access

The owner can manage products from his own GitHub account, without sharing yours.

1. Ask him to create a free GitHub account, if necessary.
2. On the `uf-fashion-line` repository, go to **Settings → Collaborators** and invite his GitHub account with write access.
3. After accepting the GitHub invitation, he opens https://app.pagescms.org and signs in with his GitHub account.
4. He then selects the repository and opens **Products — UF Fashion Line**.

**Permissions reminder:** GitHub write access permits code changes as well as product edits. Only grant it to someone you trust. Email-only product collaborator access may depend on Pages CMS's plan and should not be assumed free.

## How the site works

- The **editable product data** is in `data/products.json`.
- The **editor structure** is in `.pages.yml`.
- The website loads the JSON catalogue on each visit. The original `catalog.js` remains a fallback if the editable product file cannot be reached.
- The product pictures live in `assets/products/`.
- The **WhatsApp Cart** sends products to **+234 813 214 6287**. The website does not collect online payments.

## If changes aren't visible

1. Make sure you clicked **Save** in Pages CMS.
2. Confirm the latest commit appears on the GitHub `main` branch.
3. Check the deployment status under **Cloudflare → Workers & Pages → uf-fashion-line-ng → Deployments**.
4. Refresh the site. Do not edit `catalog.js` as your normal product workflow; use Pages CMS.

**Business reminder:** Confirm actual stock, sizes, prices and product authenticity claims before taking payment, especially for branded products.
