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
  // Aliases matching HTML button keys
  shoes:      { name:'Shoes / Trainers',    sheinPrice:20,  co2:14,  water:4500, micro:400000,  lifespan:20, icon:'trainers'  },
  acc:        { name:'Accessories',         sheinPrice:5,   co2:1.5, water:400,  micro:80000,   lifespan:8,  icon:'earrings'  },
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

/* ============================================================
   WORN OUT — QUIZ
   All questions, stats & findings sourced directly from:
   "Young people's clothing purchasing habits and its impact
   on Ireland" — Staunton, Devlin, Murphy, Heffernan (2025)
   Survey of 150 students; desk research cross-referenced
   against CSO, EPA, Shein reports, BBC, Public Eye.
   ============================================================ */

const QUIZ_QUESTIONS = [
  {
    q:       "70% of students surveyed said they buy from Shein — more than any other Asian retailer.",
    answer:  true,
    right:   "Correct. In the survey of 150 students, Shein was the most used Asian retailer at 70%, with Temu second at 29%.",
    wrong:   "Actually true. Shein came in at 70% — nearly 2.5× more than Temu (29%) among the 150 students surveyed.",
    source:  "Survey of 150 students, Fig. 5 — Staunton, Devlin, Murphy, Heffernan (2025)"
  },
  {
    q:       "The single biggest reason Irish students choose Asian brands over local ones is better design.",
    answer:  false,
    right:   "Correct — it's price, not design. 108 of 150 students said 'Cheaper' was their reason. Only 16 said 'Good design'.",
    wrong:   "False. Price dominated: 108 students cited 'Cheaper'. 'Good design' was chosen by just 16.",
    source:  "Survey of 150 students, Fig. 5 — Staunton, Devlin, Murphy, Heffernan (2025)"
  },
  {
    q:       "Only 4% of students said Asian brand clothing is 'always' fit for purpose.",
    answer:  true,
    right:   "Correct. Just 6 out of 150 students (4%) said clothing from Asian brands was always fit for purpose. 62 said 'sometimes'.",
    wrong:   "True. A striking 4% — 6 students — said always fit for purpose. The majority said 'sometimes' or worse.",
    source:  "Survey of 150 students — Staunton, Devlin, Murphy, Heffernan (2025)"
  },
  {
    q:       "The majority of surveyed students said they buy MORE from Asian websites than European or local brands.",
    answer:  false,
    right:   "Correct — 101 out of 150 said 'no'. Only 21 said yes. But 56 said they 'sometimes' buy from Asian sites.",
    wrong:   "False. 101 of 150 students said they do NOT buy more from Asian brands. 21 said yes, 26 said maybe.",
    source:  "Survey of 150 students — Staunton, Devlin, Murphy, Heffernan (2025)"
  },
  {
    q:       "Ireland's per capita textile consumption (53kg) is more than double the EU average.",
    answer:  true,
    right:   "Correct. Ireland consumes 53kg per person vs the EU average of 20kg — nearly three times as much.",
    wrong:   "True. Ireland: 53kg per person. EU average: 20kg. Ireland also discards 35kg vs the EU average of 12kg.",
    source:  "EPA Textiles Attitudes and Behaviours Report; RTE article on Irish textile consumption"
  },
  {
    q:       "40% of clothing discarded in Ireland has never been worn.",
    answer:  true,
    right:   "Correct. 40% of discarded clothing in Ireland still has its tags on — it was never worn at all.",
    wrong:   "True. 40% of Ireland's discarded clothing has never been worn. Still tagged. Straight to landfill.",
    source:  "EPA Textiles Attitudes and Behaviours Report"
  },
  {
    q:       "Shein workers' basic wage of €278/month meets the Chinese living wage.",
    answer:  false,
    right:   "Correct — €278 is far below the living wage. The living wage in China is 6,512 yuan (~€802/month).",
    wrong:   "False. The basic wage is 2,400 yuan (~€278). The living wage is 6,512 yuan (~€802). Workers must do heavy overtime to bridge the gap.",
    source:  "Asia Floor Wage Alliance; BBC Guangzhou factory investigation; Shein Sustainability Report 2023"
  },
  {
    q:       "Shein ships items by air freight to take advantage of a customs duty exemption on packages under €150.",
    answer:  true,
    right:   "Correct. Individual parcels under €150 enter the EU duty-free. Air freight generates 47× more CO₂ per ton-mile than ocean freight.",
    wrong:   "True. The €150 de minimis threshold is exactly why Shein uses individual air freight — and why it produces 47× more emissions than ocean shipping.",
    source:  "InTek Logistics Air Freight vs Ocean Freight; Staunton, Devlin, Murphy, Heffernan (2025)"
  },
  {
    q:       "87% of Irish people surveyed agree it's important to buy clothes that last.",
    answer:  true,
    right:   "Correct — and the contradiction is the point. 87% agree quality matters, yet Ireland discards almost 3× the EU average in textiles.",
    wrong:   "True. 87% of people say quality longevity matters to them — yet Ireland discards 35kg of textiles per person per year, nearly 3× the EU average.",
    source:  "EPA Textiles Attitudes and Behaviours Report; Visa Consumer Survey"
  },
  {
    q:       "629,000 people in Ireland — roughly 1 in 10 — live below the poverty line of €366/week.",
    answer:  true,
    right:   "Correct. 1 in 10 Irish people live below €366/week. 15% of children are in relative income poverty. Shein directly exploits this.",
    wrong:   "True. The poverty reality is real — and Shein is built to profit from it, not solve it.",
    source:  "Public Policy.ie Poverty Focus; CSO Enforced Deprivation Report"
  }
];

