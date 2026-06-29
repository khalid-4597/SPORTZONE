// store.js — cart, checkout, EVC+ USSD flow, order management

// ── STATE ──────────────────────────────────────────────────────────
let cart = JSON.parse(localStorage.getItem('sz_cart') || '[]');
let currentFilter = 'all';

// ── UTILS ──────────────────────────────────────────────────────────
const $ = id => document.getElementById(id);
const fmt = n => '$' + n.toFixed(2);
const saveCart = () => localStorage.setItem('sz_cart', JSON.stringify(cart));
const genRef = () => 'SZ-' + Date.now().toString(36).toUpperCase();

// ── RENDER PRODUCTS ────────────────────────────────────────────────
function renderProducts(filter = 'all') {
  const grid = $('productsGrid');
  const all = getProducts();
  const items = filter === 'all' ? all : all.filter(p => p.category === filter);

  if (items.length === 0) {
    grid.innerHTML = `<div class="products-empty">Alaab lagama helin qaybtan weli.</div>`;
    return;
  }

  grid.innerHTML = items.map(p => `
    <div class="product-card" data-id="${p.id}">
      <div class="product-img">
        ${p.image
          ? `<img src="${p.image}" alt="${p.name}" loading="lazy" />`
          : `<div class="img-placeholder">
              <span class="cat-icon">${p.icon || '🏷️'}</span>
              <span>${p.categoryLabel}</span>
            </div>`
        }
      </div>
      <div class="product-info">
        <div class="product-cat">${p.categoryLabel}</div>
        <div class="product-name">${p.name}</div>
        <p style="font-size:0.78rem;color:#666;margin-bottom:0.25rem;line-height:1.4">${p.description}</p>
        <div class="product-bottom">
          <div class="product-price">${fmt(p.price)} <span>USD</span></div>
          <button class="add-btn" data-id="${p.id}" aria-label="Ku dar">+</button>
        </div>
      </div>
    </div>
  `).join('');

  // add-to-cart listeners
  grid.querySelectorAll('.add-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      addToCart(btn.dataset.id);
    });
  });
}

// ── CART ───────────────────────────────────────────────────────────
function addToCart(id) {
  const product = getProducts().find(p => p.id === id);
  if (!product) return;
  const existing = cart.find(i => i.id === id);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ id, name: product.name, price: product.price, icon: product.icon, image: product.image || '', qty: 1 });
  }
  saveCart();
  updateCartUI();
  showCartBounce();
}

function removeFromCart(id) {
  cart = cart.filter(i => i.id !== id);
  saveCart();
  updateCartUI();
}

function changeQty(id, delta) {
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty = Math.max(0, item.qty + delta);
  if (item.qty === 0) cart = cart.filter(i => i.id !== id);
  saveCart();
  updateCartUI();
}

function getTotal() {
  return cart.reduce((sum, i) => sum + i.price * i.qty, 0);
}

function updateCartUI() {
  const count = cart.reduce((s, i) => s + i.qty, 0);
  const countEl = $('cartCount');
  countEl.textContent = count;
  countEl.classList.toggle('visible', count > 0);

  const itemsEl = $('cartItems');
  const footerEl = $('cartFooter');

  if (cart.length === 0) {
    itemsEl.innerHTML = '<p class="cart-empty">Baaskiidkaagu waa madhan yahay.</p>';
    footerEl.style.display = 'none';
    return;
  }

  itemsEl.innerHTML = cart.map(item => `
    <div class="cart-item">
      <div class="cart-item-icon">${item.image ? `<img src="${item.image}" alt="${item.name}" />` : item.icon}</div>
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">${fmt(item.price)} × ${item.qty} = ${fmt(item.price * item.qty)}</div>
        <div class="cart-item-qty">
          <button class="qty-btn" data-id="${item.id}" data-delta="-1">−</button>
          <span class="qty-num">${item.qty}</span>
          <button class="qty-btn" data-id="${item.id}" data-delta="1">+</button>
        </div>
      </div>
    </div>
  `).join('');

  itemsEl.querySelectorAll('.qty-btn').forEach(btn => {
    btn.addEventListener('click', () => changeQty(btn.dataset.id, parseInt(btn.dataset.delta)));
  });

  $('cartTotal').textContent = fmt(getTotal());
  footerEl.style.display = 'block';
}

function showCartBounce() {
  const btn = $('cartBtn');
  btn.style.transform = 'scale(1.15)';
  setTimeout(() => btn.style.transform = '', 180);
}

