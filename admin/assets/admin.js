/* ============================================
   URBANN BEAUTY ADMIN — Comportements du back-office
   (données réelles via Supabase : Postgres + Auth + Storage)
   ============================================ */

/* ---------- Auth (Supabase) ---------- */
async function ubAdminGetSession() {
  const { data } = await ubSupabase.auth.getSession();
  return data.session;
}
async function ubAdminLogin(email, password) {
  const { data, error } = await ubSupabase.auth.signInWithPassword({ email, password });
  return { session: data?.session, error };
}
async function ubAdminLogout() {
  await ubSupabase.auth.signOut();
  location.href = 'index.html';
}
async function ubAdminGuard() {
  const session = await ubAdminGetSession();
  if (!session) { location.href = 'index.html'; return false; }
  return true;
}

/* ---------- Produits ---------- */
async function ubAdminGetProducts() { return ubGetAllProducts(); }
async function ubAdminSaveProduct(p) {
  const { error } = await ubSupabase.from('products').upsert({
    id: p.id, name: p.name, category_id: p.category, price: p.price, old_price: p.oldPrice || null,
    stock: p.stock, rating: p.rating, reviews: p.reviews, tag: p.tag || null, description: p.desc,
    image_url: p.img, video_url: p.video || null, updated_at: new Date().toISOString(),
  });
  if (error) console.error('ubAdminSaveProduct', error);
  return !error;
}
async function ubAdminDeleteProduct(id) {
  const { error } = await ubSupabase.from('products').delete().eq('id', id);
  if (error) console.error('ubAdminDeleteProduct', error);
  return !error;
}

/* ---------- Catégories ---------- */
async function ubAdminSaveCategory(cat) {
  const { error } = await ubSupabase.from('categories').upsert({ id: cat.id, name: cat.name, icon: cat.icon, image_url: cat.image || null });
  if (error) console.error('ubAdminSaveCategory', error);
  return !error;
}
async function ubAdminDeleteCategory(id) {
  const { error } = await ubSupabase.from('categories').delete().eq('id', id);
  if (error) console.error('ubAdminDeleteCategory', error);
  return !error;
}

/* ---------- Commandes ---------- */
async function ubAdminGetOrders() {
  const { data, error } = await ubSupabase.from('orders').select('*, order_items(product_id, qty)').order('order_date', { ascending: false });
  if (error) { console.error('ubAdminGetOrders', error); return []; }
  return data.map(o => ({
    id: o.id, client: ubEscapeHtml(o.client_name), phone: ubEscapeHtml(o.phone), address: ubEscapeHtml(o.address), date: o.order_date,
    payment: ubEscapeHtml(o.payment_method), paymentStatus: o.payment_status, status: o.status,
    items: (o.order_items || []).map(it => ({ productId: it.product_id, qty: it.qty })),
  }));
}
async function ubAdminUpdateOrderStatus(id, status) {
  const { error } = await ubSupabase.from('orders').update({ status }).eq('id', id);
  return !error;
}
async function ubAdminUpdateOrderPayment(id, paymentStatus) {
  const { error } = await ubSupabase.from('orders').update({ payment_status: paymentStatus }).eq('id', id);
  return !error;
}

function ubProductsById(products) { return Object.fromEntries(products.map(p => [p.id, p])); }
function ubOrderLines(order, productsById) {
  return order.items.map(l => {
    const p = productsById[l.productId];
    return { productId: l.productId, name: p ? p.name : 'Produit supprimé', qty: l.qty, price: p ? p.price : 0 };
  });
}
function ubOrderTotal(order, productsById) {
  return ubOrderLines(order, productsById).reduce((s, l) => s + l.qty * l.price, 0);
}
function ubOrderItemCount(order) {
  return order.items.reduce((s, l) => s + l.qty, 0);
}

/* ---------- Fournisseurs (comptes à payer) ---------- */
async function ubAdminGetSuppliers() {
  const { data, error } = await ubSupabase.from('suppliers').select('*').order('due_date');
  if (error) { console.error('ubAdminGetSuppliers', error); return []; }
  return data.map(s => ({ id: s.id, name: s.name, contact: s.contact, category: s.category, amount: s.amount, dueDate: s.due_date, status: s.status }));
}
async function ubAdminSaveSupplier(s) {
  const { error } = await ubSupabase.from('suppliers').upsert({ id: s.id, name: s.name, contact: s.contact || null, category: s.category || null, amount: s.amount, due_date: s.dueDate, status: s.status });
  if (error) console.error('ubAdminSaveSupplier', error);
  return !error;
}
async function ubAdminDeleteSupplier(id) {
  const { error } = await ubSupabase.from('suppliers').delete().eq('id', id);
  return !error;
}
function ubSupplierIsLate(s) {
  return s.status === 'a_payer' && new Date(s.dueDate) < new Date(new Date().toDateString());
}

