# LOVORA — Frontend Prototype

Romantic photo-printing & gifting store (React + Vite).
*Every Picture Deserves to Last Forever.*

## Run it

```bash
cd frontend
npm install
npm run dev        # http://localhost:5173
npm run build      # production build in dist/
```

## What's inside

| Route | Page |
|---|---|
| `#/` | Landing page — hero, categories, print service, bestsellers, occasions, testimonials |
| `#/print` | **Photo print flow** — multi-upload (drag & drop), crop & position, sizes 4×4 / 5×5 / 6×4 / 8×6 / A4, glossy / matte / polaroid, quantity, low-resolution warning, live price |
| `#/shop`, `#/shop/:category` | FNP-style gift catalogue with filters (category, occasion, sort) |
| `#/product/:id` | Product page — upload photo to personalise, message card, pincode check |
| `#/cart`, `#/checkout` | Cart, shipping (free above ₹499), address form, payment method, demo payment |
| `#/success/:id`, `#/orders` | Order confirmation & order tracking timeline |
| `#/login` | Customer login / signup |
| `#/admin` | **Admin dashboard** — orders, status tabs, download original + print-ready (300 DPI cropped) photos, print sheet, courier & tracking, status updates |

**Demo admin:** `admin@lovora.in` / `admin123` (or "Enter as admin" on the login page).

## Landing page

- Opening animation plays every time the site is opened or refreshed (`src/components/Intro.jsx`); tap to skip.
- Scroll-reveal (`data-reveal` in `src/pages/Home.jsx`), hover effects and hero parallax live in `src/home.css`.
- Photos in `src/assets/photos/` are cut from the client's reference design. Replace them with high-resolution originals using the same file names for the live site.

## Notes for the backend phase

- Auth, cart and orders are mocked in `src/store.jsx` (localStorage). Swap these functions for API calls.
- Original uploaded photos are kept untouched (`vault` in `src/utils.js`, IndexedDB) — upload them to S3 / Cloudinary in production.
- Crop is stored as normalised `{cx, cy, cw, ch}` so the backend can re-crop the original at full resolution.
- Payment modal in `src/pages/Checkout.jsx` is a placeholder for Razorpay / Cashfree.
- Product art is illustrated placeholders (`src/components/ProductArt.jsx`) — replace with real product photos.
- Prices & sizes live in `src/data.js`.

Built by TECHORA Tech.
