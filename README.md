# Hot Meal Bar 好米巴 — Halal Chinese Kitchen

A modern, frontend-only food‑ordering experience for **Hot Meal Bar (好米巴)**, a Halal Chinese kitchen serving hand‑folded dumplings, hand‑pulled *Mee Tarik*, charcoal skewers and Beijing noodles since **1989**.

Built for the **VibeUI Challenge 2026**.

> 🌐 **Live site:** https://ellin09.github.io/HotMealBar/

---

## ✨ Features

**Customer side**
- Eye‑catching home page with hero photo collage, animated marquee, heritage story and real customer reviews
- Full menu catalog (50 dishes) with live search, category filters, sorting and pagination
- Dish detail modal with ingredients, reviews and ratings
- Slide‑out shopping cart with quantity controls (saved to `localStorage`)
- Checkout flow and **live, simulated order tracking** (animated map + status stepper)
- "Join Us" student‑reseller application form
- Track‑order lookup by order ID

**Admin side**
- Dashboard with KPIs, a hand‑drawn HTML5 Canvas revenue chart and top‑selling dishes
- Orders ledger with search, status filter, pagination and inline status updates
- Customer directory with spend aggregation

## 🎨 Design language
- **Palette:** deep navy, wok‑orange, teal, gold and chilli‑red on a warm paper‑grain backdrop
- **Type:** `Fraunces` (display serif), `Plus Jakarta Sans` (body), `Caveat` (handwritten accents)
- Brand colours and food photography taken from the real Hot Meal Bar identity

## 🛠️ Tech
- Vanilla JavaScript (ES modules) — no framework
- **Tailwind CSS via the Play CDN** (compiles in the browser, so there is **no build step**)
- Static JSON datasets (`/data`) loaded with `fetch`
- 100% client‑side — deployable to any static host

## ▶️ Run locally
No Node.js required — just serve the folder over HTTP:

```bash
# Python 3
python -m http.server 5500
# then open http://127.0.0.1:5500
```

> Opening `index.html` directly with `file://` will not work because the app uses `fetch` and ES modules, which require an HTTP server.

## 📁 Structure
```
index.html            # App shell + Tailwind config + brand styles
assets/               # Logo + real food photography
data/                 # meals, orders, customers, delivery, ratings (JSON)
src/js/
  app.js              # Router / orchestrator
  store.js            # State + cart + order simulation
  data-loader.js      # Query/sort/paginate engine
  views/              # customer.js, admin.js
  components/         # cards, table, charts, tracking
```

## 🔐 Halal
All recipes and copy reflect a fully Halal kitchen. Beef/lamb references are halal; no pork or non‑halal ingredients are used anywhere in the menu.

---
© 2026 Hot Meal Bar 好米巴 · Built for the VibeUI Challenge 2026.
