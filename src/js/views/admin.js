// admin.js - "Kitchen Control Room": KDS kanban, live analytics & command palette

import { store } from '../store.js';
import { dataLoader } from '../data-loader.js';
import { renderPagination } from '../components/table.js';
import { renderRevenueChart } from '../components/charts.js';

// Local admin states
let ordersFilters = {
  search: '',
  status: 'All',
  page: 1,
  limit: 12
};

let customersFilters = {
  search: '',
  page: 1,
  limit: 12
};

// ---- KDS configuration ----
const KDS_COLUMNS = ['received', 'preparing', 'cooking', 'out_for_delivery'];
const STATUS_LABEL = {
  received: 'New Orders', preparing: 'Prepping', cooking: 'On the Wok',
  out_for_delivery: 'Out for Delivery', delivered: 'Delivered'
};
const NEXT_STATUS = {
  received: 'preparing', preparing: 'cooking', cooking: 'out_for_delivery', out_for_delivery: 'delivered'
};
const BUMP_LABEL = {
  received: 'Start prepping', preparing: 'Send to wok', cooking: 'Dispatch', out_for_delivery: 'Mark delivered'
};
const COL_ACCENT = {
  received: '#DFB752', preparing: '#DC5A4D', cooking: '#E0552D', out_for_delivery: '#2E9E78'
};
// Dark control-room surfaces
const TILE = 'bg-[#2A231F] border-2 border-[#4C4138]';

// Stable hash so each order gets a consistent simulated "ticket age"
function hashStr(s) { let h = 0; for (let i = 0; i < String(s).length; i++) h = (h * 31 + String(s).charCodeAt(i)) >>> 0; return h; }
function fmtMMSS(totalSec) { const m = Math.floor(totalSec / 60); const s = Math.floor(totalSec % 60); return `${m}:${String(s).padStart(2, '0')}`; }
function urgencyColor(min) { return min < 8 ? '#2E9E78' : (min < 15 ? '#DFB752' : '#DC5A4D'); }
function escapeHtml(s) { return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }

