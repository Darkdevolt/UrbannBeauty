/* ============================================
   URBANN BEAUTY ADMIN — Comportements du back-office
   (démo front-end uniquement : persistance via localStorage)
   ============================================ */

const UB_ADMIN_SESSION_KEY = 'ub_admin_session';
const UB_ADMIN_PRODUCTS_KEY = 'ub_admin_products';
const UB_ADMIN_ORDERS_KEY = 'ub_admin_orders';

/* ---------- Auth (démo) ---------- */
function ubAdminIsLoggedIn() {
  return sessionStorage.getItem(UB_ADMIN_SESSION_KEY) === '1';
}
function ubAdminLogin() {
  sessionStorage.setItem(UB_ADMIN_SESSION_KEY, '1');
}
function ubAdminLogout() {
  sessionStorage.removeItem(UB_ADMIN_SESSION_KEY);
  location.href = 'index.html';
}
function ubAdminGuard() {
  if (!ubAdminIsLoggedIn()) location.href = 'index.html';
}

/* ---------- Données admin (seed depuis data.js + overrides localStorage) ---------- */
function ubAdminGetProducts() {
  const overrides = JSON.parse(localStorage.getItem(UB_ADMIN_PRODUCTS_KEY) || 'null');
  return overrides || JSON.parse(JSON.stringify(UB_PRODUCTS));
}
function ubAdminSaveProducts(list) {
  localStorage.setItem(UB_ADMIN_PRODUCTS_KEY, JSON.stringify(list));
}

const UB_DEMO_ORDERS = [
  { id: 'CMD-1042', client: 'Aïcha Konaté', phone: '77 123 45 67', address: 'Plateau, Dakar', date: '2026-09-11',
    items: [{ productId: 'p1', qty: 1 }, { productId: 'p3', qty: 1 }, { productId: 'p9', qty: 1 }],
    status: 'livree', paymentStatus: 'paye', payment: 'Wave' },
  { id: 'CMD-1041', client: 'Fatou Diallo', phone: '78 234 56 78', address: 'Sacré-Cœur, Dakar', date: '2026-09-11',
    items: [{ productId: 'p1', qty: 1 }],
    status: 'en_cours', paymentStatus: 'paye', payment: 'Orange Money' },
  { id: 'CMD-1040', client: 'Nadège Perreira', phone: '76 345 67 89', address: 'Almadies, Dakar', date: '2026-09-10',
    items: [{ productId: 'p5', qty: 1 }, { productId: 'p3', qty: 1 }, { productId: 'p11', qty: 1 }],
    status: 'en_cours', paymentStatus: 'en_attente', payment: 'Carte bancaire' },
  { id: 'CMD-1039', client: 'Marie Sow', phone: '70 456 78 90', address: 'Ouakam, Dakar', date: '2026-09-10',
    items: [{ productId: 'p2', qty: 1 }, { productId: 'p10', qty: 1 }],
    status: 'livree', paymentStatus: 'paye', payment: 'Wave' },
  { id: 'CMD-1038', client: 'Khady Ba', phone: '77 567 89 01', address: 'Yoff, Dakar', date: '2026-09-09',
    items: [{ productId: 'p9', qty: 1 }],
    status: 'annulee', paymentStatus: 'rembourse', payment: 'Orange Money' },
  { id: 'CMD-1037', client: 'Rokhaya Fall', phone: '78 678 90 12', address: 'Mermoz, Dakar', date: '2026-09-09',
    items: [{ productId: 'p3', qty: 1 }, { productId: 'p1', qty: 1 }, { productId: 'p6', qty: 1 }, { productId: 'p12', qty: 1 }],
    status: 'livree', paymentStatus: 'paye', payment: 'Carte bancaire' },
  { id: 'CMD-1036', client: 'Bineta Ndiaye', phone: '76 789 01 23', address: 'Parcelles Assainies, Dakar', date: '2026-09-08',
    items: [{ productId: 'p7', qty: 1 }, { productId: 'p8', qty: 2 }],
    status: 'en_attente', paymentStatus: 'en_attente', payment: 'Paiement à la livraison' },
  { id: 'CMD-1035', client: 'Aminata Sarr', phone: '70 890 12 34', address: 'Grand Yoff, Dakar', date: '2026-09-08',
    items: [{ productId: 'p2', qty: 1 }],
    status: 'livree', paymentStatus: 'paye', payment: 'Orange Money' },
];

