# UF Fashion Line — Website & Product Manager Guide

**Live website:** https://uf-fashion-line-ng.pages.dev/  
**Editing dashboard:** https://app.pagescms.org/  
**GitHub repository:** https://github.com/bahagogabriel/uf-fashion-line

UF Fashion Line stays on GitHub and Cloudflare Pages. Pages CMS is the free content editor. There is no new database, monthly hosting charge, or separate admin server.

## Open Pages CMS

1. Sign in at https://app.pagescms.org/ with a GitHub account allowed to edit the repository.
2. Select **bahagogabriel/uf-fashion-line** and the **main** branch.
3. Open one of the three sidebar areas below and save your changes.

## 01 — Products & Stock

Open **All Products — Prices, Photos & Stock** to edit the product catalogue.

- **Product name:** the name customers see.
- **Category:** Jerseys, Shorts, Slides, or Clogs.
- **Price:** use digits only, such as `7500`. Never type a naira sign or comma.
- **In stock?** Turn off to keep the product visible but show SOLD OUT and disable adding it to the cart.
- **Show on website?** Turn off to hide the product without deleting it.
- **Main REAL product photo:** use an actual photo of the item. This remains the first/default photo.
- **On Model lifestyle photo:** optional secondary picture featuring someone wearing the product.
- **More REAL product photos:** optional other angles or close-ups, up to eight.
- **Sizes:** add each size separately, e.g. 41, 42, XL.
- **Colour, Description, Small catalogue label:** optional text.
- **Internal ID and Automatic ID:** do not edit these.

To add a product, add an item at the end of the list, provide the product name, category, price and main image, and save.

## 02 — Website Sections

**Homepage & Shop Intro** can change the top announcement, homepage headline and subheading, descriptive paragraph, button text, category/shop introductions and homepage photographs. Use a wide landscape image for desktop and a vertical photo for mobile. The buttons keep their existing destinations.

**About & Featured Campaign** can change the campaign heading, descriptive copy, picture and button wording; and the About Us section's text and image.

**How To Shop Instructions** can change the title and all three guidance steps that explain how ordering works.

## 03 — Store & Contact

**WhatsApp, Instagram & Contact** can change the real business WhatsApp destination, number displayed to customers, Instagram profile link, contact section, footer tagline and cart reminder.

For the WhatsApp order number use Nigeria's international format, **2348132146287**, not `08132146287` or `+234...`. If the value is not a valid 234-prefixed number, the previous verified number is kept as a safety fallback.

For Instagram enter an address such as `https://www.instagram.com/youraccount/`. Keep it empty until the profile is ready.

The store still does **not collect online payments**. Customers send their cart as a WhatsApp enquiry.

## Product Photos vs Website Photos

Pages CMS offers two media libraries:
- **Product Photos** → `assets/products/`; used for product, gallery and On Model images.
- **Website Photos** → `assets/images/`; used for homepage, promotional campaign and About Us pictures.

Keep the original merchandise photo as each product's main image. You can upload new photographs directly in the photo picker.

## Give the seller access

The seller creates a free GitHub account. In the repository choose **Settings → Collaborators**, invite the seller's username with the appropriate access, and have him accept. He then signs into Pages CMS using his GitHub account. Do not share your personal GitHub password.

## Check your changes

After saving in Pages CMS, check the commit on the `main` branch. Cloudflare Pages deploys it automatically. Refresh the website and check on desktop and phone. If the change is missing, look under **Cloudflare → Workers & Pages → uf-fashion-line-ng → Deployments**.

The site's built-in copy and product catalogue fallback remain if an editable data file cannot be loaded. Contact the site maintainer before editing or deleting `.pages.yml`, `site.js` or `catalog.js`.

**Important:** Confirm stock, prices, sizes, delivery arrangements and any authenticity claims with the seller before payment.
