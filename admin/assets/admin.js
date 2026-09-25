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
    shade_hex: p.shadeHex || null, shade_label: p.shadeLabel || null,
    requires_client_note: !!p.requiresClientNote, client_note_prompt: p.requiresClientNote ? (p.clientNotePrompt || null) : null,
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

/* ---------- Codes promo (bandeau + panier) ---------- */
async function ubAdminGetPromoCodes() {
  const { data, error } = await ubSupabase.from('promo_codes').select('*').order('created_at', { ascending: false });
  if (error) { console.error('ubAdminGetPromoCodes', error); return []; }
  return data.map(c => ({ id: c.id, code: c.code, percent: c.percent, label: c.label, active: c.active, showBanner: c.show_banner }));
}
async function ubAdminSavePromoCode(c) {
  const { error } = await ubSupabase.from('promo_codes').upsert({
    id: c.id || undefined, code: c.code.toUpperCase().trim(), percent: c.percent, label: c.label,
    active: c.active !== false, show_banner: c.showBanner === true,
  });
  if (error) console.error('ubAdminSavePromoCode', error);
  return !error;
}
async function ubAdminDeletePromoCode(id) {
  const { error } = await ubSupabase.from('promo_codes').delete().eq('id', id);
  if (error) console.error('ubAdminDeletePromoCode', error);
  return !error;
}

