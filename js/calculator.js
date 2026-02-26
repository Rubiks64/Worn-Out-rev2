/* ============================================================
   WORN OUT — HAUL CALCULATOR
   Data sources: European Parliament 2022, UNEP, Shein 2024
   Sustainability Report, InTek Logistics, IUCN 2017
   ============================================================ */

const PRODUCTS = {
  tshirt:     { name:'T-Shirt / Top',       sheinPrice:5,   co2:6,   water:2700, micro:700000,  lifespan:10, icon:'tshirt'    },
  dress:      { name:'Dress',               sheinPrice:9,   co2:12,  water:3800, micro:1000000, lifespan:7,  icon:'dress'     },
  jeans:      { name:'Jeans',               sheinPrice:14,  co2:20,  water:7000, micro:500000,  lifespan:15, icon:'jeans'     },
  hoodie:     { name:'Hoodie / Sweatshirt', sheinPrice:12,  co2:18,  water:3200, micro:1500000, lifespan:12, icon:'hoodie'    },
  jacket:     { name:'Jacket / Coat',       sheinPrice:22,  co2:34,  water:5200, micro:1000000, lifespan:8,  icon:'jacket'    },
  swim:       { name:'Swimwear',            sheinPrice:7,   co2:6,   water:1900, micro:2000000, lifespan:5,  icon:'swimwear'  },
  trainers:   { name:'Shoes / Trainers',    sheinPrice:20,  co2:14,  water:4500, micro:400000,  lifespan:20, icon:'trainers'  },
  hat:        { name:'Hat / Cap',           sheinPrice:6,   co2:2,   water:700,  micro:150000,  lifespan:10, icon:'hat'       },
  earrings:   { name:'Earrings',            sheinPrice:4,   co2:1,   water:300,  micro:50000,   lifespan:8,  icon:'earrings'  },
  bag:        { name:'Bag / Handbag',       sheinPrice:12,  co2:4,   water:1200, micro:300000,  lifespan:12, icon:'bag'       },
  belt:       { name:'Belt',               sheinPrice:5,   co2:2,   water:600,  micro:100000,  lifespan:15, icon:'belt'      },
  sunglasses: { name:'Sunglasses',          sheinPrice:7,   co2:1.5, water:400,  micro:80000,   lifespan:6,  icon:'sunglasses'},
  watch:      { name:'Watch / Bracelet',    sheinPrice:8,   co2:2,   water:500,  micro:60000,   lifespan:10, icon:'watch'     },
};

const SHIPPING_CO2_PER_ORDER = 6.8;

const cart = {};

function getCartItems() {
  return Object.entries(cart).filter(([, q]) => q > 0);
}

function addToCart(key) {
  cart[key] = (cart[key] || 0) + 1;
  renderCart();
}

function changeQty(key, delta) {
  cart[key] = Math.max(0, (cart[key] || 0) + delta);
  if (cart[key] === 0) delete cart[key];
  renderCart();
}

function renderCart() {
  const list   = document.getElementById('cartList');
  const runBtn = document.getElementById('runBtn');
  const items  = getCartItems();

  if (items.length === 0) {
    list.innerHTML = '<div class="cart-empty">Your haul is empty — add items above</div>';
    runBtn.disabled = true;
    return;
  }

  runBtn.disabled = false;
  list.innerHTML = items.map(([key, qty]) => {
    const p = PRODUCTS[key];
    return `
      <div class="cart-item" id="cart-${key}">
        <span class="cart-item__name">
          <span class="icon cart-icon" data-icon="${p.icon}"></span>
          ${p.name}
        </span>
        <div class="cart-item__qty">
          <button class="qty-btn" onclick="changeQty('${key}',-1)">&#x2212;</button>
          <span class="qty-num">${qty}</span>
          <button class="qty-btn" onclick="changeQty('${key}',1)">&#x2b;</button>
        </div>
        <button class="cart-item__remove" onclick="changeQty('${key}',-999)" title="Remove">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
      </div>`;
  }).join('');

  if (window.inlineSVGsTargeted) window.inlineSVGsTargeted('#cartList [data-icon]');
}