export const adminViews = {
  // Render Dashboard KPI summaries, Canvas Charts & Top meals lists
  // Shared "control room" header with live clock + command palette trigger
  _controlRoomHeader(subtitle) {
    return `
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b-2 border-[#4C4138] pb-4">
        <div>
          <p class="font-brush text-3xl text-accent-light leading-none">好米巴 · 厨房</p>
          <h1 class="font-display text-3xl md:text-4xl font-bold uppercase tracking-tight text-cream-light leading-none mt-1">Kitchen Control Room</h1>
          <p class="text-[11px] text-cream-light/45 uppercase tracking-[0.2em] mt-1.5">${subtitle}</p>
        </div>
        <div class="flex items-center gap-3">
          <span class="flex items-center gap-2 text-[11px] uppercase tracking-wider text-success-light"><span class="w-2 h-2 rounded-full bg-success-light animate-pulse"></span>Live</span>
          <span id="kds-clock" class="font-display text-2xl text-cream-light tabular-nums">--:--:--</span>
          <button onclick="window.app.openCommandPalette()" class="font-display uppercase tracking-wider text-xs border-2 border-[#4C4138] text-cream-light/80 px-3 py-2 hover:border-accent hover:text-accent transition-colors cursor-pointer">⌘K Commands</button>
        </div>
      </div>`;
  },

  // Live ticker / KDS timers — self-clears when leaving admin
  _startTimers() {
    if (this._timer) clearInterval(this._timer);
    this._renderTs = Date.now();
    const tick = () => {
      const clock = document.getElementById('kds-clock');
      const tickets = document.querySelectorAll('.kds-time[data-base]');
      if (!clock && tickets.length === 0) { clearInterval(this._timer); this._timer = null; return; }
      if (clock) clock.textContent = new Date().toLocaleTimeString();
      const sinceRender = (Date.now() - this._renderTs) / 1000;
      tickets.forEach(el => {
        const totalSec = (parseInt(el.dataset.base, 10) || 0) + sinceRender;
        el.textContent = fmtMMSS(totalSec);
        const col = urgencyColor(totalSec / 60);
        el.style.color = col;
        const ticket = el.closest('[data-ticket]');
        if (ticket) ticket.style.borderLeftColor = col;
      });
    };
    tick();
    this._timer = setInterval(tick, 1000);
  },

  // ===================== DASHBOARD =====================
  renderDashboard(container) {
    const metrics = dataLoader.getAdminMetrics();
    const orders = store.state.orders;
    const k = metrics.kpis;

    // Revenue by category -> donut
    const catRev = {};
    orders.forEach(o => { const m = store.state.meals.find(x => x.mealId === o.mealId); const cat = m ? m.category : 'Other'; catRev[cat] = (catRev[cat] || 0) + o.amount; });
    const catEntries = Object.entries(catRev).sort((a, b) => b[1] - a[1]);
    const catTotal = catEntries.reduce((s, [, v]) => s + v, 0) || 1;
    const palette = ['#C5362B', '#DFB752', '#2E9E78', '#E0552D', '#DC5A4D', '#9C7820', '#46A973', '#A89478'];
    let acc = 0;
    const stops = catEntries.map(([, v], i) => { const a = acc / catTotal * 360; acc += v; return `${palette[i % palette.length]} ${a}deg ${acc / catTotal * 360}deg`; }).join(', ');
    const legend = catEntries.map(([cat, v], i) => `<div class="flex items-center justify-between text-xs"><span class="flex items-center gap-2 text-cream-light/80"><span class="w-3 h-3" style="background:${palette[i % palette.length]}"></span>${cat}</span><span class="text-cream-light/50 font-display">${Math.round(v / catTotal * 100)}%</span></div>`).join('');

    // Peak hours heatmap (operating 10:00 - 21:00)
    const hours = Array.from({ length: 12 }, (_, i) => 10 + i);
    const hourCounts = hours.map(h => orders.filter(o => new Date(o.orderDate).getHours() === h).length);
    const maxHour = Math.max(...hourCounts, 1);

    // Live order ticker
    const ticker = [...orders].sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate)).slice(0, 12).map(o => {
      const m = store.state.meals.find(x => x.mealId === o.mealId);
      const c = store.state.customers.find(x => x.customerId === o.customerId);
      return `<span class="px-5 text-xs uppercase tracking-wider text-cream-light/65">#${o.orderId.slice(-5)} · ${m ? escapeHtml(m.mealName) : 'Meal'} · <span class="text-success-light">RM ${o.amount.toFixed(2)}</span> · ${c ? escapeHtml(c.name) : 'Guest'}</span><span class="text-accent">✦</span>`;
    }).join('');

    const kpi = (label, valueHtml, sub, color) => `
      <div class="${TILE} p-5 relative overflow-hidden">
        <div class="absolute top-0 left-0 w-1.5 h-full" style="background:${color}"></div>
        <p class="text-[10px] uppercase tracking-[0.18em] text-cream-light/45">${label}</p>
        <p class="font-display text-3xl md:text-4xl font-bold text-cream-light mt-1 leading-none">${valueHtml}</p>
        <p class="text-[11px] text-cream-light/40 mt-1.5">${sub}</p>
      </div>`;

    container.innerHTML = `
      <div class="bg-ink text-cream-light border-2 border-[#4C4138] shadow-hard p-5 md:p-7 space-y-6 animate-fade-in">
        ${this._controlRoomHeader('Live overview of the kitchen')}

        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
          ${kpi('Total Sales', `<span data-count="${k.totalRevenue}" data-prefix="RM ">0</span>`, 'All-time revenue', '#C5362B')}
          ${kpi('Total Orders', `<span data-count="${k.totalOrders}">0</span>`, 'Tickets processed', '#DFB752')}
          ${kpi('Active Now', `<span data-count="${k.activeOrders}">0</span>`, 'In the kitchen', '#E0552D')}
          ${kpi('Avg Rating', `<span data-count="${k.avgRating}">0</span><span class="text-accent-light text-2xl">/5</span>`, 'Across all reviews', '#2E9E78')}
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div class="lg:col-span-2 ${TILE} p-5 flex flex-col">
            <div class="flex items-center justify-between mb-4">
              <h3 class="font-display uppercase tracking-wide text-cream-light">Revenue · Last 7 Days</h3>
              <span class="text-[11px] text-cream-light/40 uppercase tracking-wider">RM aggregate</span>
            </div>
            <div class="relative w-full h-64"><canvas id="revenueChartCanvas" class="w-full h-full"></canvas></div>
          </div>
          <div class="${TILE} p-5">
            <h3 class="font-display uppercase tracking-wide text-cream-light mb-4">Sales by Category</h3>
            <div class="flex items-center gap-5">
              <div class="relative w-28 h-28 shrink-0 rounded-full" style="background:conic-gradient(${stops})">
                <div class="absolute inset-[24%] rounded-full bg-[#2A231F] flex items-center justify-center"><span class="font-display text-[10px] uppercase text-cream-light/55 text-center leading-tight">By<br>Category</span></div>
              </div>
              <div class="flex-grow space-y-1.5">${legend}</div>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div class="lg:col-span-2 ${TILE} p-5">
            <h3 class="font-display uppercase tracking-wide text-cream-light mb-4">Peak Hours <span class="text-cream-light/40 text-xs normal-case tracking-normal">· orders by hour</span></h3>
            <div class="grid grid-cols-12 gap-1.5">
              ${hours.map((h, i) => { const c = hourCounts[i]; const intensity = c / maxHour; return `<div class="flex flex-col items-center gap-1"><div class="w-full aspect-square border border-[#4C4138]" style="background:rgba(220,90,77,${(0.12 + intensity * 0.88).toFixed(3)})" title="${h}:00 — ${c} orders"></div><span class="text-[9px] text-cream-light/40">${h}</span></div>`; }).join('')}
            </div>
          </div>
          <div class="${TILE} p-5">
            <h3 class="font-display uppercase tracking-wide text-cream-light mb-3">Top Dishes</h3>
            <div>
              ${metrics.popularMeals.map((meal, idx) => `
                <div class="flex items-center justify-between py-2 border-b border-[#4C4138] last:border-0">
                  <div class="flex items-center gap-3 min-w-0">
                    <span class="w-6 h-6 border-2 border-accent text-accent font-display font-bold text-xs flex items-center justify-center shrink-0">${idx + 1}</span>
                    <div class="min-w-0"><h4 class="font-display uppercase text-sm text-cream-light leading-none truncate">${escapeHtml(meal.mealName)}</h4><span class="text-[10px] text-cream-light/40">${meal.category}</span></div>
                  </div>
                  <div class="text-right shrink-0"><span class="text-xs font-bold text-cream-light block">${meal.quantity}×</span><span class="text-[10px] text-success-light">RM ${(meal.price * meal.quantity).toFixed(2)}</span></div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>

        <div class="${TILE} overflow-hidden">
          <div class="flex items-center whitespace-nowrap animate-marquee py-2.5">${ticker}${ticker}</div>
        </div>
      </div>
    `;

    setTimeout(() => renderRevenueChart('revenueChartCanvas', metrics.revenueChart), 80);
    this._startTimers();
  },

  // ===================== KDS KANBAN =====================
  _ticket(o, status, accent) {
    const base = hashStr(o.orderId) % 1080; // 0–18 min simulated ticket age
    return `
      <div data-ticket class="${TILE} p-3.5 border-l-4" style="border-left-color:${accent}">
        <div class="flex items-center justify-between">
          <span class="font-display uppercase text-xs tracking-wider text-cream-light/55">#${o.orderId.slice(-6)}</span>
          <span class="font-display text-sm tabular-nums kds-time" data-base="${base}" style="color:${accent}">0:00</span>
        </div>
        <h4 class="font-display uppercase text-base text-cream-light leading-tight mt-1">${escapeHtml(o.mealName)} <span class="text-accent-light">×${o.quantity}</span></h4>
        ${o.mealZh ? `<p class="font-brush text-teal text-lg leading-none mt-0.5">${o.mealZh}</p>` : ''}
        <div class="flex items-center justify-between mt-2 text-[11px] text-cream-light/50"><span class="truncate">${escapeHtml(o.customerName)}</span><span class="text-success-light font-semibold shrink-0 ml-2">RM ${o.amount.toFixed(2)}</span></div>
        <button onclick="window.app.kdsBump('${o.orderId}')" class="mt-3 w-full font-display uppercase tracking-wider text-xs py-2 border-2 border-ink text-ink transition-all cursor-pointer hover:brightness-110 active:translate-y-0.5" style="background:${accent}">${BUMP_LABEL[status]} →</button>
      </div>`;
  },

  renderOrders(container) {
    const q = ordersFilters.search.trim().toLowerCase();
    let active = store.state.orders.filter(o => o.status !== 'delivered').map(o => {
      const c = store.state.customers.find(x => x.customerId === o.customerId);
      const m = store.state.meals.find(x => x.mealId === o.mealId);
      return { ...o, customerName: c ? c.name : 'Guest', mealName: m ? m.mealName : 'Meal', mealZh: m ? m.nameZh : '' };
    });
    if (q) active = active.filter(o => o.orderId.toLowerCase().includes(q) || o.customerName.toLowerCase().includes(q) || o.mealName.toLowerCase().includes(q));

    const byStatus = {};
    KDS_COLUMNS.forEach(s => byStatus[s] = []);
    active.forEach(o => { if (byStatus[o.status]) byStatus[o.status].push(o); });
    KDS_COLUMNS.forEach(s => byStatus[s].sort((a, b) => new Date(a.orderDate) - new Date(b.orderDate)));

    const column = (status) => {
      const accent = COL_ACCENT[status];
      const list = byStatus[status].slice(0, 14);
      return `
        <div class="flex flex-col min-w-[15rem]">
          <div class="flex items-center justify-between mb-3 pb-2 border-b-2" style="border-color:${accent}">
            <span class="font-display uppercase tracking-wider text-sm" style="color:${accent}">${STATUS_LABEL[status]}</span>
            <span class="font-display text-sm px-2 border-2" style="border-color:${accent};color:${accent}">${byStatus[status].length}</span>
          </div>
          <div class="space-y-3 overflow-y-auto pr-1" style="max-height:64vh">
            ${list.length === 0 ? `<p class="text-xs text-cream-light/25 italic py-8 text-center border-2 border-dashed border-[#4C4138]">No tickets</p>` : list.map(o => this._ticket(o, status, accent)).join('')}
          </div>
        </div>`;
    };

    container.innerHTML = `
      <div class="bg-ink text-cream-light border-2 border-[#4C4138] shadow-hard p-5 md:p-7 space-y-6 animate-fade-in">
        ${this._controlRoomHeader('Kitchen Display System — bump tickets as they progress')}
        <div class="flex flex-wrap items-center gap-3">
          <div class="relative w-full md:w-80">
            <input type="text" placeholder="Search ticket # / customer / dish..." value="${escapeHtml(ordersFilters.search)}" oninput="window.app.adminOrdersSearch(this.value)" class="w-full pl-9 pr-4 py-2 bg-[#2A231F] border-2 border-[#4C4138] text-cream-light rounded-none focus:outline-none focus:border-accent text-xs placeholder:text-cream-light/30" />
            <svg class="w-3.5 h-3.5 text-cream-light/40 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          </div>
          <span class="text-xs uppercase tracking-wider text-cream-light/40">${active.length} active tickets</span>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 overflow-x-auto">
          ${KDS_COLUMNS.map(column).join('')}
        </div>
      </div>
    `;
    this._startTimers();
  },

  adminOrdersSearch(query) { ordersFilters.search = query; this.refreshOrders(); },
  adminOrdersStatus(status) { ordersFilters.status = status; this.refreshOrders(); },
  adminOrdersPage(page) { ordersFilters.page = page; this.refreshOrders(); },
  adminUpdateStatus(orderId, status) { store.updateOrderStatus(orderId, status); },

  // Advance a ticket to the next kitchen stage
  kdsBump(orderId) {
    const o = store.state.orders.find(x => x.orderId === orderId);
    if (!o) return;
    const next = NEXT_STATUS[o.status];
    if (next) store.updateOrderStatus(orderId, next); // triggers re-render via store
  },

  refreshOrders() {
    const container = document.getElementById('view-container');
    if (store.state.activeView === 'admin-orders' && container) this.renderOrders(container);
  },

  // ===================== CUSTOMERS =====================
  renderCustomers(container) {
    const results = dataLoader.queryCustomers(customersFilters);
    container.innerHTML = `
      <div class="bg-ink text-cream-light border-2 border-[#4C4138] shadow-hard p-5 md:p-7 space-y-6 animate-fade-in">
        ${this._controlRoomHeader('Diner directory & lifetime spend')}
        <div class="relative w-full md:w-80">
          <input type="text" placeholder="Search customers..." value="${escapeHtml(customersFilters.search)}" oninput="window.app.adminCustomersSearch(this.value)" class="w-full pl-9 pr-4 py-2 bg-[#2A231F] border-2 border-[#4C4138] text-cream-light rounded-none focus:outline-none focus:border-accent text-xs placeholder:text-cream-light/30" />
          <svg class="w-3.5 h-3.5 text-cream-light/40 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          ${results.items.map(c => `
            <div class="${TILE} p-4 flex items-center gap-4">
              <div class="w-12 h-12 border-2 border-accent bg-accent/15 text-accent font-display font-bold text-lg flex items-center justify-center shrink-0">${escapeHtml(c.name.charAt(0))}</div>
              <div class="min-w-0 flex-grow">
                <h4 class="font-display uppercase text-cream-light text-sm leading-none truncate">${escapeHtml(c.name)}</h4>
                <p class="text-[11px] text-cream-light/40 truncate mt-0.5">${escapeHtml(c.email)}</p>
                <div class="flex items-center gap-3 mt-1.5 text-[11px]"><span class="text-cream-light/60">${c.orderCount} orders</span><span class="text-success-light font-semibold">RM ${c.totalSpend.toFixed(2)}</span></div>
              </div>
            </div>`).join('')}
        </div>
        ${renderPagination(results.page, results.totalPages, 'adminCustomersPage')}
      </div>
    `;
  },

  adminCustomersSearch(query) { customersFilters.search = query; customersFilters.page = 1; this.refreshCustomers(); },
  adminCustomersPage(page) { customersFilters.page = page; this.refreshCustomers(); },
  refreshCustomers() {
    const container = document.getElementById('view-container');
    if (store.state.activeView === 'admin-customers' && container) this.renderCustomers(container);
  },

  // ===================== COMMAND PALETTE (Ctrl/⌘ + K) =====================
  _commands: [
    { label: 'Open Dashboard', kw: 'dashboard metrics analytics revenue', view: 'admin-dash' },
    { label: 'Open Kitchen Board (KDS)', kw: 'orders kds kitchen tickets board', view: 'admin-orders' },
    { label: 'Open Customer Directory', kw: 'customers diners people', view: 'admin-customers' },
    { label: 'View Storefront', kw: 'home shop store customer site', view: 'home' },
    { label: 'Browse Menu', kw: 'menu catalog dishes food', view: 'catalog' },
    { label: 'Track an Order', kw: 'track delivery status', view: 'track-order' }
  ],
  _buildPalette() {
    if (document.getElementById('cmd-palette')) return;
    const overlay = document.createElement('div');
    overlay.id = 'cmd-palette';
    overlay.className = 'fixed inset-0 z-[90] hidden items-start justify-center pt-28 bg-ink/70 backdrop-blur-sm';
    overlay.innerHTML = `
      <div class="w-full max-w-lg mx-4 bg-[#2A231F] border-2 border-accent shadow-[8px_8px_0_0_#9E2820]" onclick="event.stopPropagation()">
        <div class="flex items-center gap-2 border-b-2 border-[#4C4138] px-4">
          <svg class="w-4 h-4 text-cream-light/40" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          <input id="cmd-input" placeholder="Type a command…" autocomplete="off" oninput="window.app.cmdFilter(this.value)" class="flex-grow bg-transparent py-3.5 text-cream-light placeholder:text-cream-light/30 focus:outline-none font-display uppercase tracking-wide text-sm" />
          <span class="text-[10px] text-cream-light/30 border border-[#4C4138] px-1.5 py-0.5">ESC</span>
        </div>
        <div id="cmd-list" class="max-h-72 overflow-y-auto p-2"></div>
      </div>`;
    overlay.addEventListener('click', () => this.closeCommandPalette());
    document.body.appendChild(overlay);
  },
  _renderCmdList(filter = '') {
    const list = document.getElementById('cmd-list');
    if (!list) return;
    const q = filter.trim().toLowerCase();
    const matches = this._commands.filter(c => !q || c.label.toLowerCase().includes(q) || c.kw.includes(q));
    list.innerHTML = matches.length === 0
      ? `<p class="text-xs text-cream-light/40 italic px-3 py-4">No matching commands.</p>`
      : matches.map((c, i) => `
        <button onclick="window.app.cmdRun('${c.view}')" class="w-full text-left flex items-center justify-between px-3 py-2.5 font-display uppercase tracking-wide text-sm transition-colors cursor-pointer ${i === 0 ? 'bg-accent text-white' : 'text-cream-light/80 hover:bg-[#3A322C]'}">
          <span>${c.label}</span><span class="text-[10px] opacity-60">↵</span>
        </button>`).join('');
  },
  openCommandPalette() {
    this._buildPalette();
    const overlay = document.getElementById('cmd-palette');
    overlay.classList.remove('hidden'); overlay.classList.add('flex');
    this._renderCmdList('');
    const input = document.getElementById('cmd-input');
    if (input) { input.value = ''; setTimeout(() => input.focus(), 30); }
  },
  closeCommandPalette() {
    const overlay = document.getElementById('cmd-palette');
    if (overlay) { overlay.classList.add('hidden'); overlay.classList.remove('flex'); }
  },
  cmdFilter(value) { this._renderCmdList(value); },
  cmdRun(view) {
    this.closeCommandPalette();
    const first = this._commands[0];
    window.app.switchView(view || first.view);
  }
};