function ubOrderLines(order) {
  return order.items.map(l => {
    const p = ubGetProduct(l.productId);
    return { productId: l.productId, name: p ? p.name : 'Produit supprimé', qty: l.qty, price: p ? p.price : 0 };
  });
}
function ubOrderTotal(order) {
  return ubOrderLines(order).reduce((s, l) => s + l.qty * l.price, 0);
}
function ubOrderItemCount(order) {
  return order.items.reduce((s, l) => s + l.qty, 0);
}

function ubAdminGetOrders() {
  const overrides = JSON.parse(localStorage.getItem(UB_ADMIN_ORDERS_KEY) || 'null');
  return overrides || JSON.parse(JSON.stringify(UB_DEMO_ORDERS));
}
function ubAdminSaveOrders(list) {
  localStorage.setItem(UB_ADMIN_ORDERS_KEY, JSON.stringify(list));
}

/* ---------- Fournisseurs (comptes a payer) ---------- */
const UB_ADMIN_SUPPLIERS_KEY = 'ub_admin_suppliers';
const UB_DEMO_SUPPLIERS = [
  { id: 'F1', name: 'Cosmetics Import SARL', contact: '77 111 22 33', category: 'Matieres premieres', amount: 250000, dueDate: '2026-09-25', status: 'a_payer' },
  { id: 'F2', name: 'Packaging Plus', contact: '78 222 33 44', category: 'Emballages', amount: 65000, dueDate: '2026-09-18', status: 'a_payer' },
  { id: 'F3', name: 'Dakar Logistique', contact: '76 333 44 55', category: 'Livraison', amount: 40000, dueDate: '2026-09-05', status: 'paye' },
  { id: 'F4', name: 'Parfums Grossiste Sarl', contact: '70 444 55 66', category: 'Matieres premieres', amount: 180000, dueDate: '2026-08-30', status: 'a_payer' },
];
function ubAdminGetSuppliers() {
  const overrides = JSON.parse(localStorage.getItem(UB_ADMIN_SUPPLIERS_KEY) || 'null');
  return overrides || JSON.parse(JSON.stringify(UB_DEMO_SUPPLIERS));
}
function ubAdminSaveSuppliers(list) {
  localStorage.setItem(UB_ADMIN_SUPPLIERS_KEY, JSON.stringify(list));
}
function ubSupplierIsLate(s) {
  return s.status === 'a_payer' && new Date(s.dueDate) < new Date(new Date().toDateString());
}

/* ---------- Comptabilite : creances clients & dettes fournisseurs ---------- */
function ubComputeReceivables(orders) {
  const map = {};
  orders.forEach(o => {
    if (o.status === 'annulee' || o.paymentStatus === 'paye') return;
    if (!map[o.client]) map[o.client] = { client: o.client, phone: o.phone, total: 0, orders: [] };
    map[o.client].total += ubOrderTotal(o);
    map[o.client].orders.push(o.id);
  });
  const list = Object.values(map).sort((a, b) => b.total - a.total);
  return { total: list.reduce((s, c) => s + c.total, 0), list };
}
function ubComputePayables(suppliers) {
  const list = suppliers.filter(s => s.status === 'a_payer');
  return { total: list.reduce((s, f) => s + f.amount, 0), list };
}

/* ---------- Zones geographiques (extraites des adresses de livraison) ---------- */
function ubComputeZoneStats(orders, limit = 6) {
  const map = {};
  orders.forEach(o => {
    if (o.status === 'annulee' || !o.address) return;
    const zone = o.address.split(',')[0].trim();
    if (!map[zone]) map[zone] = { zone, orders: 0, total: 0 };
    map[zone].orders += 1;
    map[zone].total += ubOrderTotal(o);
  });
  return Object.values(map).sort((a, b) => b.total - a.total).slice(0, limit);
}