/* ---------- Comptabilité : créances clients & dettes fournisseurs ---------- */
function ubComputeReceivables(orders, productsById) {
  const map = {};
  orders.forEach(o => {
    if (o.status === 'annulee' || o.paymentStatus === 'paye') return;
    if (!map[o.client]) map[o.client] = { client: o.client, phone: o.phone, total: 0, orders: [] };
    map[o.client].total += ubOrderTotal(o, productsById);
    map[o.client].orders.push(o.id);
  });
  const list = Object.values(map).sort((a, b) => b.total - a.total);
  return { total: list.reduce((s, c) => s + c.total, 0), list };
}
function ubComputePayables(suppliers) {
  const list = suppliers.filter(s => s.status === 'a_payer');
  return { total: list.reduce((s, f) => s + f.amount, 0), list };
}

/* ---------- Zones géographiques (extraites des adresses de livraison) ---------- */
function ubComputeZoneStats(orders, productsById, limit = 6) {
  const map = {};
  orders.forEach(o => {
    if (o.status === 'annulee' || !o.address) return;
    const zone = o.address.split(',')[0].trim();
    if (!map[zone]) map[zone] = { zone, orders: 0, total: 0 };
    map[zone].orders += 1;
    map[zone].total += ubOrderTotal(o, productsById);
  });
  return Object.values(map).sort((a, b) => b.total - a.total).slice(0, limit);
}

/* ---------- Analytics : meilleures ventes & meilleurs clients ---------- */
function ubComputeBestSellers(orders, productsById, limit = 5) {
  const sales = {};
  orders.forEach(o => {
    if (o.status === 'annulee') return;
    o.items.forEach(l => { sales[l.productId] = (sales[l.productId] || 0) + l.qty; });
  });
  return Object.entries(sales)
    .map(([productId, qty]) => ({ product: productsById[productId], qty }))
    .filter(x => x.product)
    .sort((a, b) => b.qty - a.qty)
    .slice(0, limit);
}
function ubComputeBestClients(orders, productsById, limit = 5) {
  const map = {};
  orders.forEach(o => {
    if (o.status === 'annulee') return;
    if (!map[o.client]) map[o.client] = { name: o.client, total: 0, orders: 0 };
    map[o.client].total += ubOrderTotal(o, productsById);
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
async function ubAdminRenderShell(active, pageTitle, pageSub) {
  const shell = document.getElementById('admin-shell');
  if (!shell) return;

  const session = await ubAdminGetSession();
  const userEmail = session?.user?.email || 'admin';

  const nav = [
    { group: 'Général' },
    { href: 'dashboard.html', key: 'dashboard', label: 'Tableau de bord', icon: 'dashboard' },
    { group: 'Boutique' },
    { href: 'produits.html', key: 'produits', label: 'Produits & Stock', icon: 'box' },
    { href: 'categories.html', key: 'categories', label: 'Catégories', icon: 'filter' },
    { href: 'media.html', key: 'media', label: 'Médiathèque', icon: 'image' },
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
          <div><strong>Admin Urbann</strong><span>${userEmail}</span></div>
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

  ubApplyLogo(document.getElementById('a-brand-logo'));

  const burger = document.getElementById('a-burger');
  const sidebar = document.getElementById('a-sidebar');
  if (window.innerWidth <= 980) burger.style.display = 'flex';
  window.addEventListener('resize', () => { burger.style.display = window.innerWidth <= 980 ? 'flex' : 'none'; });
  burger.addEventListener('click', () => sidebar.classList.toggle('open'));

  const content = document.getElementById('a-content');
  if (content) {
    ubInitTableScrollShadows(content);
    new MutationObserver(() => ubInitTableScrollShadows(content)).observe(content, { childList: true, subtree: true });
  }
}

/* ---------- Ombres de defilement horizontal des tableaux (mobile) ---------- */
function ubWireTableScrollShadow(wrap) {
  if (wrap.dataset.scrollShadowWired) return;
  wrap.dataset.scrollShadowWired = '1';
  const update = () => {
    const max = wrap.scrollWidth - wrap.clientWidth;
    wrap.classList.toggle('has-scroll-left', wrap.scrollLeft > 4);
    wrap.classList.toggle('has-scroll-right', max > 4 && wrap.scrollLeft < max - 4);
  };
  wrap.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
}
function ubInitTableScrollShadows(scope) {
  (scope || document).querySelectorAll('.a-table-wrap').forEach(ubWireTableScrollShadow);
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
async function ubQuickPromo(id, products, onSaved) {
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
  await ubAdminSaveProduct(p);
  ubAToast('Promotion mise à jour pour ' + p.name);
  if (onSaved) onSaved();
}
