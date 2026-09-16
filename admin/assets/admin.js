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
/* L'admin lit la table products directement (pas la vue products_storefront) car il a
   besoin du prix d'achat (cost_price) pour calculer marges et rotation -- une donnee
   volontairement absente de la vue publique. */
async function ubAdminGetProducts() {
  const { data, error } = await ubSupabase.from('products').select('*').order('created_at');
  if (error) { console.error('ubAdminGetProducts', error); return []; }
  return data.map(p => ({ ...ubMapProduct(p), costPrice: p.cost_price }));
}
async function ubAdminSaveProduct(p) {
  const { error } = await ubSupabase.from('products').upsert({
    id: p.id, name: p.name, category_id: p.category, gender: p.gender || 'mixte', price: p.price, old_price: p.oldPrice || null,
    cost_price: p.costPrice != null ? p.costPrice : null,
    stock: p.stock, rating: p.rating, reviews: p.reviews, tag: p.tag || null, description: p.desc,
    image_url: p.img, video_url: p.video || null, gallery_images: p.gallery || [], updated_at: new Date().toISOString(),
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

/* ---------- Avis clients (texte ou capture d'écran de conversation) ---------- */
async function ubAdminGetTestimonials() {
  const { data, error } = await ubSupabase.from('testimonials').select('*').order('sort_order', { ascending: true });
  if (error) { console.error('ubAdminGetTestimonials', error); return []; }
  return data.map(t => ({
    id: t.id, type: t.type, name: t.name, role: t.role, text: t.text, rating: t.rating,
    avatar: t.avatar_url, screenshot: t.screenshot_url, published: t.published, sortOrder: t.sort_order,
    productId: t.product_id,
  }));
}
async function ubAdminSaveTestimonial(t) {
  const { error } = await ubSupabase.from('testimonials').upsert({
    id: t.id || undefined, type: t.type, name: t.name, role: t.role || null, text: t.text || null,
    rating: t.rating || null, avatar_url: t.avatar || null, screenshot_url: t.screenshot || null,
    published: t.published !== false, sort_order: t.sortOrder || 0, product_id: t.productId || null,
  });
  if (error) console.error('ubAdminSaveTestimonial', error);
  return !error;
}
async function ubAdminDeleteTestimonial(id) {
  const { error } = await ubSupabase.from('testimonials').delete().eq('id', id);
  if (error) console.error('ubAdminDeleteTestimonial', error);
  return !error;
}

/* ---------- Box cadeau (compositions a prix fixe) ---------- */
async function ubAdminGetGiftBoxTemplates() {
  const { data, error } = await ubSupabase.from('gift_box_templates').select('*').order('sort_order', { ascending: true });
  if (error) { console.error('ubAdminGetGiftBoxTemplates', error); return []; }
  return data.map(t => ({ id: t.id, name: t.name, gender: t.gender, price: t.price, slotCount: t.slot_count, eligibleIds: t.eligible_product_ids || [], active: t.active, sortOrder: t.sort_order }));
}
async function ubAdminSaveGiftBoxTemplate(t) {
  const { error } = await ubSupabase.from('gift_box_templates').upsert({
    id: t.id || undefined, name: t.name, gender: t.gender, price: t.price, slot_count: t.slotCount,
    eligible_product_ids: t.eligibleIds || [], active: t.active !== false, sort_order: t.sortOrder || 0,
  });
  if (error) console.error('ubAdminSaveGiftBoxTemplate', error);
  return !error;
}
async function ubAdminDeleteGiftBoxTemplate(id) {
  const { error } = await ubSupabase.from('gift_box_templates').delete().eq('id', id);
  if (error) console.error('ubAdminDeleteGiftBoxTemplate', error);
  return !error;
}

/* ---------- Emballages (achats en lot, stock, cout unitaire) ---------- */
async function ubAdminGetPackagingItems() {
  const { data, error } = await ubSupabase.from('packaging_items').select('*').order('purchased_at', { ascending: false });
  if (error) { console.error('ubAdminGetPackagingItems', error); return []; }
  return data.map(p => ({
    id: p.id, name: p.name, heightCm: p.height_cm, widthCm: p.width_cm,
    quantityPurchased: p.quantity_purchased, quantityRemaining: p.quantity_remaining,
    unitCost: p.unit_cost, totalCost: p.total_cost, purchasedAt: p.purchased_at, notes: p.notes,
  }));
}
async function ubAdminSavePackagingItem(p) {
  const { error } = await ubSupabase.from('packaging_items').upsert({
    id: p.id || undefined, name: p.name, height_cm: p.heightCm || null, width_cm: p.widthCm || null,
    quantity_purchased: p.quantityPurchased, quantity_remaining: p.quantityRemaining,
    unit_cost: p.unitCost, total_cost: p.totalCost, purchased_at: p.purchasedAt, notes: p.notes || null,
  });
  if (error) console.error('ubAdminSavePackagingItem', error);
  return !error;
}
async function ubAdminDeletePackagingItem(id) {
  const { error } = await ubSupabase.from('packaging_items').delete().eq('id', id);
  if (error) console.error('ubAdminDeletePackagingItem', error);
  return !error;
}
/* Ajuste le stock restant d'un emballage (delta positif ou negatif). N'empeche jamais
   l'operation meme si ca passe sous zero : la cliente doit garder de la flexibilite si
   un format est temporairement epuise (elle enregistrera le rachat plus tard). */
async function ubAdminAdjustPackagingStock(id, delta) {
  const { data, error: readErr } = await ubSupabase.from('packaging_items').select('quantity_remaining').eq('id', id).maybeSingle();
  if (readErr || !data) return false;
  const { error } = await ubSupabase.from('packaging_items').update({ quantity_remaining: data.quantity_remaining + delta }).eq('id', id);
  if (error) console.error('ubAdminAdjustPackagingStock', error);
  return !error;
}
async function ubAdminSetOrderPackaging(orderId, packagingItemId, packagingCost) {
  const { error } = await ubSupabase.from('orders').update({ packaging_item_id: packagingItemId || null, packaging_cost: packagingCost != null ? packagingCost : null }).eq('id', orderId);
  if (error) console.error('ubAdminSetOrderPackaging', error);
  return !error;
}

/* ---------- Zones de livraison ---------- */
async function ubAdminGetZones() {
  const { data, error } = await ubSupabase.from('delivery_zones').select('*').order('sort_order', { ascending: true });
  if (error) { console.error('ubAdminGetZones', error); return []; }
  return data.map(z => ({ id: z.id, name: z.name, fee: z.fee, active: z.active, sortOrder: z.sort_order }));
}
async function ubAdminSaveZone(z) {
  const { error } = await ubSupabase.from('delivery_zones').upsert({
    id: z.id || undefined, name: z.name, fee: z.fee, active: z.active !== false, sort_order: z.sortOrder || 0,
  });
  if (error) console.error('ubAdminSaveZone', error);
  return !error;
}
async function ubAdminDeleteZone(id) {
  const { error } = await ubSupabase.from('delivery_zones').delete().eq('id', id);
  if (error) console.error('ubAdminDeleteZone', error);
  return !error;
}

/* ---------- Messages de contact & newsletter ---------- */
async function ubAdminGetContactMessages() {
  const { data, error } = await ubSupabase.from('contact_messages').select('*').order('created_at', { ascending: false });
  if (error) { console.error('ubAdminGetContactMessages', error); return []; }
  return data;
}
async function ubAdminSetMessageStatus(id, status) {
  const { error } = await ubSupabase.from('contact_messages').update({ status }).eq('id', id);
  return !error;
}
async function ubAdminGetNewsletterSubscribers() {
  const { data, error } = await ubSupabase.from('newsletter_subscribers').select('*').order('created_at', { ascending: false });
  if (error) { console.error('ubAdminGetNewsletterSubscribers', error); return []; }
  return data;
}

/* ---------- Commandes ---------- */
async function ubAdminGetOrders() {
  const { data, error } = await ubSupabase.from('orders').select('*, order_items(product_id, qty, product_name, unit_price, unit_cost)').order('order_date', { ascending: false });
  if (error) { console.error('ubAdminGetOrders', error); return []; }
  return data.map(o => ({
    id: o.id, client: ubEscapeHtml(o.client_name), phone: ubEscapeHtml(o.phone), address: ubEscapeHtml(o.address), date: o.order_date,
    payment: ubEscapeHtml(o.payment_method), paymentStatus: o.payment_status, status: o.status,
    packagingItemId: o.packaging_item_id, packagingCost: o.packaging_cost,
    items: (o.order_items || []).map(it => ({ productId: it.product_id, qty: it.qty, name: it.product_name, price: it.unit_price, cost: it.unit_cost })),
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
async function ubAdminDeleteOrder(id) {
  const { error } = await ubSupabase.from('orders').delete().eq('id', id);
  if (error) console.error('ubAdminDeleteOrder', error);
  return !error;
}
async function ubAdminUpdateOrderDelivery(id, patch) {
  const { error } = await ubSupabase.from('orders').update(patch).eq('id', id);
  if (error) console.error('ubAdminUpdateOrderDelivery', error);
  return !error;
}
/* Echange la position de file de deux commandes pour les reordonner sans laisser de trou. */
async function ubAdminSwapQueuePosition(idA, posA, idB, posB) {
  const [r1, r2] = await Promise.all([
    ubSupabase.from('orders').update({ queue_position: posB }).eq('id', idA),
    ubSupabase.from('orders').update({ queue_position: posA }).eq('id', idB),
  ]);
  return !r1.error && !r2.error;
}

/* ---------- Mise a jour WhatsApp du statut d'une commande ---------- */
const UB_ORDER_STATUS_MSG = {
  en_attente: 'est en attente de traitement',
  en_cours: 'est en cours de préparation / expédition',
  livree: 'a bien été livrée',
  annulee: 'a été annulée',
};
const UB_DELIVERY_STATUS_MSG = {
  a_preparer: 'est en cours de préparation',
  prete: 'est prête et va bientôt partir en livraison',
  en_livraison: 'est en cours de livraison',
  livree: 'a bien été livrée',
  echec: 'a rencontré un souci lors de la livraison — nous revenons vers vous rapidement',
  annulee: 'a été annulée',
};
function ubPhoneToWhatsAppNumber(phone) {
  let digits = String(phone || '').replace(/\D/g, '');
  if (digits.length === 9) digits = '221' + digits; // numero local senegalais sans indicatif
  return digits;
}
function ubWhatsAppOrderUpdateLink(order, phrase) {
  const firstName = (order.client || '').split(' ')[0] || '';
  const message = `Bonjour ${firstName}, votre commande ${order.id} chez Urbann Beauty ${phrase || 'a bien été enregistrée'}. Merci pour votre confiance ! 💜`;
  return `https://wa.me/${ubPhoneToWhatsAppNumber(order.phone)}?text=${encodeURIComponent(message)}`;
}

/* ---------- Reinitialisation (donnees de test / transactionnelles) ----------
   Ne touche jamais aux produits, categories, avis clients, zones de livraison
   ou a la mediatheque : uniquement les donnees transactionnelles/test. */
async function ubAdminCountRows(table) {
  const { count, error } = await ubSupabase.from(table).select('id', { count: 'exact', head: true });
  if (error) { console.error('ubAdminCountRows', table, error); return 0; }
  return count || 0;
}
async function ubAdminWipeTable(table) {
  const { error } = await ubSupabase.from(table).delete().not('id', 'is', null);
  if (error) console.error('ubAdminWipeTable', table, error);
  return !error;
}
/* Reverifie le mot de passe du compte connecte sans changer la session en cours. */
async function ubAdminVerifyPassword(password) {
  const session = await ubAdminGetSession();
  if (!session?.user?.email) return false;
  const { error } = await ubSupabase.auth.signInWithPassword({ email: session.user.email, password });
  return !error;
}

const UB_ARCHIVED_PRODUCT_IMG = 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=400&auto=format&fit=crop';
function ubProductsById(products) { return Object.fromEntries(products.map(p => [p.id, p])); }
/* Chaque ligne de commande garde le nom/prix du produit au moment de l'achat (product_name/
   unit_price, figes par ub_place_order) : la facture reste exacte meme si le produit est
   ensuite renomme, change de prix ou est supprime. On ne retombe sur la fiche produit en
   direct que pour d'anciennes commandes passees avant l'ajout de ce figeage. */
function ubOrderLines(order, productsById) {
  return order.items.map(l => {
    const p = productsById[l.productId];
    return {
      productId: l.productId,
      name: l.name || (p ? p.name : 'Produit archivé (supprimé depuis)'),
      qty: l.qty,
      price: l.price != null ? l.price : (p ? p.price : 0),
      cost: l.cost != null ? l.cost : (p ? p.costPrice : 0) || 0,
    };
  });
}
function ubOrderTotal(order, productsById) {
  return ubOrderLines(order, productsById).reduce((s, l) => s + l.qty * l.price, 0);
}
function ubOrderCOGS(order, productsById) {
  const productsCost = ubOrderLines(order, productsById).reduce((s, l) => s + l.qty * (l.cost || 0), 0);
  return productsCost + (order.packagingCost || 0);
}
function ubOrderItemCount(order) {
  return order.items.reduce((s, l) => s + l.qty, 0);
}

/* ---------- Marges & rotation des stocks ---------- */
function ubComputeProfitability(orders, productsById) {
  const active = orders.filter(o => o.status !== 'annulee');
  const revenue = active.reduce((s, o) => s + ubOrderTotal(o, productsById), 0);
  const cogs = active.reduce((s, o) => s + ubOrderCOGS(o, productsById), 0);
  const margin = revenue - cogs;
  return { revenue, cogs, margin, marginPct: revenue ? Math.round((margin / revenue) * 100) : 0 };
}
/* Rotation simplifiee par produit : quantite vendue (commandes non annulees) rapportee
   au stock actuel. >1 signifie que les ventes ont deja depasse le stock actuellement
   en rayon (bon signe de rotation) ; proche de 0 signifie un stock qui dort. */
function ubComputeProductRotation(products, orders) {
  const sold = {};
  orders.forEach(o => {
    if (o.status === 'annulee') return;
    o.items.forEach(l => { if (l.productId) sold[l.productId] = (sold[l.productId] || 0) + l.qty; });
  });
  return products.map(p => {
    const qtySold = sold[p.id] || 0;
    const unitMargin = (p.costPrice != null) ? (p.price - p.costPrice) : null;
    return {
      product: p,
      qtySold,
      unitMargin,
      marginPct: (unitMargin != null && p.price) ? Math.round((unitMargin / p.price) * 100) : null,
      totalMargin: unitMargin != null ? unitMargin * qtySold : null,
      rotation: p.stock > 0 ? Math.round((qtySold / p.stock) * 100) / 100 : (qtySold > 0 ? Infinity : 0),
    };
  }).sort((a, b) => b.qtySold - a.qtySold);
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
    o.items.forEach(l => {
      const key = l.productId || l.name || 'inconnu';
      if (!sales[key]) {
        const live = l.productId ? productsById[l.productId] : null;
        sales[key] = { qty: 0, product: live || { id: l.productId, name: l.name || 'Produit archivé (supprimé depuis)', img: UB_ARCHIVED_PRODUCT_IMG, price: l.price || 0 } };
      }
      sales[key].qty += l.qty;
    });
  });
  return Object.values(sales)
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

/* ---------- Rapports periodiques (mensuel / trimestriel / semestriel) ---------- */
function ubMonthRange(year, month) {
  const start = new Date(Date.UTC(year, month - 1, 1));
  const end = new Date(Date.UTC(year, month, 0));
  return [start.toISOString().slice(0, 10), end.toISOString().slice(0, 10)];
}
function ubQuarterRange(year, quarter) {
  const startMonth = (quarter - 1) * 3 + 1;
  const start = new Date(Date.UTC(year, startMonth - 1, 1));
  const end = new Date(Date.UTC(year, startMonth + 2, 0));
  return [start.toISOString().slice(0, 10), end.toISOString().slice(0, 10)];
}
function ubSemesterRange(year, semester) {
  const startMonth = semester === 1 ? 1 : 7;
  const start = new Date(Date.UTC(year, startMonth - 1, 1));
  const end = new Date(Date.UTC(year, startMonth + 5, 0));
  return [start.toISOString().slice(0, 10), end.toISOString().slice(0, 10)];
}
function ubPreviousRange(type, year, period) {
  if (type === 'month') return period === 1 ? [year - 1, 12] : [year, period - 1];
  if (type === 'quarter') return period === 1 ? [year - 1, 4] : [year, period - 1];
  return period === 1 ? [year - 1, 2] : [year, period - 1];
}
function ubComputePeriodStats(orders, productsById, start, end) {
  const inRange = orders.filter(o => o.status !== 'annulee' && o.date >= start && o.date <= end);
  const revenue = inRange.reduce((s, o) => s + ubOrderTotal(o, productsById), 0);
  const count = inRange.length;
  const avg = count ? Math.round(revenue / count) : 0;
  const bestSellers = ubComputeBestSellers(inRange, productsById, 5);
  return { revenue, count, avg, bestSellers, orders: inRange };
}
function ubPercentChange(current, previous) {
  if (!previous) return current ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
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
    { href: 'box-cadeau.html', key: 'boxcadeau', label: 'Box Cadeau', icon: 'box' },
    { href: 'avis.html', key: 'avis', label: 'Avis clients', icon: 'heart' },
    { href: 'messages.html', key: 'messages', label: 'Messages & Newsletter', icon: 'mail' },
    { href: 'clients.html', key: 'clients', label: 'Clients', icon: 'users' },
    { group: 'Comptabilite' },
    { href: 'finances.html', key: 'finances', label: 'Finances', icon: 'chart' },
    { href: 'fournisseurs.html', key: 'fournisseurs', label: 'Fournisseurs', icon: 'truck' },
    { href: 'emballages.html', key: 'emballages', label: 'Emballages', icon: 'box' },
    { group: 'Compte' },
    { href: 'parametres.html', key: 'parametres', label: 'Paramètres', icon: 'settings' },
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
          <div style="position:relative">
            <button class="a-icon-btn" id="a-bell-btn">${ubIcon('bell')}<span class="dot" id="a-bell-dot" style="display:none"></span></button>
            <div id="a-bell-panel" style="display:none;position:absolute;right:0;top:calc(100% + 8px);width:300px;background:#fff;border:1px solid var(--a-line);border-radius:14px;box-shadow:0 14px 34px rgba(46,25,67,.14);padding:14px;z-index:200">
              <strong style="font-size:.86rem">Alertes stock faible</strong>
              <div id="a-bell-list" style="margin-top:10px;display:grid;gap:8px;max-height:280px;overflow-y:auto"></div>
            </div>
          </div>
          <a href="../index.html" class="a-btn a-btn-outline a-btn-sm" target="_blank">Voir le site</a>
        </div>
      </div>
      <div class="a-content" id="a-content"></div>
    </main>
  `;

  ubApplyLogo(document.getElementById('a-brand-logo'));

  ubAdminGetProducts().then(products => {
    const low = products.filter(p => p.stock <= 5).sort((a, b) => a.stock - b.stock);
    const dot = document.getElementById('a-bell-dot');
    const list = document.getElementById('a-bell-list');
    if (!dot || !list) return;
    if (low.length) { dot.style.display = 'block'; dot.textContent = ''; }
    list.innerHTML = low.length
      ? low.map(p => `<a href="produits.html" style="display:flex;justify-content:space-between;gap:10px;font-size:.8rem;color:var(--a-ink);text-decoration:none"><span>${p.name}</span><strong style="color:${p.stock === 0 ? 'var(--a-danger)' : 'var(--a-warning)'}">${p.stock} en stock</strong></a>`).join('')
      : `<p style="font-size:.8rem;color:var(--a-ink-soft);margin:0">Aucune alerte — tous les stocks sont corrects.</p>`;
  });
  const bellBtn = document.getElementById('a-bell-btn');
  const bellPanel = document.getElementById('a-bell-panel');
  if (bellBtn && bellPanel) {
    bellBtn.addEventListener('click', (e) => { e.stopPropagation(); bellPanel.style.display = bellPanel.style.display === 'none' ? 'block' : 'none'; });
    document.addEventListener('click', (e) => { if (!bellPanel.contains(e.target) && e.target !== bellBtn) bellPanel.style.display = 'none'; });
  }

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