// Bind to window.app for click triggers
window.app = window.app || {};
window.app.adminOrdersSearch = adminViews.adminOrdersSearch.bind(adminViews);
window.app.adminOrdersStatus = adminViews.adminOrdersStatus.bind(adminViews);
window.app.adminOrdersPage = adminViews.adminOrdersPage.bind(adminViews);
window.app.adminUpdateStatus = adminViews.adminUpdateStatus.bind(adminViews);
window.app.kdsBump = adminViews.kdsBump.bind(adminViews);
window.app.adminCustomersSearch = adminViews.adminCustomersSearch.bind(adminViews);
window.app.adminCustomersPage = adminViews.adminCustomersPage.bind(adminViews);
window.app.openCommandPalette = adminViews.openCommandPalette.bind(adminViews);
window.app.closeCommandPalette = adminViews.closeCommandPalette.bind(adminViews);
window.app.cmdFilter = adminViews.cmdFilter.bind(adminViews);
window.app.cmdRun = adminViews.cmdRun.bind(adminViews);

// Global keyboard shortcut: Ctrl/Cmd + K toggles the command palette, Esc closes
document.addEventListener('keydown', (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault();
    const overlay = document.getElementById('cmd-palette');
    if (overlay && !overlay.classList.contains('hidden')) adminViews.closeCommandPalette();
    else adminViews.openCommandPalette();
  } else if (e.key === 'Escape') {
    adminViews.closeCommandPalette();
  }
});
