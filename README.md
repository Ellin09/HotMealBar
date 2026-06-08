# Gourmet Kitchen | Exquisite Hot Meals

> [!NOTE]
> This repository is a high-fidelity frontend mockup created for a competition that will be held on **15 June**.

A high-performance, responsive, and frontend-only **Hot Meal Food Ordering System** designed with premium modern aesthetics, rich micro-animations, and a highly interactive user experience.

---

## ✨ Key Features

### 🛒 Customer Journey
- **Interactive Home Page**: Features premium hero banners, dynamic categories, promotional cards, and a quick-reorder utility for return visitors.
- **Advanced Catalog Search & Filters**: Handles quick search and multiple filtering parameters (price range, ratings, cooking time, ingredients search) with high-speed dynamic sorting.
- **Detailed Product Modals**: Showcases ingredients lists, customer review streams, and add-to-cart helpers.
- **Slide-out Cart Panel**: Allows real-time quantity adjustments, cart totals, and item removals.
- **Checkout & Active Tracking Simulation**: Includes address inputs, mock payment configuration, and a live en-route delivery tracking page that updates step-by-step progress and map coordinates using a background state loop.

### 📊 Admin Panel
- **Real-Time KPI Dashboard**: Displays total orders, revenue, active deliveries, and client ratings with a custom Canvas-based sales trend line chart.
- **Interactive Orders Ledger**: Search, filter, and modify order stages (Pending, Prep, Out for Delivery, Delivered, Cancelled) dynamically.
- **Customer Profiles Directory**: Lists customers, registration dates, order frequencies, and lifetime value metrics.

---

## 🎨 Design System

We avoided standard bright reds, yellows, and greens, opting for a custom-tailored, premium palette:
- **Primary / Brand Dark**: Navy (`#1b263b`)
- **Accent Color**: Warm Copper (`#c97c5d`)
- **Secondary**: Slate Blue (`#415a77`)
- **Background Blocks**: Soft Ivory (`#f8f5f2`)

---

## 📂 Project Structure

```
├── data/
│   ├── meals.json        # 50 detailed meals
│   ├── customers.json    # 250 registered customers
│   ├── orders.json       # 300 orders
│   ├── delivery.json     # Coordinates & delivery statuses
│   └── ratings.json      # 300 reviews & ratings
├── src/
│   ├── css/
│   │   └── index.css     # Tailwinds baseline & custom styles
│   └── js/
│       ├── app.js        # Main layout coordinator & event listener
│       ├── store.js      # Central state store with order state machine
│       ├── data-loader.js# JSON dataset query parser & filter resolver
│       ├── components/
│       │   ├── cards.js  # Card HTML templates
│       │   ├── table.js  # Reusable data table builder
│       │   ├── charts.js # Canvas-based charts
│       │   └── tracking.js # Active delivery step trackers
│       └── views/
│           ├── customer.js # Customer pages controller
│           └── admin.js    # Admin dashboard pages controller
├── index.html
├── package.json
├── tailwind.config.js
└── postcss.config.js
```

---

## 🚀 How to Run the Project

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) (version 16 or higher) and `npm` installed.

### 1. Install Dependencies
Run the following command in the root folder of the project to install all dev dependencies:
```bash
npm install
```

### 2. Start the Development Server
Launch the local dev server:
```bash
npm run dev
```
By default, the application will run at **`http://localhost:5173/`**. Open this address in your web browser.

### 3. Build for Production
To bundle and optimize the project for production, run:
```bash
npm run build
```
This generates static files in the `/dist` directory. You can preview the production bundle locally with:
```bash
npm run preview
```