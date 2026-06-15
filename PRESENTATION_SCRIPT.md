# 🎤 Hot Meal Bar — Presentation Script

**How to use this:** Just read the lines in the boxes out loud. The *(italic notes)* tell you what to click or do — don't read those parts. Take your time and breathe between sections. Total time: about 5–6 minutes.

---

## 0. Before you start (setup — do this 2 minutes early)
- *(Open the live website link in your browser, full screen.)*
- *(Have the home page showing. Zoom the browser to about 90–100% so everything fits.)*
- *(If presenting the admin part, know that you click **“Admin Panel”** at the top right.)*

---

## 1. Opening (15–20 seconds)

> "Assalamualaikum / Hello everyone. Today I'm presenting **Hot Meal Bar** — in Chinese, *Hǎo Mǐ Bā* — a website I built for a Halal Chinese restaurant that has been around since **1989**.
>
> It's an online food‑ordering website where customers can browse the menu, add food to a cart, order, and even **track their delivery live** — and the restaurant owner gets an **admin dashboard** to manage everything."

---

## 2. The big idea — why it looks the way it does (30 seconds)

> "My goal was to make it look like a **real neighbourhood Cha Chaan Teng** — not a generic template. So I used the restaurant's actual logo and real photos of their food: the hand‑folded dumplings, the charcoal chicken skewers, the Beijing noodles.
>
> The design is inspired by old Hong Kong **printed menus and ink stamps** — colours are **ink black, chili red, jade green and brass on cream paper**. I used a bold condensed font for headlines and a **Chinese brush font** for the restaurant name, so it feels like a genuine family-run kitchen, not a stock website. Every card is a hard-edged **menu ticket** with dotted price leaders and stamped accents."

---

## 3. Walk through the HOME page (60–90 seconds)
*(Stay on the home page. Slowly scroll down as you talk.)*

> "At the top we have the **hero section** — designed like a **menu cover**. There's a big condensed headline, a flickering **neon OPEN** sign, and a red **chop seal** with the restaurant's Chinese name 好米巴 stamped on it.
>
> Just below, three promises on paper cards: the food is **folded fresh daily**, the kitchen is **100% Halal**, and delivery is **hot in 35 minutes**."

*(Keep scrolling.)*

> "Here you can pick what you're craving by category — dumplings, noodles, skewers and so on. Then these are the **bestsellers**, shown as **printed menu tickets** with dotted price lines and brush-style Chinese names.
>
> Further down is the restaurant's **story since 1989**, and **real reviews** from happy customers. Everything you see — the prices, ratings and reviews — comes from real data files in the project."

---

## 4. Show the MENU and ordering (60 seconds)
*(Click **“Our Menu”** in the top menu.)*

> "This is the full menu — 50 dishes. I can **search** for something…"

*(Type "dumpling" in the search box.)*

> "…and it filters instantly. I can also filter by category and sort by price or rating."

*(Click on any dish image to open the popup.)*

> "Clicking a dish opens its details — the description, ingredients and customer reviews."

*(Click **“Add to Cart”**. The cart slides open.)*

> "When I add it to the cart, this panel slides out. I can change the quantity here, and it remembers my cart even if I refresh the page."

*(Click **“Proceed to Checkout”**.)*

> "At checkout I enter my delivery details and choose a payment method, then place the order."

*(Fill the form quickly and click **Place Order**.)*

---

## 5. The star feature — LIVE ORDER TRACKING (45 seconds)
*(You should now be on the tracking page after placing the order.)*

> "And here's my favourite part — **live order tracking**. Watch the status bar: the order moves automatically from *Received*, to *Preparing*, to *Cooking*, to *Out for delivery*, and finally *Delivered* — and the little delivery rider moves across the map in real time.
>
> Once it says *Delivered*, the customer can leave a **star rating and review**, which then appears on the site."

---

## 6. The ADMIN dashboard — Kitchen Control Room (45 seconds)
*(Click **“Admin Panel”** at the top right.)*

