# SportZone SO — Sports Store

Boggaan iibka ciyaaraha ah wuxuu u habboon yahay Muqdisho, Somalia.

## Qaab-dhismeedka Faylasha

```
sports-store/
├── index.html              ← Bogga macmiilka (storefront)
├── css/
│   └── store.css
├── js/
│   ├── products.js         ← Catalog-ka alaabta
│   └── store.js            ← Baaskiid, checkout, EVC+
└── admin/
    ├── login.html          ← Admin login
    └── dashboard.html      ← Maamulidda dalabbyada
```

## Sida Loo Isticmaalo

1. **Fur boggaga** browser-ka ku fur `index.html` — waxaad u baahan tahay server yar (localhost).
   - VS Code: Live Server extension isticmaal
   - Terminal: `cd sports-store && python3 -m http.server 3000`
   - Kadib fur: `http://localhost:3000`

2. **Admin dashboard**: `/admin/login.html`
   - Default password: `admin123`
   - Waxaad ka bedeli kartaa password-ka dashboard-ka settings-kiisa

## EVC Plus Xaqiijin

Dashboard-ka **Admin → Settings** ka gali **Numberka EVC+ Merchant** adigu leedahay (Hormuud).

Format: `252xxxxxxxxx` (oo ay ku jirto country code)

Marka macmiilku badhanka "EVC+ Bixi Lacagta" dhagsado:
- USSD: `*789*[merchant]*[amount]#` ayaa la bixiyaa
- Waxay shaqeysaa telefoonadaha Hormuud SIM-ka leh oo kaliya
- Macmiilku kadib wuxuu dhagsadaa "Waan Bixiyay"
- Dalabku wuxuu noqdaa **Sugaya Xaqiijin** — admin-ku gacanta ayuu u xaqiijiyaa

## Xaaladdaha Dalabka (Order States)

| Xaaladda | Macnaha |
|---|---|
| 🟡 Sugaya Xaqiijin | Macmiilku wuu bixiyay, admin waa xaqiijin |
| 🔵 Xaqiijisan | Admin wuu xaqiijiyay, alaabta diyaarinta la galo |
| 🟢 La Diro | Alaabta macmiilka loo diray |
| 🔴 Quftay | Dalabka la joojiyay |

## Alaabta Cusub Ku Dar

**Habka Cusub (la talinta):** Admin Dashboard → tab-ka **"🛍️ Alaabta"** ka dhagso "+ Alaab Cusub Ku Dar". Halkaas waxaad ka:
- Soo geli kartaa sawirka alaabta (waa la yareynayaa automatic si ay browser-ka u qaadan karo)
- Qori magaca, qaybta, qiimaha, iyo sharaxaad
- Wax ka beddeli kartaa ama tirtiri kartaa alaab kasta markasta

**Habka Hore (manual, weli wuu shaqeynayaa):** `js/products.js` ka fur oo object cusub ku dar SEED_PRODUCTS array-ga — kani wuxuu u shaqeeyaa kaliya markii browser-ku aanu weli xog kaydsanayn (first load).

```js
{
  id: 'p013',            // unique ID
  name: 'Magaca Alaabta',
  category: 'kubadda-cagta', // ama: orinta, koleyga, dharka
  categoryLabel: 'Kubadda Cagta',
  icon: '⚽',
  price: 35,             // USD
  description: 'Sharaxaad gaaban',
  image: ''               // base64 data-URL, ama maran haddii aanay sawir lahayn
}
```

## Nala Soo Xidhiidh (Contact)

Bogga hore wuxuu leeyahay qaybta "Nala Soo Xidhiidh" oo ka kooban WhatsApp, Email, iyo Telefoon. Si aad u beddesho lambarka ama email-ka:
- `index.html` ka raadi qaybta `<!-- CONTACT -->` oo beddel lambarka WhatsApp (`wa.me/...`), email-ka (`mailto:...`), iyo telefoonka (`tel:...`)

## Xogta Kaydinta

- Alaabta: `localStorage` → `sz_products` (sawirrada way ku jiraan halkan, sidaa darteed waa inay yaraadaan)
- Dalabbyada: `localStorage` → `sz_orders`
- Baaskiidka: `localStorage` → `sz_cart`
- Settings: `localStorage` → `sz_evc_merchant`, `sz_admin_pwd`

Xogta waxay ku nool tahay browser-ka kaliya. Browser-yada caadiga ah waxay siiyaan ~5MB localStorage — dashboard-ka "Alaabta" wuxuu leeyahay gauge muujinaya inta la isticmaalay. Haddaad rabto xog gaar ah oo server-ka ku kaydsan (si dadka oo dhan ay isla wax u arkaan, browser kasta oo qof leeyahay), waxaad u beddeli kartaa backend fudud (Node/Express + database) ama GitHub API.
