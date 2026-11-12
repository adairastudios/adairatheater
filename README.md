# Adaira Studios · Cinema In-Seat Dining Web App

A premium, mobile-first web application for contactless in-theatre food ordering and seat delivery, custom-tailored for Adaira Studios.

Guests scan a QR code placed on their cinema seat armrest or auditorium entry, browse artisanal gourmet popcorn, meals, and craft sips, pay securely via UPI, Card, or Apple Pay, and have their food delivered directly to their recliner without missing a scene.

---

## 🚀 Getting Started

Requires [Node.js](https://nodejs.org/) 20.19+ (or 22.12+). No API keys or environment variables are needed.

```bash
npm install        # install dependencies (required once before first run)
npm run dev        # start dev server at http://localhost:3000
npm run build      # production build into dist/
npm run preview    # serve the production build locally
npm run lint       # TypeScript type check
```

If port 3000 is already in use, Vite automatically picks the next free port. Check the terminal output for the URL.

Static assets (logo, food photography) live in `public/assets/` and are served from `/assets/...`.

---

## 🌟 Key Features & User Flows

1. **QR Seat Landing (`/?theatre=...&screen=...&seat=...`)**:
   - Detects the theatre, auditorium/screen, and seat number directly from URL parameters (e.g. `/?screen=Screen 3&seat=F12`).
   - Displays the Adaira Studios lime & sky monogram logo with an entrance animation.
   - If a guest changes seats or scans a generic lobby QR, they can manually select their screen and seat via an interactive auditorium map.

2. **Artisanal In-Theatre Menu**:
   - 22 realistic items categorized across **Popcorn, Snacks, Meals, Beverages, Desserts, and Combos**.
   - Sticky category navigation bar that tracks scrolling.
   - Real-time search by dish name, ingredients, or tags.
   - Veg / Non-Veg segmented filter with cinema-standard dietary indicators (green circle for veg, red triangle for non-veg).
   - High-fidelity food photography with hover zoom and styled CSS fallbacks.
   - Dynamic **Add** button that transforms into a spring-animated quantity stepper `[- qty +]`.

3. **Bottom Sheet Dining Tray & Cart**:
   - Floating cart pill at the bottom with item count, seat indicator, and grand total.
   - Frosted glass bottom sheet modal with smooth drag handle.
   - Special instructions per item (e.g. "extra truffle butter", "no ice", "whisper on delivery").
   - Transparent bill breakdown: Subtotal, In-Seat Delivery fee (₹30, free above ₹999), GST (5%), and Total. All prices are in Indian Rupees (₹).

4. **Express Contactless Checkout**:
   - Guest contact details with simulated instant OTP verification.
   - Pre-filled, editable seat confirmation.
   - Delivery timing preference: **"Deliver ASAP (~12-15 mins during show)"** or **"Deliver at Intermission / Interval"**.
   - Mock payment gateway supporting **UPI / QR (GPay, PhonePe, Paytm)**, **Credit/Debit Card (Stripe/Razorpay-ready)**, and **Apple Pay / Cinema Dining Pass**.

5. **Payment Processing Animation**:
   - Step-by-step POS encryption and dispatch animation.
   - Celebratory electric lime & sky blue confetti burst upon payment confirmation.
   - Built-in "(Test Failure State)" toggle to verify error handling and retries.

6. **Live Order Tracking**:
   - 4-step real-time progress timeline:
     1. **Order Placed** (Received at kitchen terminal)
     2. **Preparing in Kitchen** (Chef active)
     3. **On the Way to Your Seat** (Usher walking auditorium aisle)
     4. **Delivered** (Enjoy the film!)
   - Live arrival countdown timer.
   - Itemized receipt summary with order number (`#AD-XXXX`).
   - **"Need Help? / Call Floor Usher"** button allowing guests to summon cinema staff for water, extra napkins, cutlery, or assistance without leaving their seat.

7. **Kitchen Display System (KDS) & Admin View (`/admin`)**:
   - Live incoming order tickets with auditorium screen and seat number prominently highlighted.
   - One-tap status progression: `Start Preparing` → `Dispatch / On the Way` → `Mark Delivered`. Status immediately synchronizes with customer tracking in real-time across tabs!
   - Kitchen order audio chime toggle.
   - **Stock Manager**: Toggle menu items in or out of stock with real-time "Sold Out" overlay on the guest menu.
   - **Floor Usher Request Queue**: Displays guest assistance calls with a "Mark Resolved" action.
   - **Seat QR Code Generator & Tester**:
     - Generate seat QR stickers for any screen (Screen 1–4, IMAX 70mm, VIP Lounge) and seat (A01 to H18).
     - Print / Download Armrest Tent-Card preview.
     - **"Test Guest Scan" button**: Instantly loads the guest view as if scanning that exact seat's physical QR sticker.

---

## 🎨 Brand Design System

- **Primary Accent**: Electric Lime (`#D9F20A`) for CTAs, active states, prices, and glows.
- **Secondary Accent**: Soft Sky Blue (`#8DBBDA`) for secondary text, labels, and borders.
- **Canvas Background**: Deep near-black navy (`#07090F` → `#0D1220` gradient) with large blurred lime and sky blue ambient orbs.
- **Glassmorphism**: `rgba(255,255,255,0.07)` frosted glass, `backdrop-filter: blur(20px) saturate(140%)`, 1px borders, rounded 24px corners.
- **Typography**:
  - Headings: Serif display font (*Playfair Display*) echoing cinema luxury.
  - Body & UI: Clean geometric sans (*Plus Jakarta Sans*).
  - Letter-spacing: Wide uppercase tracking on brand markers (*STUDIOS*).

---

## 📱 Seat QR Codes

Each seat QR opens a short link to the live site, e.g. `https://your-site.vercel.app/?screen=imax&seat=H12`.

| Screen | Code in link |
|---|---|
| Screen 1–4 | `1`, `2`, `3`, `4` |
| IMAX 70mm | `imax` |
| VIP Lounge | `vip` |

Seats run Row A–H, Seat 01–14 (112 seats per screen).

### Making QR codes for printing

1. Deploy to Vercel, then open **`https://your-site.vercel.app/admin`** on the live site. QR codes always point to the address the admin page is opened on, so **don't print codes made on `localhost`** (the page shows a warning if you try).
2. Open the **Seat QR Generator & Tester** tab and pick a screen, row and seat.
3. Use **Download PNG** (high-res QR image), **Print Card** (one seat card), or **Print All 112 Seats** (an A4 sheet of cut-out cards for the whole screen).
4. Scan the printed card with a phone camera to confirm it opens the menu with the right seat.

To pin QR codes to a custom domain regardless of where the admin page is opened, set `VITE_PUBLIC_SITE_URL=https://your-domain.com` in Vercel → Project Settings → Environment Variables and redeploy.

The **Test Guest Scan** button simulates a scan in the same browser.