let quizCurrent  = 0;
let quizScore    = 0;
let quizAnswered = false;
const quizLog    = [];

function initQuiz() {
  const wrap = document.getElementById('quizWrap');
  if (!wrap) return;
  renderQuizQ();
}

function renderQuizQ() {
  const wrap    = document.getElementById('quizWrap');
  const scoreel = document.getElementById('quizResult');
  if (!wrap) return;

  if (quizCurrent >= QUIZ_QUESTIONS.length) {
    renderQuizResult();
    return;
  }

  if (scoreel) scoreel.style.display = 'none';
  quizAnswered = false;

  const q   = QUIZ_QUESTIONS[quizCurrent];
  const pct = Math.round((quizCurrent / QUIZ_QUESTIONS.length) * 100);

  wrap.innerHTML = `
    <div class="quiz-progress">
      <div class="quiz-progress__bar">
        <div class="quiz-progress__fill" style="width:${pct}%"></div>
      </div>
      <span class="quiz-progress__label">${quizCurrent + 1} / ${QUIZ_QUESTIONS.length}</span>
    </div>

    <div class="quiz-card">
      <div class="quiz-card__head">
        <div class="quiz-card__eyebrow">
          <span class="quiz-card__num">Q${quizCurrent + 1}</span>
          <span class="quiz-card__topic">True or False?</span>
        </div>
        <p class="quiz-card__statement">"${q.q}"</p>
      </div>

      <div class="quiz-card__body">
        <div class="quiz-btns">
          <button class="quiz-btn quiz-btn--true" onclick="quizAnswer(true)">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            True
          </button>
          <button class="quiz-btn quiz-btn--false" onclick="quizAnswer(false)">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            False
          </button>
        </div>

        <div class="quiz-feedback" id="quizFeedback" style="display:none"></div>

        <button class="quiz-next" id="quizNext" onclick="quizAdvance()" style="display:none">
          ${quizCurrent < QUIZ_QUESTIONS.length - 1 ? 'Next question' : 'See my score'}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>
    </div>`;
}