/* ---------- Analytics : meilleures ventes & meilleurs clients ---------- */
function ubComputeBestSellers(orders, limit = 5) {
  const sales = {};
  orders.forEach(o => {
    if (o.status === 'annulee') return;
    o.items.forEach(l => {
      sales[l.productId] = (sales[l.productId] || 0) + l.qty;
    });
  });
  return Object.entries(sales)
    .map(([productId, qty]) => ({ product: ubGetProduct(productId), qty }))
    .filter(x => x.product)
    .sort((a, b) => b.qty - a.qty)
    .slice(0, limit);
}
function ubComputeBestClients(orders, limit = 5) {
  const map = {};
  orders.forEach(o => {
    if (o.status === 'annulee') return;
    if (!map[o.client]) map[o.client] = { name: o.client, total: 0, orders: 0 };
    map[o.client].total += ubOrderTotal(o);
    map[o.client].orders += 1;
  });
  return Object.values(map).sort((a, b) => b.total - a.total).slice(0, limit);
}

/* ---------- Toast ---------- */
let ubAToastTimer = null;
function ubAToast(message) {
  let toast = document.querySelector('.a-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'a-toast';
    toast.innerHTML = `${ubIcon('check')}<span class="msg"></span>`;
    document.body.appendChild(toast);
  }
  toast.querySelector('.msg').textContent = message;
  toast.classList.add('show');
  clearTimeout(ubAToastTimer);
  ubAToastTimer = setTimeout(() => toast.classList.remove('show'), 2600);
}

/* ---------- Shell (sidebar + topbar) réutilisable ---------- */
function ubAdminRenderShell(active, pageTitle, pageSub) {
  const shell = document.getElementById('admin-shell');
  if (!shell) return;

  const nav = [
    { group: 'Général' },
    { href: 'dashboard.html', key: 'dashboard', label: 'Tableau de bord', icon: 'dashboard' },
    { group: 'Boutique' },
    { href: 'produits.html', key: 'produits', label: 'Produits & Stock', icon: 'box' },
    { href: 'categories.html', key: 'categories', label: 'Catégories', icon: 'filter' },
    { href: 'commandes.html', key: 'commandes', label: 'Commandes & Ventes', icon: 'orders' },
    { href: 'clients.html', key: 'clients', label: 'Clients', icon: 'users' },
    { group: 'Comptabilite' },
    { href: 'finances.html', key: 'finances', label: 'Finances', icon: 'chart' },
    { href: 'fournisseurs.html', key: 'fournisseurs', label: 'Fournisseurs', icon: 'truck' },
    { group: 'Compte' },
    { href: '#', key: 'parametres', label: 'Paramètres', icon: 'settings' },
  ];

  shell.innerHTML = `
    <aside class="a-sidebar" id="a-sidebar">
      <a href="dashboard.html" class="brand" id="a-brand-logo">Urbann<span>Beauty</span></a>
      <nav class="a-nav">
        ${nav.map(n => n.group
          ? `<div class="group-label">${n.group}</div>`
          : `<a href="${n.href}" class="${n.key === active ? 'active' : ''}">${ubIcon(n.icon)} ${n.label}</a>`
        ).join('')}
      </nav>
      <div class="a-sidebar-footer">
        <a href="https://wa.me/${UB_CONTACT.whatsapp}?text=${encodeURIComponent('Bonjour, j\'ai besoin d\'aide sur mon espace admin Urbann Beauty.')}" target="_blank" rel="noopener" class="a-btn a-btn-sm a-btn-block" style="background:#25D366;color:#fff;margin-bottom:10px">${ubIcon('whatsapp')} Assistance WhatsApp</a>
        <div class="a-user-chip">
          <div class="avatar">UB</div>
          <div><strong>Admin Urbann</strong><span>admin@urbannbeauty.com</span></div>
        </div>
        <button class="a-btn a-btn-outline a-btn-sm a-btn-block" style="margin-top:14px" onclick="ubAdminLogout()">${ubIcon('logout')} Déconnexion</button>
      </div>
    </aside>
    <main class="a-main">
      <div class="a-topbar">
        <div style="display:flex;align-items:center;gap:14px">
          <button class="a-icon-btn" id="a-burger" style="display:none">${ubIcon('menu')}</button>
          <div>
            <h1>${pageTitle}</h1>
            <div class="sub">${pageSub || ''}</div>
          </div>
        </div>
        <div class="a-topbar-actions">
          <a href="https://wa.me/${UB_CONTACT.whatsapp}" target="_blank" rel="noopener" class="a-icon-btn" title="Assistance WhatsApp en cas de pépin" style="color:#25D366">${ubIcon('whatsapp')}</a>
          <button class="a-icon-btn">${ubIcon('bell')}<span class="dot"></span></button>
          <a href="../index.html" class="a-btn a-btn-outline a-btn-sm" target="_blank">Voir le site</a>
        </div>
      </div>
      <div class="a-content" id="a-content"></div>
    </main>
  `;

  ubApplyLogo(document.getElementById('a-brand-logo'), '../assets/img/logo.png');

  const burger = document.getElementById('a-burger');
  const sidebar = document.getElementById('a-sidebar');
  if (window.innerWidth <= 980) burger.style.display = 'flex';
  window.addEventListener('resize', () => { burger.style.display = window.innerWidth <= 980 ? 'flex' : 'none'; });
  burger.addEventListener('click', () => sidebar.classList.toggle('open'));
}

