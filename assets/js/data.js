/* ============================================
   URBANN BEAUTY — Connexion Supabase & données
   ============================================ */

const UB_SUPABASE_URL = 'https://tbowuuxvjaadawhmpumr.supabase.co';
const UB_SUPABASE_KEY = 'sb_publishable_zuRyWQ_kmc-Vzg6umBBM8Q_bMo2uBwd';
const ubSupabase = window.supabase.createClient(UB_SUPABASE_URL, UB_SUPABASE_KEY);

const UB_TESTIMONIALS_FALLBACK = [
  { type: 'texte', name: 'Aïcha K.', role: 'Cliente vérifiée', text: "Le sérum vitamine C a changé ma peau en un mois. Livraison rapide et packaging soigné !", rating: 5, avatar: 'https://i.pravatar.cc/80?img=47' },
  { type: 'texte', name: 'Fatou D.', role: 'Cliente vérifiée', text: "Je recommande la palette nude à toutes mes copines, les couleurs sont sublimes et tiennent toute la journée.", rating: 5, avatar: 'https://i.pravatar.cc/80?img=32' },
  { type: 'texte', name: 'Nadège P.', role: 'Cliente vérifiée', text: "Service client à l'écoute, produits de qualité, exactement ce que je cherchais pour ma routine.", rating: 4, avatar: 'https://i.pravatar.cc/80?img=25' },
];

/* Avis clients : gérés depuis l'admin (texte ou capture d'écran de conversation) */
async function ubGetTestimonials() {
  const { data, error } = await ubSupabase.from('testimonials').select('*').eq('published', true).order('sort_order', { ascending: true });
  if (error || !data) { console.error('ubGetTestimonials', error); return UB_TESTIMONIALS_FALLBACK; }
  return data.map(t => ({
    id: t.id, type: t.type, name: t.name, role: t.role, text: t.text, rating: t.rating,
    avatar: t.avatar_url, screenshot: t.screenshot_url, productId: t.product_id,
  }));
}
/* Avis rattachés à un produit précis (fiche produit) ; si aucun avis n'est encore
   rattaché à ce produit, on retombe sur les avis génériques du site. */
async function ubGetProductTestimonials(productId) {
  const all = await ubGetTestimonials();
  const specific = all.filter(t => t.productId === productId);
  return specific.length ? specific : all;
}

/* ---------- Suivi de commande public (numéro de commande + téléphone) ---------- */
async function ubTrackOrder(orderId, phone) {
  const { data, error } = await ubSupabase.rpc('ub_track_order', { p_order_id: orderId, p_phone: phone });
  if (error) { console.error('ubTrackOrder', error); return null; }
  return (data && data[0]) || null;
}

/* ---------- Demande de retour publique ---------- */
async function ubRequestReturn({ orderId, phone, clientName, productId, qty, reason }) {
  const { error } = await ubSupabase.from('returns').insert({
    order_id: orderId, phone, client_name: clientName || null, product_id: productId || null,
    qty: qty || 1, reason: reason || null, status: 'demande',
  });
  return !error;
}

/* Zones de livraison : gérées depuis l'admin (nom + frais associés) */
const UB_DELIVERY_ZONES_FALLBACK = [{ id: null, name: 'Dakar et environs', fee: 2500 }];
async function ubGetDeliveryZones() {
  const { data, error } = await ubSupabase.from('delivery_zones').select('*').eq('active', true).order('sort_order', { ascending: true });
  if (error || !data || !data.length) { console.error('ubGetDeliveryZones', error); return UB_DELIVERY_ZONES_FALLBACK; }
  return data.map(z => ({ id: z.id, name: z.name, fee: z.fee }));
}

/* Messages de contact et inscriptions newsletter : enregistres reellement
   (auparavant les formulaires affichaient un succes sans rien sauvegarder). */
async function ubSubmitContactMessage({ name, email, subject, message }) {
  const { error } = await ubSupabase.from('contact_messages').insert({ name, email, subject: subject || null, message });
  return !error;
}
async function ubSubscribeNewsletter(email, source) {
  const { error } = await ubSupabase.from('newsletter_subscribers').insert({ email, source: source || null });
  if (error && error.code === '23505') return true; // deja inscrit : pas une erreur
  return !error;
}

const UB_CONTACT = {
  phoneDisplay: '+221 78 305 36 57',
  whatsapp: '221783053657',
  city: 'Dakar, Sénégal',
};

function ubFormatPrice(v) {
  return new Intl.NumberFormat('fr-FR').format(v) + ' FCFA';
}

/* Normalise pour une recherche insensible aux accents/majuscules (ex: "serum" trouve "Sérum") */
function ubNormalize(s) {
  return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
}
/* Echappement HTML : indispensable pour tout texte saisi par un client (nom, telephone,
   adresse, mode de paiement...) avant de l'inserer via innerHTML dans l'admin -- ces
   champs sont ecrits par n'importe quel visiteur via le checkout public. */
function ubEscapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function ubProductMatchesSearch(p, search, categoryName) {
  const q = ubNormalize(search);
  if (!q) return true;
  return ubNormalize(p.name).includes(q)
    || ubNormalize(p.desc).includes(q)
    || ubNormalize(categoryName).includes(q)
    || ubNormalize(p.tag).includes(q);
}

/* ---------- Catégories ---------- */
function ubMapCategory(c) {
  return { id: c.id, name: c.name, icon: c.icon, image: c.image_url || '' };
}
async function ubGetAllCategories() {
  const { data, error } = await ubSupabase.from('categories').select('*').order('sort_order');
  if (error) { console.error('ubGetAllCategories', error); return []; }
  return data.map(ubMapCategory);
}
async function ubGetCategory(id) {
  const { data, error } = await ubSupabase.from('categories').select('*').eq('id', id).maybeSingle();
  if (error || !data) return null;
  return ubMapCategory(data);
}

/* ---------- Produits ---------- */
function ubMapProduct(p) {
  return {
    id: p.id, name: p.name, category: p.category_id, gender: p.gender || 'mixte', price: p.price, oldPrice: p.old_price,
    stock: p.stock, rating: Number(p.rating), reviews: p.reviews, tag: p.tag,
    desc: p.description, img: p.image_url, video: p.video_url,
  };
}
/* products_storefront est une vue sans la colonne cost_price (prix d'achat) : le prix
   d'achat est une donnee commerciale sensible qui ne doit jamais transiter vers le site
   public, meme dans une reponse API que personne ne regarde jamais. L'admin lit la table
   products directement (ubAdminGetProducts) car elle a besoin du cout pour les marges. */
async function ubGetAllProducts() {
  const { data, error } = await ubSupabase.from('products_storefront').select('*').order('created_at');
  if (error) { console.error('ubGetAllProducts', error); return []; }
  return data.map(ubMapProduct);
}
async function ubGetProduct(id) {
  const { data, error } = await ubSupabase.from('products_storefront').select('*').eq('id', id).maybeSingle();
  if (error || !data) return null;
  return ubMapProduct(data);
}

/* ---------- Box cadeau (compositions a prix fixe definies par l'admin) ---------- */
async function ubGetGiftBoxTemplates() {
  const { data, error } = await ubSupabase.from('gift_box_templates').select('*').eq('active', true).order('sort_order', { ascending: true });
  if (error) { console.error('ubGetGiftBoxTemplates', error); return []; }
  return data.map(t => ({ id: t.id, name: t.name, gender: t.gender, price: t.price, slotCount: t.slot_count, eligibleIds: t.eligible_product_ids || [] }));
}
/* Repartit un prix fixe entre n articles en FCFA entiers, sans perte d'arrondi
   (la somme des parts vaut toujours exactement le prix total). */
function ubSplitFixedPrice(total, n) {
  if (n <= 0) return [];
  const base = Math.floor(total / n);
  const remainder = total - base * n;
  return Array.from({ length: n }, (_, i) => base + (i < remainder ? 1 : 0));
}

function ubCatsById(categories) {
  return Object.fromEntries(categories.map(c => [c.id, c]));
}

/* ---------- Commande (checkout) ----------
   Passe par la fonction Postgres ub_place_order (SECURITY DEFINER) qui verifie et
   reserve le stock puis cree la commande de facon atomique : soit tout reussit,
   soit rien n'est enregistre (voir migration add_indexes_and_atomic_order_placement).
   Ne jamais recalculer/decrementer le stock depuis le frontend. */
async function ubPlaceOrder({ clientName, phone, address, paymentMethod, items }) {
  const { data, error } = await ubSupabase.rpc('ub_place_order', {
    p_client_name: clientName,
    p_phone: phone,
    p_address: address || null,
    p_payment_method: paymentMethod,
    p_items: items.map(l => ({
      product_id: l.id, qty: l.qty,
      ...(l.boxInstanceId ? { box_instance_id: l.boxInstanceId, box_template_id: l.boxTemplateId } : {}),
    })),
  });
  if (error) {
    const code = (error.message || '').match(/PRODUIT_INDISPONIBLE:\s*(\S+)/);
    if (code) return { error: 'PRODUIT_INDISPONIBLE', productId: code[1] };
    if (/PANIER_VIDE/.test(error.message)) return { error: 'PANIER_VIDE' };
    if (/NOM_CLIENT_REQUIS/.test(error.message)) return { error: 'NOM_CLIENT_REQUIS' };
    if (/TELEPHONE_REQUIS/.test(error.message)) return { error: 'TELEPHONE_REQUIS' };
    if (/BOX_/.test(error.message)) return { error: 'BOX_INVALIDE' };
    console.error('ubPlaceOrder', error);
    return { error: 'INCONNU' };
  }
  return { orderId: data };
}