function quizAnswer(choice) {
  if (quizAnswered) return;
  quizAnswered = true;

  const q       = QUIZ_QUESTIONS[quizCurrent];
  const correct = choice === q.answer;
  if (correct) quizScore++;
  quizLog.push({ correct, q });

  // Style buttons
  document.querySelectorAll('.quiz-btn').forEach(btn => {
    const isTrue = btn.classList.contains('quiz-btn--true');
    const val    = isTrue;
    if (val === q.answer)        btn.classList.add('quiz-btn--correct');
    else if (val === choice)     btn.classList.add('quiz-btn--wrong');
    btn.disabled = true;
  });

  // Show feedback
  const fb = document.getElementById('quizFeedback');
  fb.style.display = 'block';
  fb.className     = 'quiz-feedback quiz-feedback--' + (correct ? 'right' : 'wrong');
  fb.innerHTML     = `
    <div class="quiz-feedback__verdict">${correct ? '✓ Correct' : '✗ Incorrect'}</div>
    <div class="quiz-feedback__text">${correct ? q.right : q.wrong}</div>
    <div class="quiz-feedback__source">Source: ${q.source}</div>`;

  document.getElementById('quizNext').style.display = 'flex';
}

function quizAdvance() {
  quizCurrent++;
  renderQuizQ();
  document.getElementById('quizSection')?.scrollIntoView({ behavior:'smooth', block:'start' });
}

function renderQuizResult() {
  const wrap   = document.getElementById('quizWrap');
  const result = document.getElementById('quizResult');
  if (!wrap || !result) return;

  wrap.innerHTML = '';

  const total = QUIZ_QUESTIONS.length;
  const pct   = Math.round((quizScore / total) * 100);

  const tiers = [
    { min:90, colour:'var(--green)', verdict:'You know this issue inside out.', body:`${quizScore}/${total} — You clearly paid attention. The people running Shein count on consumers staying uninformed. You're not one of them.` },
    { min:70, colour:'var(--green)', verdict:'Solid. A few blind spots left.', body:`${quizScore}/${total} — Good awareness. The gaps are exactly where the industry hides the worst of it. Scroll down and dig in.` },
    { min:50, colour:'var(--amber)', verdict:'You know some of it. Shein knows all of it.', body:`${quizScore}/${total} — Half right is still half in the dark. These aren't obscure facts — they're things Shein spends billions keeping hidden.` },
    { min:0,  colour:'var(--rust)',  verdict:"This is exactly what they're counting on.", body:`${quizScore}/${total} — Low awareness isn't your fault. Shein's entire marketing budget exists to keep it that way. Now you know.` },
  ];
  const tier = tiers.find(t => pct >= t.min);

  const dots = quizLog.map((r, i) =>
    `<span class="quiz-dot quiz-dot--${r.correct ? 'right' : 'wrong'}" title="Q${i+1}: ${r.correct ? 'Correct' : 'Wrong'}"></span>`
  ).join('');

  result.style.display = 'block';
  result.innerHTML = `
    <div class="quiz-result__score" style="color:${tier.colour}">${quizScore}<span class="quiz-result__total">/${total}</span></div>
    <div class="quiz-result__verdict">${tier.verdict}</div>
    <p class="quiz-result__body">${tier.body}</p>
    <div class="quiz-result__dots">${dots}</div>
    <div class="quiz-result__actions">
      <button class="btn btn--primary" onclick="quizRestart()">Retake quiz</button>
      <a href="#haul" class="btn btn--outline">Build your haul</a>
    </div>`;
}

function quizRestart() {
  quizCurrent = 0; quizScore = 0; quizAnswered = false; quizLog.length = 0;
  document.getElementById('quizResult').style.display = 'none';
  renderQuizQ();
}

window.quizAnswer  = quizAnswer;
window.quizAdvance = quizAdvance;
window.quizRestart = quizRestart;

document.addEventListener('DOMContentLoaded', initQuiz);