function calculateHaul() {
  const items = getCartItems();
  if (items.length === 0) return;

  let totalCO2 = SHIPPING_CO2_PER_ORDER, totalWater = 0, totalMicro = 0, totalSpend = 0, totalItems = 0;

  items.forEach(([key, qty]) => {
    const p = PRODUCTS[key];
    totalCO2   += p.co2   * qty;
    totalWater += p.water * qty;
    totalMicro += p.micro * qty;
    totalSpend += p.sheinPrice * qty;
    totalItems += qty;
  });

  const kmDriven  = Math.round(totalCO2 * 6.2);
  const daysWater = Math.round(totalWater / 3);

  document.getElementById('resultsPrompt').classList.add('hidden');
  document.getElementById('resultsPanel').classList.add('visible');
  document.getElementById('dashItemCount').textContent = `${totalItems} item${totalItems !== 1 ? 's' : ''} · 1 air freight shipment`;

  document.getElementById('mCO2').textContent    = totalCO2.toFixed(1) + 'kg';
  document.getElementById('mCO2eq').textContent  = `≈ ${kmDriven.toLocaleString('en-IE')} km driven in an average car`;
  document.getElementById('mWater').textContent  = totalWater >= 1000 ? (totalWater/1000).toFixed(1)+'k L' : totalWater.toLocaleString('en-IE')+' L';
  document.getElementById('mWaterEq').textContent = `Enough drinking water for ${daysWater} day${daysWater !== 1 ? 's' : ''} for one person`;
  document.getElementById('mShipping').textContent   = SHIPPING_CO2_PER_ORDER + 'kg';
  document.getElementById('mShippingEq').textContent = `Air freight emits 47× more CO₂ than ocean freight per ton-mile — by design`;
  document.getElementById('mMicro').textContent   = (totalMicro/1000000).toFixed(2)+'M';
  document.getElementById('mMicroEq').textContent = `Microplastic fibres released per first wash — most pass through water treatment`;
  document.getElementById('shippingNote').textContent =
    `This haul shipped as ${totalItems} individual parcel${totalItems>1?'s':''} by air freight from China ` +
    `— generating ~${SHIPPING_CO2_PER_ORDER}kg CO₂ for shipping alone. Shein ships individually ` +
    `to exploit the €150 customs duty exemption threshold.`;

  const tbody = document.getElementById('breakdownBody');
  tbody.innerHTML = items.map(([key, qty]) => {
    const p = PRODUCTS[key];
    return `<tr>
      <td>${p.name} ×${qty}</td>
      <td class="mono">${(p.co2*qty).toFixed(1)}kg</td>
      <td class="mono">${(p.water*qty).toLocaleString('en-IE')}L</td>
      <td class="mono">${((p.micro*qty)/1000000).toFixed(2)}M / wash</td>
      <td class="mono">~€${(p.sheinPrice*qty).toFixed(2)}</td>
    </tr>`;
  }).join('') +
  `<tr style="background:var(--surface-inset)">
    <td style="font-weight:600">Shipping (air freight)</td>
    <td class="mono" style="font-weight:600">${SHIPPING_CO2_PER_ORDER}kg</td>
    <td class="mono">—</td><td class="mono">—</td><td class="mono">~€0</td>
  </tr>`;

  const headlines = [
    `My ${totalItems}-item Shein haul produced ${totalCO2.toFixed(1)}kg of CO₂.`,
    `A €${totalSpend} Shein haul used ${(totalWater/1000).toFixed(1)}k litres of water.`,
    `${totalItems} Shein items. ${totalCO2.toFixed(1)}kg CO₂. Worth it?`,
  ];
  document.getElementById('shareHeadline').textContent = headlines[Math.floor(Math.random()*headlines.length)];
  document.getElementById('shareCO2').textContent   = totalCO2.toFixed(1)+'kg';
  document.getElementById('shareWater').textContent = totalWater>=1000 ? (totalWater/1000).toFixed(1)+'k L' : totalWater+'L';
  document.getElementById('shareMicro').textContent = (totalMicro/1000000).toFixed(2)+'M';
  document.getElementById('shareItems').textContent = `${totalItems} item haul`;

  document.getElementById('resultsPanel').scrollIntoView({ behavior:'smooth', block:'start' });
}

function copyShareText() {
  const text = `${document.getElementById('shareHeadline').textContent}\n\n` +
    `CO₂: ${document.getElementById('shareCO2').textContent} | ` +
    `Water: ${document.getElementById('shareWater').textContent} | ` +
    `Microplastics: ${document.getElementById('shareMicro').textContent} per wash\n\nSee your haul's impact at WornOut`;
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(() => {
      const btn = document.getElementById('copyBtn');
      const orig = btn.innerHTML;
      btn.innerHTML = btn.innerHTML.replace('Copy for sharing','Copied!');
      setTimeout(() => btn.innerHTML = orig, 2000);
    });
  }
}

function clearCart() {
  Object.keys(cart).forEach(k => delete cart[k]);
  renderCart();
  document.getElementById('resultsPanel').classList.remove('visible');
  document.getElementById('resultsPrompt').classList.remove('hidden');
}

window.addToCart = addToCart; window.changeQty = changeQty;
window.calculateHaul = calculateHaul; window.clearCart = clearCart;
window.copyShareText = copyShareText;
