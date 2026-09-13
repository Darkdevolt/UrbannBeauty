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
  { id: 'CMD-1042', client: 'Aïcha Konaté', date: '2026-09-11', items: 3, total: 68500, status: 'livree', payment: 'Wave' },
  { id: 'CMD-1041', client: 'Fatou Diallo', date: '2026-09-11', items: 1, total: 24000, status: 'en_cours', payment: 'Orange Money' },
  { id: 'CMD-1040', client: 'Nadège Perreira', date: '2026-09-10', items: 5, total: 142000, status: 'en_cours', payment: 'Carte bancaire' },
  { id: 'CMD-1039', client: 'Marie Sow', date: '2026-09-10', items: 2, total: 47500, status: 'livree', payment: 'Wave' },
  { id: 'CMD-1038', client: 'Khady Ba', date: '2026-09-09', items: 1, total: 9500, status: 'annulee', payment: 'Orange Money' },
  { id: 'CMD-1037', client: 'Rokhaya Fall', date: '2026-09-09', items: 4, total: 98000, status: 'livree', payment: 'Carte bancaire' },
  { id: 'CMD-1036', client: 'Bineta Ndiaye', date: '2026-09-08', items: 2, total: 33000, status: 'en_attente', payment: 'Wave' },
  { id: 'CMD-1035', client: 'Aminata Sarr', date: '2026-09-08', items: 1, total: 15500, status: 'livree', payment: 'Orange Money' },
];
function ubAdminGetOrders() {
  const overrides = JSON.parse(localStorage.getItem(UB_ADMIN_ORDERS_KEY) || 'null');
  return overrides || JSON.parse(JSON.stringify(UB_DEMO_ORDERS));
}
function ubAdminSaveOrders(list) {
  localStorage.setItem(UB_ADMIN_ORDERS_KEY, JSON.stringify(list));
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
    { href: 'commandes.html', key: 'commandes', label: 'Commandes & Ventes', icon: 'orders' },
    { href: 'clients.html', key: 'clients', label: 'Clients', icon: 'users' },
    { group: 'Compte' },
    { href: '#', key: 'parametres', label: 'Paramètres', icon: 'settings' },
  ];

  shell.innerHTML = `
    <aside class="a-sidebar" id="a-sidebar">
      <a href="dashboard.html" class="brand">Urbann<span>Beauty</span></a>
      <nav class="a-nav">
        ${nav.map(n => n.group
          ? `<div class="group-label">${n.group}</div>`
          : `<a href="${n.href}" class="${n.key === active ? 'active' : ''}">${ubIcon(n.icon)} ${n.label}</a>`
        ).join('')}
      </nav>
      <div class="a-sidebar-footer">
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
          <button class="a-icon-btn">${ubIcon('bell')}<span class="dot"></span></button>
          <a href="../index.html" class="a-btn a-btn-outline a-btn-sm" target="_blank">Voir le site</a>
        </div>
      </div>
      <div class="a-content" id="a-content"></div>
    </main>
  `;

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
