// products.js — product catalog, now backed by localStorage so admin can
// add / edit / delete products from the dashboard. Falls back to a seed
// catalog the first time the site ever loads.
//
// Shape of a product (unchanged from before, plus optional `image`):
// { id, name, category, categoryLabel, icon, price, description, image }
//   image: base64 data-URL string, or '' if none (icon placeholder is used)

const PRODUCTS_KEY = 'sz_products';
const SEEDED_KEY = 'sz_products_seeded';

const CATEGORY_LABELS = {
  'kubadda-cagta': 'Kubadda Cagta',
  'orinta': 'Orinta',
  'koleyga': 'Koleyga',
  'dharka': 'Dharka'
};

const SEED_PRODUCTS = [
  { id: 'p001', name: 'Pro Sprint Boot', category: 'kubadda-cagta', categoryLabel: 'Kubadda Cagta', icon: '⚽', price: 45, description: 'Buudho cayilaanka ah oo ku habboon garoonka cagaaran.', image: '' },
  { id: 'p002', name: 'Striker Training Boot', category: 'kubadda-cagta', categoryLabel: 'Kubadda Cagta', icon: '⚽', price: 38, description: 'Buudho tababarka ah oo adag oo waara.', image: '' },
  { id: 'p003', name: 'Ultra Runner X', category: 'orinta', categoryLabel: 'Orinta', icon: '🏃', price: 55, description: 'Gadhac fudud oo loogu talagalay orinta fog.', image: '' },
  { id: 'p004', name: 'Track Racer Pro', category: 'orinta', categoryLabel: 'Orinta', icon: '🏃', price: 62, description: 'Gadhac tartanka ah oo u xawaaraha dheer.', image: '' },
  { id: 'p005', name: 'Court King', category: 'koleyga', categoryLabel: 'Koleyga', icon: '🏀', price: 70, description: 'Gadhac koleyga oo leh taageero garbaha.', image: '' },
  { id: 'p006', name: 'Dunk Force Low', category: 'koleyga', categoryLabel: 'Koleyga', icon: '🏀', price: 58, description: 'Xawaare iyo xasilloonaan mid ku jira.', image: '' },
  { id: 'p007', name: 'Performance Tee', category: 'dharka', categoryLabel: 'Dharka', icon: '👕', price: 18, description: 'Shaadh ciyaaraha ah oo leh qashin-raridda dhididka.', image: '' },
  { id: 'p008', name: 'Pro Shorts', category: 'dharka', categoryLabel: 'Dharka', icon: '🩳', price: 22, description: 'Suruwal gaaban oo fudud oo u habboon dhammaan ciyaaraha.', image: '' },
  { id: 'p009', name: 'Match Football', category: 'kubadda-cagta', categoryLabel: 'Kubadda Cagta', icon: '⚽', price: 28, description: 'Kubad cayilaanka ah oo heerka tartanka ah.', image: '' },
  { id: 'p010', name: 'Grip Socks Pro', category: 'dharka', categoryLabel: 'Dharka', icon: '🧦', price: 12, description: 'Sharabaadh garbaha ah oo isticmaala tignoolajiyada hoos-qaabka.', image: '' },
  { id: 'p011', name: 'Speed Lace Runners', category: 'orinta', categoryLabel: 'Orinta', icon: '🏃', price: 48, description: 'Gadhac orinta ah oo leh nidaam xidhmo dhaqso.', image: '' },
  { id: 'p012', name: 'Slam Dunk High', category: 'koleyga', categoryLabel: 'Koleyga', icon: '🏀', price: 75, description: 'Gadhac sarreeya oo u habboon ciyaareyaasha isha ku haya meel kasta.', image: '' }
];

function seedProductsIfNeeded() {
  if (localStorage.getItem(SEEDED_KEY)) return;
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(SEED_PRODUCTS));
  localStorage.setItem(SEEDED_KEY, '1');
}

function getProducts() {
  seedProductsIfNeeded();
  try {
    return JSON.parse(localStorage.getItem(PRODUCTS_KEY) || '[]');
  } catch (e) {
    return [];
  }
}

function saveProducts(products) {
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
}

function genProductId() {
  return 'p' + Date.now().toString(36) + Math.floor(Math.random() * 1000);
}

function addProduct(product) {
  const products = getProducts();
  product.id = product.id || genProductId();
  product.categoryLabel = CATEGORY_LABELS[product.category] || product.category;
  products.unshift(product);
  saveProducts(products);
  return product;
}

function updateProduct(id, updates) {
  const products = getProducts();
  const idx = products.findIndex(p => p.id === id);
  if (idx === -1) return null;
  if (updates.category) {
    updates.categoryLabel = CATEGORY_LABELS[updates.category] || updates.category;
  }
  products[idx] = { ...products[idx], ...updates };
  saveProducts(products);
  return products[idx];
}

function deleteProduct(id) {
  const products = getProducts().filter(p => p.id !== id);
  saveProducts(products);
}

// `PRODUCTS` kept as a live-ish array for any old code that reads it directly.
// Always prefer calling getProducts() for fresh data.
let PRODUCTS = getProducts();