> "Now from the **owner's side** — I call this the **Kitchen Control Room**. It's a dark, dense dashboard so the kitchen staff can read it at a glance. You get animated KPI counters for sales, orders and ratings.
>
> The analytics show a **revenue chart**, a **conic-gradient category donut**, a **peak-hours heatmap**, and a **live order ticker** that scrolls the latest orders in real time."

*(Click **“KDS Board”** in the left sidebar.)*

> "This is the **KDS Kanban** — orders flow across columns: **New, Prepping, On the Wok, Out for Delivery**. Each ticket has a **live ticking timer** that turns from green to red by urgency, and you can **Bump** a ticket to advance it instantly."

*(Press **Ctrl / ⌘ + K**.)*

> "And there's a **Command Palette** — hit Ctrl-K anywhere to jump between views, search orders, or open analytics without touching the mouse."

*(Click **“Exit Admin Panel”** to go back.)*

---

## 7. How I built it — in simple words (30 seconds)

> "Technically, the whole website runs in the browser with no complicated setup. I used **plain JavaScript** and **Tailwind CSS** for styling. The menu, orders and customers are stored in data files that the page reads automatically.
>
> Because it's all standard web files, I was able to put it **live on the internet for free using GitHub Pages**."

---

## 7b. Why this is different (say this if you want to stand out!)

> "A lot of websites today look the same. I worked hard to make mine feel like a **real brand**, not a template:
>
> - It opens with a **branded loading screen** with rising steam — a little wow moment.
> - I designed a **traditional red Chinese 'chop' seal** with the restaurant's name 好米巴 — you'll see it on the hero and in the footer. That's a unique, cultural touch.
> - The whole customer side is a **retro editorial Cha Chaan Teng theme** — ink-black and cream paper cards, hard-edged menu tickets with dotted price leaders, and a brush-font Chinese name.
> - The **admin side flips into a dark Kitchen Control Room** — completely distinct from the bright storefront, with a KDS kanban board, live ticking timers, a peak-hours heatmap, and a command palette.
> - It's **accessible** — it respects 'reduced motion' settings and has clear keyboard focus outlines.
> - And I **tested it with an automated script** that checks every button, link, image and data file — it even caught and fixed a real bug."

---

## 8. Closing (15 seconds)

> "So that's **Hot Meal Bar** — a beautiful, fully working food‑ordering website with a retro editorial storefront, live delivery tracking, and a **Kitchen Control Room** admin with KDS kanban and analytics. Built around a real Halal Chinese restaurant's identity. Thank you! I'm happy to take any questions."

---

## 🙋 If someone asks a hard question — easy answers

- **"Is it connected to a real database?"**
  > "Not a live database — it uses local data files to simulate one, which is perfect for a front‑end demo. The structure is ready to plug into a real backend later."

- **"Does the payment actually charge money?"**
  > "No — it's a demo checkout, so no real money moves. It shows the full flow safely."

- **"How is the delivery tracking real‑time?"**
  > "When you place an order, the code runs a timer that advances the status every few seconds and animates the map, to simulate a real delivery."

- **"Why does it look different from typical templates?"**
  > "I deliberately built a retro editorial Cha Chaan Teng look — ink black and chili red on cream paper, hard-edged menu tickets with dotted price leaders, a condensed grotesque headline font and a Chinese brush accent font — so it feels like a genuine family restaurant, not a stock template. The admin side is a completely separate dark Kitchen Control Room theme."

- **"What did you use to build it?"**
  > "HTML, CSS (Tailwind), and JavaScript — no framework — and it's hosted free on GitHub Pages."

---

### ⏱️ Quick 60‑second version (if you're short on time)
> "This is **Hot Meal Bar**, an online ordering website for a Halal Chinese restaurant. Customers browse a **retro editorial menu** with printed ticket cards, add food to a cart, check out, and **track their delivery live on a map**. The owner gets a **Kitchen Control Room** admin with a **KDS kanban board**, live analytics, and a **command palette**. I built it with HTML, Tailwind CSS and JavaScript, used the restaurant's real logo, colours and food photos so it feels authentic, and hosted it for free on GitHub Pages. Thank you!"