// ── CART DRAWER TOGGLE ─────────────────────────────────────────────
function openCart() {
  $('cartDrawer').classList.add('open');
  $('cartOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeCart() {
  $('cartDrawer').classList.remove('open');
  $('cartOverlay').classList.remove('open');
  document.body.style.overflow = '';
}

$('cartBtn').addEventListener('click', openCart);
$('cartClose').addEventListener('click', closeCart);
$('cartOverlay').addEventListener('click', closeCart);

// ── CHECKOUT MODAL ─────────────────────────────────────────────────
let evcDialed = false;

function openCheckout() {
  closeCart();
  evcDialed = false;
  $('dialEvcBtn').style.display = 'block';
  $('confirmPayBtn').style.display = 'none';
  $('checkoutForm').style.display = 'block';
  $('orderSuccess').style.display = 'none';

  // populate summary
  const total = getTotal();
  $('evcAmount').textContent = fmt(total);

  const summaryEl = $('orderSummary');
  summaryEl.innerHTML = `
    ${cart.map(i => `
      <div class="order-summary-item">
        <span>${i.icon} ${i.name} ×${i.qty}</span>
        <span>${fmt(i.price * i.qty)}</span>
      </div>
    `).join('')}
    <div class="order-summary-total">
      <span>Wadarta</span>
      <span>${fmt(total)}</span>
    </div>
  `;

  $('checkoutOverlay').style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function closeCheckout() {
  $('checkoutOverlay').style.display = 'none';
  document.body.style.overflow = '';
}

$('checkoutBtn').addEventListener('click', openCheckout);
$('checkoutClose').addEventListener('click', closeCheckout);
$('checkoutOverlay').addEventListener('click', e => {
  if (e.target === $('checkoutOverlay')) closeCheckout();
});

// ── EVC+ DIALING ───────────────────────────────────────────────────
// EVC Plus USSD: *789*MERCHANT_NUMBER*AMOUNT#
// Replace MERCHANT_NUMBER with the actual Hormuud merchant number
const EVC_MERCHANT = '252619594597'; // ← replace with real merchant number

$('dialEvcBtn').addEventListener('click', () => {
  const total = Math.round(getTotal()); // EVC usually whole USD/SOS
  // Build USSD dial string — works on mobile devices with Hormuud SIM
  const ussd = `*789*${EVC_MERCHANT}*${total}%23`;
  const telLink = `tel:${ussd}`;

  // Try to dial; on desktop this does nothing visible
  window.location.href = telLink;

  // After 2s assume dial was initiated, show confirmation button
  setTimeout(() => {
    $('dialEvcBtn').style.display = 'none';
    $('confirmPayBtn').style.display = 'block';
    evcDialed = true;
  }, 2000);
});

$('confirmPayBtn').addEventListener('click', placeOrder);
$('placeOrderBtn').addEventListener('click', () => {
  if (!evcDialed) {
    alert('Fadlan marka hore badhanka "EVC+ Bixi Lacagta" dhagsanso si aad u bixiso, ka dib "Waan Bixiyay" dhagsanso.');
    return;
  }
  placeOrder();
});

// ── PLACE ORDER ────────────────────────────────────────────────────
function placeOrder() {
  const name = $('cName').value.trim();
  const phone = $('cPhone').value.trim();
  const address = $('cAddress').value.trim();

  if (!name || !phone || !address) {
    alert('Fadlan dhammaan goobaha buuxi: Magaca, Telefoonka, iyo Cinwaanka.');
    return;
  }

  const order = {
    ref: genRef(),
    status: 'Sugaya Xaqiijin', // Pending Confirmation
    customer: { name, phone, address },
    items: JSON.parse(JSON.stringify(cart)),
    total: getTotal(),
    createdAt: new Date().toISOString(),
    paymentMethod: 'EVC Plus'
  };

  // Save to orders list in localStorage
  const orders = JSON.parse(localStorage.getItem('sz_orders') || '[]');
  orders.unshift(order);
  localStorage.setItem('sz_orders', JSON.stringify(orders));

  // Clear cart
  cart = [];
  saveCart();
  updateCartUI();

  // Show success
  $('orderRef').textContent = order.ref;
  $('checkoutForm').style.display = 'none';
  $('orderSuccess').style.display = 'block';
}

$('successClose').addEventListener('click', closeCheckout);

// ── CATEGORY FILTER ────────────────────────────────────────────────
document.querySelectorAll('.cat-pill').forEach(pill => {
  pill.addEventListener('click', () => {
    document.querySelectorAll('.cat-pill').forEach(p => p.classList.remove('active'));
    pill.classList.add('active');
    currentFilter = pill.dataset.cat;
    renderProducts(currentFilter);
  });
});

// ── NAV SCROLL EFFECT ──────────────────────────────────────────────
window.addEventListener('scroll', () => {
  $('nav').style.boxShadow = window.scrollY > 20
    ? '0 2px 20px rgba(0,0,0,0.5)' : '';
});

// ── INIT ───────────────────────────────────────────────────────────
renderProducts();
updateCartUI();

// Re-render storefront if admin updates products in another tab
window.addEventListener('storage', e => {
  if (e.key === 'sz_products') renderProducts(currentFilter);
});