function ubStockBadge(stock) {
  if (stock <= 5) return `<span class="a-badge danger">Stock faible</span>`;
  if (stock <= 15) return `<span class="a-badge warning">Stock moyen</span>`;
  return `<span class="a-badge success">En stock</span>`;
}
function ubOrderStatusBadge(status) {
  const map = {
    livree: { cls: 'success', label: 'Livrée' },
    en_cours: { cls: 'warning', label: 'En cours' },
    en_attente: { cls: 'neutral', label: 'En attente' },
    annulee: { cls: 'danger', label: 'Annulée' },
  };
  const s = map[status] || map.en_attente;
  return `<span class="a-badge ${s.cls}">${s.label}</span>`;
}
function ubPaymentStatusBadge(status) {
  const map = {
    paye: { cls: 'success', label: 'Payé' },
    en_attente: { cls: 'warning', label: 'En attente' },
    rembourse: { cls: 'danger', label: 'Remboursé' },
  };
  const s = map[status] || map.en_attente;
  return `<span class="a-badge ${s.cls}">${s.label}</span>`;
}

/* ---------- Export CSV (compatible Excel) ---------- */
function ubExportCSV(filename, headers, rows) {
  const escape = (v) => {
    const s = String(v ?? '');
    return /[";\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  };
  const lines = [headers.map(escape).join(';'), ...rows.map(r => r.map(escape).join(';'))];
  const csv = '﻿' + lines.join('\r\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  ubAToast('Export téléchargé : ' + filename);
}

/* ---------- Mise en promo rapide ---------- */
function ubQuickPromo(id, products, onSaved) {
  const p = products.find(x => x.id === id);
  if (!p) return;
  const input = prompt(`Remise en % pour "${p.name}" (prix actuel : ${ubFormatPrice(p.price)}). Laisser vide pour retirer la promo.`, '');
  if (input === null) return;
  if (input.trim() === '') {
    p.oldPrice = null;
  } else {
    const pct = Number(input);
    if (!pct || pct <= 0 || pct >= 100) { alert('Merci de saisir un pourcentage entre 1 et 99.'); return; }
    p.oldPrice = p.oldPrice || p.price;
    const base = p.oldPrice;
    p.price = Math.round(base * (1 - pct / 100));
  }
  ubAdminSaveProducts(products);
  ubAToast('Promotion mise à jour pour ' + p.name);
  if (onSaved) onSaved();
}
