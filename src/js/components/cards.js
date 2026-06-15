// cards.js - UI renderer for catalog cards, rating widgets, and category chips

export function renderRatingStars(rating) {
  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.4;
  let html = '';
  
  for (let i = 1; i <= 5; i++) {
    if (i <= fullStars) {
      html += `<svg class="w-4 h-4 text-gold fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>`;
    } else if (i === fullStars + 1 && hasHalf) {
      html += `<svg class="w-4 h-4 text-accent fill-current" viewBox="0 0 20 20">
        <defs>
          <linearGradient id="halfStar">
            <stop offset="50%" stop-color="#E0A526"/>
            <stop offset="50%" stop-color="#E0DCD3"/>
          </linearGradient>
        </defs>
        <path fill="url(#halfStar)" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
      </svg>`;
    } else {
      html += `<svg class="w-4 h-4 text-secondary/30 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>`;
    }
  }
  return html;
}

export const FALLBACK_IMG = './assets/dumplings-plate.jpeg';

// Traditional red "chop" seal (印章) reading 好米巴 — a signature brand mark
export function renderSeal(extraClass = '') {
  return `
    <svg viewBox="0 0 100 100" class="seal-stamp ${extraClass}" role="img" aria-label="Hot Meal Bar seal 好米巴">
      <rect x="5" y="5" width="90" height="90" rx="10" fill="#C5362B"/>
      <rect x="10.5" y="10.5" width="79" height="79" rx="6" fill="none" stroke="#F4EAD2" stroke-width="2.5" opacity="0.9"/>
      <text x="50" y="35" text-anchor="middle" font-family="'Ma Shan Zheng', serif" font-size="30" fill="#F4EAD2">好</text>
      <text x="50" y="63" text-anchor="middle" font-family="'Ma Shan Zheng', serif" font-size="30" fill="#F4EAD2">米</text>
      <text x="50" y="88" text-anchor="middle" font-family="'Ma Shan Zheng', serif" font-size="26" fill="#F4EAD2">巴</text>
    </svg>`;
}

export function renderMealCard(meal) {
  const zh = meal.nameZh ? `<span class="font-brush text-teal text-xl leading-none">${meal.nameZh}</span>` : '';
  return `
    <article class="group paper-card rounded-none overflow-hidden flex flex-col h-full animate-slide-up interactive-scale">
      <!-- Photo, framed like a pasted menu polaroid -->
      <div class="relative overflow-hidden cursor-pointer aspect-[4/3] bg-background-dark border-b-2 border-ink" onclick="window.app.openMealDetails('${meal.mealId}')">
        <img 
          src="${meal.image}" 
          alt="${meal.mealName}" 
          loading="lazy"
          class="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
          onerror="this.onerror=null;this.src='${FALLBACK_IMG}'"
        />
        <span class="absolute top-0 left-0 bg-ink text-cream-light text-[10px] font-display uppercase tracking-[0.14em] px-2.5 py-1">${meal.category}</span>
        ${meal.bestseller ? `<span class="stamp absolute top-2 right-2 w-14 h-14 rounded-full text-[8px] leading-[1.05] font-bold text-accent bg-cream-light/90 animate-stamp-in">CHEF'S<br>PICK</span>` : ''}
        ${meal.spicy ? `<div class="absolute bottom-2 left-2 bg-cream-light border-2 border-ink w-7 h-7 flex items-center justify-center text-sm" title="Spicy">\u{1F336}\uFE0F</div>` : ''}
      </div>

      <!-- Ticket body -->
      <div class="p-4 flex flex-col flex-grow">
        <h3 class="font-display font-semibold uppercase text-lg text-ink leading-[1.05] tracking-tight group-hover:text-accent transition-colors cursor-pointer line-clamp-2" onclick="window.app.openMealDetails('${meal.mealId}')">
          ${meal.mealName}
        </h3>
        <div class="flex items-center justify-between gap-2 mt-1">
          ${zh}
          <span class="flex items-center gap-1 shrink-0">${renderRatingStars(meal.rating)}</span>
        </div>
        <p class="text-charcoal-light text-xs line-clamp-2 mt-2 leading-relaxed flex-grow">
          ${meal.description}
        </p>

        <!-- Dotted price leader + order button -->
        <div class="mt-3 pt-3 border-t-2 border-dashed border-ink/30">
          <div class="flex items-end mb-3">
            <span class="font-display uppercase text-[11px] tracking-[0.14em] text-secondary leading-none pb-1">Price</span>
            <i class="menu-dots"></i>
            <span class="font-display text-2xl font-bold text-accent leading-none">RM ${meal.price.toFixed(2)}</span>
          </div>
          <button 
            class="btn-stamp w-full py-2.5 text-sm"
            onclick="event.stopPropagation(); window.app.addToCart('${meal.mealId}')"
            aria-label="Add ${meal.mealName} to order"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/></svg>
            Add to Order
          </button>
        </div>
      </div>
    </article>
  `;
}

export function renderCategoryChips(categories, activeCategory, onSelectCallbackName) {
  return categories.map(cat => {
    const isActive = cat === activeCategory;
    const bgClass = isActive 
      ? 'bg-ink text-cream-light shadow-hard -translate-y-0.5' 
      : 'bg-cream-light text-ink hover:-translate-y-0.5 hover:shadow-hard';
    return `
      <button 
        onclick="window.app.${onSelectCallbackName}('${cat}')"
        class="px-4 py-2 rounded-none border-2 border-ink font-display uppercase tracking-[0.08em] text-xs transition-all cursor-pointer whitespace-nowrap ${bgClass}"
      >
        ${cat}
      </button>
    `;
  }).join('');
}