/* ---------- Zones de livraison ---------- */
async function ubAdminGetZones() {
  const { data, error } = await ubSupabase.from('delivery_zones').select('*').order('sort_order', { ascending: true });
  if (error) { console.error('ubAdminGetZones', error); return []; }
  return data.map(z => ({ id: z.id, name: z.name, fee: z.fee, active: z.active, sortOrder: z.sort_order, whatsappHandoff: !!z.whatsapp_handoff, isPickup: !!z.is_pickup }));
}
async function ubAdminSaveZone(z) {
  const { error } = await ubSupabase.from('delivery_zones').upsert({
    id: z.id || undefined, name: z.name, fee: z.fee, active: z.active !== false, sort_order: z.sortOrder || 0,
    whatsapp_handoff: !!z.whatsappHandoff, is_pickup: !!z.isPickup,
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
  const { data, error } = await ubSupabase.from('orders').select('*, order_items(product_id, qty, product_name, unit_price, unit_cost, client_note, client_photo_path)').order('order_date', { ascending: false });
  if (error) { console.error('ubAdminGetOrders', error); return []; }
  return data.map(o => ({
    id: o.id, client: ubEscapeHtml(o.client_name), phone: ubEscapeHtml(o.phone), address: ubEscapeHtml(o.address), date: o.order_date,
    createdAt: o.created_at,
    payment: ubEscapeHtml(o.payment_method), paymentStatus: o.payment_status, status: o.status,
    deliveryStatus: o.delivery_status, deliveryPerson: o.delivery_person, deliveryDate: o.delivery_date, deliveryNotes: o.delivery_notes,
    packagingItemId: o.packaging_item_id, packagingCost: o.packaging_cost,
    subtotal: o.subtotal, promoCode: o.promo_code, discountAmount: o.discount_amount, deliveryFee: o.delivery_fee,
    orderTotal: o.order_total, depositAmount: o.deposit_amount, paymentProofPath: o.payment_proof_path, isPickup: !!o.is_pickup,
    items: (o.order_items || []).map(it => ({
      productId: it.product_id, qty: it.qty, name: it.product_name, price: it.unit_price, cost: it.unit_cost,
      clientNote: it.client_note || null, clientPhotoPath: it.client_photo_path || null,
    })),
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
      clientNote: l.clientNote || null, clientPhotoPath: l.clientPhotoPath || null,
    };
  });
}
function ubOrderHasClientInfo(order) {
  return order.items.some(l => l.clientNote || l.clientPhotoPath);
}
/* Le bucket "client-uploads" est prive (photos personnelles des clientes) : on ne
   stocke que le chemin en base, et on genere une URL signee temporaire a l'affichage,
   uniquement joignable par un admin connecte (voir policy storage "admin read client
   photos"). Expire au bout d'une heure, largement suffisant pour une consultation. */
async function ubAdminGetClientPhotoUrl(path) {
  if (!path) return null;
  const { data, error } = await ubSupabase.storage.from('client-uploads').createSignedUrl(path, 3600);
  if (error) { console.error('ubAdminGetClientPhotoUrl', error); return null; }
  return data.signedUrl;
}
function ubOrderTotal(order, productsById) {
  return ubOrderLines(order, productsById).reduce((s, l) => s + l.qty * l.price, 0);
}
/* Total reellement du par la cliente (sous-total - remise + livraison), fige cote
   serveur au moment de la commande (voir ub_place_order). Distinct de ubOrderTotal
   (qui ne compte que les lignes produits et sert aux stats de ventes/marges) --
   on ne melange pas les deux pour ne pas fausser les rapports existants. Retourne
   null pour les commandes passees avant l'ajout de cet instantane financier. */
function ubOrderGrandTotal(order) {
  return order.orderTotal != null ? order.orderTotal : null;
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
    { group: 'Ventes & clientes' },
    { href: 'commandes.html', key: 'commandes', label: 'Commandes & Ventes', icon: 'orders', badge: 'orders' },
    { href: 'relances.html', key: 'relances', label: 'Paniers abandonnés', icon: 'bag', badge: 'carts' },
    { href: 'clients.html', key: 'clients', label: 'Clientes (CRM)', icon: 'users' },
    { href: 'livraison.html', key: 'livraison', label: 'Livraisons', icon: 'truck' },
    { href: 'retours.html', key: 'retours', label: 'Retours', icon: 'return' },
    { group: 'Catalogue' },
    { href: 'produits.html', key: 'produits', label: 'Produits & Stock', icon: 'box' },
    { href: 'categories.html', key: 'categories', label: 'Catégories', icon: 'filter' },
    { href: 'box-cadeau.html', key: 'boxcadeau', label: 'Box Cadeau', icon: 'box' },
    { href: 'media.html', key: 'media', label: 'Médiathèque', icon: 'image' },
    { group: 'Marketing' },
    { href: 'promotions.html', key: 'promotions', label: 'Promotions', icon: 'chart' },
    { href: 'avis.html', key: 'avis', label: 'Avis clients', icon: 'heart' },
    { href: 'messages.html', key: 'messages', label: 'Messages & Newsletter', icon: 'mail' },
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
          : `<a href="${n.href}" class="${n.key === active ? 'active' : ''}">${ubIcon(n.icon)} ${n.label}${n.badge ? `<span class="a-nav-badge" data-nav-badge="${n.badge}" style="display:none"></span>` : ''}</a>`
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
              <strong style="font-size:.86rem">À traiter</strong>
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

  ubAdminRefreshAlerts();
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

/* ============================================
   RELATION CLIENTE & CONVERSION
   ============================================ */

/* Cle cliente stable : 9 derniers chiffres du telephone (77 123 45 67, +221771234567
   et 00221 77... designent la meme personne). */
function ubPhoneKey(phone) {
  return String(phone || '').replace(/\D/g, '').slice(-9);
}
function ubSiteUrl(path) {
  return new URL('../' + (path || ''), location.href).href;
}
function ubTimeAgo(date) {
  const s = Math.max(0, (Date.now() - new Date(date).getTime()) / 1000);
  if (s < 3600) return `il y a ${Math.max(1, Math.round(s / 60))} min`;
  if (s < 86400) return `il y a ${Math.round(s / 3600)} h`;
  const d = Math.round(s / 86400);
  return `il y a ${d} jour${d > 1 ? 's' : ''}`;
}

/* ---------- Paniers abandonnes ---------- */
async function ubAdminGetCartSessions(days = 30) {
  const since = new Date(Date.now() - days * 86400000).toISOString();
  const { data, error } = await ubSupabase.from('cart_sessions').select('*').gte('updated_at', since).order('updated_at', { ascending: false });
  if (error) { console.error('ubAdminGetCartSessions', error); return []; }
  return data.map(c => ({
    id: c.id, client: ubEscapeHtml(c.client_name || ''), rawName: c.client_name || '', phone: ubEscapeHtml(c.phone || ''), rawPhone: c.phone || '',
    zone: ubEscapeHtml(c.zone || ''), items: (c.items || []).map(i => ({ ...i, name: ubEscapeHtml(i.name || '') })), itemCount: c.item_count, value: c.cart_value,
    step: c.step, status: c.status, orderId: c.order_id, relanceCount: c.relance_count, lastRelanceAt: c.last_relance_at,
    createdAt: c.created_at, updatedAt: c.updated_at,
  }));
}
async function ubAdminUpdateCartSession(id, patch) {
  const { error } = await ubSupabase.from('cart_sessions').update(patch).eq('id', id);
  if (error) console.error('ubAdminUpdateCartSession', error);
  return !error;
}
async function ubAdminDeleteCartSession(id) {
  const { error } = await ubSupabase.from('cart_sessions').delete().eq('id', id);
  return !error;
}
/* Un panier est "abandonne" s'il n'a pas bouge depuis 45 min sans commande. */
function ubCartIsAbandoned(c) {
  return c.status !== 'converti' && c.status !== 'perdu' && (Date.now() - new Date(c.updatedAt).getTime()) > 45 * 60000;
}

/* ---------- Fiche cliente (notes & etiquettes) ---------- */
async function ubAdminGetCustomerNotes() {
  const { data, error } = await ubSupabase.from('customer_notes').select('*');
  if (error) { console.error('ubAdminGetCustomerNotes', error); return {}; }
  return Object.fromEntries(data.map(n => [n.phone_key, { note: n.note || '', tags: n.tags || [] }]));
}
async function ubAdminSaveCustomerNote(phoneKey, note, tags) {
  const { error } = await ubSupabase.from('customer_notes').upsert({ phone_key: phoneKey, note: note || null, tags: tags || [], updated_at: new Date().toISOString() });
  if (error) console.error('ubAdminSaveCustomerNote', error);
  return !error;
}

/* ---------- Entonnoir de conversion ---------- */
async function ubAdminGetFunnel(days = 30) {
  const { data, error } = await ubSupabase.rpc('ub_funnel_stats', { p_days: days });
  if (error) { console.error('ubAdminGetFunnel', error); return null; }
  return data;
}

/* ---------- Modeles de messages WhatsApp ----------
   Messages prets a l'emploi, pre-remplis avec le prenom, le numero de commande, les
   montants et un lien de suivi : un clic ouvre WhatsApp avec le texte, il n'y a plus
   qu'a appuyer sur Envoyer. */
function ubFirstName(name) { return String(name || '').trim().split(/\s+/)[0] || ''; }
function ubDecodeHtml(s) { const t = document.createElement('textarea'); t.innerHTML = s || ''; return t.value; }
function ubOrderWaTemplates(order) {
  const first = ubFirstName(ubDecodeHtml(order.client));
  const hi = `Bonjour ${first} 💜`;
  const total = order.orderTotal != null ? ubFormatPrice(order.orderTotal) : '';
  const remainder = order.orderTotal != null && order.depositAmount != null && order.payment && ubDecodeHtml(order.payment) === 'Paiement à la livraison'
    ? order.orderTotal - order.depositAmount : 0;
  const track = ubSiteUrl(`suivi.html?order=${encodeURIComponent(order.id)}&phone=${encodeURIComponent(ubDecodeHtml(order.phone))}`);
  return [
    { label: 'Commande reçue', text: `${hi}\nNous avons bien reçu votre commande ${order.id}${total ? ` (${total})` : ''}. Nous vérifions votre paiement Wave et revenons vers vous très vite.\nMerci pour votre confiance !` },
    { label: 'Paiement validé', text: `${hi}\nVotre paiement est validé ✅ Votre commande ${order.id} est en préparation.\nSuivez-la ici : ${track}` },
    { label: 'Paiement à vérifier', text: `${hi}\nNous n'arrivons pas à retrouver le paiement Wave de votre commande ${order.id}. Pouvez-vous nous renvoyer la capture de la transaction ? Merci !` },
    order.isPickup
      ? { label: 'Prête au retrait', text: `${hi}\nVotre commande ${order.id} est prête ! Vous pouvez la récupérer à : ${UB_CONTACT.pickupAddress}.${remainder > 0 ? `\nSolde à régler sur place : ${ubFormatPrice(remainder)}.` : ''}\nÀ quelle heure passez-vous ?` }
      : { label: 'En livraison', text: `${hi}\nVotre commande ${order.id} est en route 🚚${order.deliveryPerson ? ` avec ${order.deliveryPerson}` : ''}.${remainder > 0 ? `\nMerci de prévoir ${ubFormatPrice(remainder)} pour le solde.` : ''}\nSuivi : ${track}` },
    { label: 'Livrée + avis', text: `${hi}\nVotre commande ${order.id} a bien été livrée, merci ! 🙏\nVotre avis nous aide énormément : il suffit d'un clic sur « Laisser un avis » ici : ${track}` },
    { label: 'Annulation', text: `${hi}\nVotre commande ${order.id} a été annulée. N'hésitez pas à nous écrire si vous avez la moindre question.` },
  ];
}
function ubCartWaTemplates(cart, promo) {
  const first = ubFirstName(cart.rawName);
  const hi = `Bonjour${first ? ' ' + first : ''} 💜 C'est Urbann Beauty.`;
  const list = cart.items.slice(0, 5).map(i => `- ${ubDecodeHtml(i.name)}${i.qty > 1 ? ` x${i.qty}` : ''}`).join('\n');
  const link = ubSiteUrl('panier.html');
  const tpl = [
    { label: 'Relance douce', text: `${hi}\nVous avez laissé ces articles dans votre panier :\n${list}\nBesoin d'aide pour finaliser ? Je peux répondre à vos questions ou vous les mettre de côté.\n${link}` },
    { label: 'Aide au paiement', text: `${hi}\nJ'ai vu que vous étiez à l'étape du paiement. Pour info, vous pouvez régler seulement 20% d'acompte sur Wave et le reste à la livraison. Voulez-vous que je vous guide ?` },
    { label: 'Stock limité', text: `${hi}\nPetit message : il reste peu de pièces sur ${ubDecodeHtml(cart.items[0]?.name || 'votre sélection')}. Voulez-vous que je vous le réserve jusqu'à ce soir ?` },
  ];
  if (promo) tpl.push({ label: `Code -${promo.percent}%`, text: `${hi}\nPour finaliser votre panier, profitez de -${promo.percent}% avec le code ${promo.code} 🎁\n${list}\n${link}` });
  return tpl;
}
function ubClientWaTemplates(client, promo) {
  const first = ubFirstName(ubDecodeHtml(client.name));
  const hi = `Bonjour ${first} 💜`;
  const tpl = [
    { label: 'Remerciement', text: `${hi}\nMerci pour votre fidélité chez Urbann Beauty ! Si vous avez besoin d'un conseil beauté, je suis là.` },
    { label: 'Nouveautés', text: `${hi}\nDe nouvelles pépites viennent d'arriver chez Urbann Beauty ✨ Découvrez-les ici : ${ubSiteUrl('boutique.html')}` },
    { label: 'On vous a manqué ?', text: `${hi}\nCela fait un moment ! Votre routine a-t-elle besoin d'être complétée ? Voici nos best-sellers du moment : ${ubSiteUrl('boutique.html')}` },
    { label: 'Demande d\'avis', text: `${hi}\nComment trouvez-vous vos produits ? Votre avis nous aide beaucoup, vous pouvez le laisser ici avec votre numéro de commande : ${ubSiteUrl('suivi.html')}` },
  ];
  if (promo) tpl.push({ label: `Offre -${promo.percent}%`, text: `${hi}\nRien que pour vous : -${promo.percent}% avec le code ${promo.code} sur ${ubSiteUrl('boutique.html')} 🎁` });
  return tpl;
}

/* Fenetre de composition : choix du modele, texte modifiable, ouverture de WhatsApp. */
function ubOpenWaComposer({ title, phone, templates, onSent }) {
  let overlay = document.getElementById('a-wa-composer');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'a-modal-overlay';
    overlay.id = 'a-wa-composer';
    document.body.appendChild(overlay);
    overlay.addEventListener('click', e => { if (e.target === overlay) overlay.classList.remove('open'); });
  }
  overlay.innerHTML = `<div class="a-modal" style="max-width:560px">
    <div class="a-modal-head"><h3 style="display:flex;align-items:center;gap:8px"><span style="color:#25D366;display:inline-flex;width:20px">${ubIcon('whatsapp')}</span> ${title || 'Message WhatsApp'}</h3><button class="a-modal-close" type="button">${ubIcon('close')}</button></div>
    <div class="a-modal-body">
      <div style="font-size:.78rem;color:var(--a-ink-soft);margin-bottom:10px">Destinataire : <strong>${ubEscapeHtml(phone)}</strong> · choisissez un modèle puis ajustez si besoin</div>
      <div class="a-wa-chips">${templates.map((t, i) => `<button type="button" class="a-wa-chip ${i === 0 ? 'active' : ''}" data-i="${i}">${t.label}</button>`).join('')}</div>
      <textarea id="a-wa-text" rows="8" style="width:100%;margin-top:12px;border:1px solid var(--a-line);border-radius:12px;padding:12px;font:inherit;font-size:.84rem;resize:vertical">${ubEscapeHtml(templates[0]?.text || '')}</textarea>
    </div>
    <div class="a-modal-foot"><button class="a-btn a-btn-outline" type="button" data-close>Annuler</button><button class="a-btn" type="button" id="a-wa-send" style="background:#25D366;color:#fff">${ubIcon('whatsapp')} Ouvrir dans WhatsApp</button></div>
  </div>`;
  overlay.classList.add('open');
  const close = () => overlay.classList.remove('open');
  overlay.querySelector('.a-modal-close').onclick = close;
  overlay.querySelector('[data-close]').onclick = close;
  overlay.querySelectorAll('.a-wa-chip').forEach(b => b.addEventListener('click', () => {
    overlay.querySelectorAll('.a-wa-chip').forEach(x => x.classList.toggle('active', x === b));
    document.getElementById('a-wa-text').value = templates[+b.dataset.i].text;
  }));
  document.getElementById('a-wa-send').onclick = () => {
    const text = document.getElementById('a-wa-text').value;
    window.open(`https://wa.me/${ubPhoneToWhatsAppNumber(ubDecodeHtml(phone))}?text=${encodeURIComponent(text)}`, '_blank');
    close();
    if (onSent) onSent();
  };
}

/* ---------- Alertes (cloche + pastilles du menu) ---------- */
async function ubAdminRefreshAlerts() {
  const since = new Date(Date.now() - 7 * 86400000).toISOString();
  const [products, pendingRes, cartsRes] = await Promise.all([
    ubAdminGetProducts(),
    ubSupabase.from('orders').select('id, client_name, created_at', { count: 'exact' }).eq('status', 'en_attente').order('created_at', { ascending: false }).limit(5),
    ubSupabase.from('cart_sessions').select('id, client_name, cart_value, updated_at, status, phone').in('status', ['ouvert']).not('phone', 'is', null).gte('updated_at', since).order('updated_at', { ascending: false }),
  ]);
  const low = products.filter(p => p.stock <= 5).sort((a, b) => a.stock - b.stock);
  const pending = pendingRes.data || [];
  const pendingCount = pendingRes.count || 0;
  const carts = (cartsRes.data || []).filter(c => Date.now() - new Date(c.updated_at).getTime() > 45 * 60000);
  const setBadge = (key, n) => document.querySelectorAll(`[data-nav-badge="${key}"]`).forEach(el => { el.textContent = n; el.style.display = n ? '' : 'none'; });
  setBadge('orders', pendingCount);
  setBadge('carts', carts.length);
  const dot = document.getElementById('a-bell-dot'), list = document.getElementById('a-bell-list');
  if (!dot || !list) return;
  dot.style.display = (low.length || pendingCount || carts.length) ? 'block' : 'none';
  const section = (title, rows) => rows.length ? `<div style="font-size:.7rem;text-transform:uppercase;letter-spacing:.06em;color:var(--a-ink-soft);margin-top:6px">${title}</div>${rows.join('')}` : '';
  const row = (href, left, right, color) => `<a href="${href}" style="display:flex;justify-content:space-between;gap:10px;font-size:.8rem;color:var(--a-ink);text-decoration:none"><span>${left}</span><strong style="color:${color};white-space:nowrap">${right}</strong></a>`;
  const html = section(`Commandes en attente (${pendingCount})`, pending.map(o => row('commandes.html', ubEscapeHtml(o.client_name), o.id, 'var(--a-mauve)')))
    + section(`Paniers à relancer (${carts.length})`, carts.slice(0, 5).map(c => row('relances.html', ubEscapeHtml(c.client_name || c.phone), ubFormatPrice(c.cart_value), 'var(--a-warning)')))
    + section('Stock faible', low.slice(0, 6).map(p => row('produits.html', ubEscapeHtml(p.name), `${p.stock} en stock`, p.stock === 0 ? 'var(--a-danger)' : 'var(--a-warning)')));
  list.innerHTML = html || `<p style="font-size:.8rem;color:var(--a-ink-soft);margin:0">Rien à traiter pour le moment 🎉</p>`;
}
