/* ============================================
   URBANN BEAUTY — Connexion Supabase & données
   ============================================ */

const UB_SUPABASE_URL = 'https://tbowuuxvjaadawhmpumr.supabase.co';
const UB_SUPABASE_KEY = 'sb_publishable_zuRyWQ_kmc-Vzg6umBBM8Q_bMo2uBwd';
const ubSupabase = window.supabase.createClient(UB_SUPABASE_URL, UB_SUPABASE_KEY);

const UB_TESTIMONIALS = [
  { name: 'Aïcha K.', role: 'Cliente vérifiée', text: "Le sérum vitamine C a changé ma peau en un mois. Livraison rapide et packaging soigné !", rating: 5, avatar: 'https://i.pravatar.cc/80?img=47' },
  { name: 'Fatou D.', role: 'Cliente vérifiée', text: "Je recommande la palette nude à toutes mes copines, les couleurs sont sublimes et tiennent toute la journée.", rating: 5, avatar: 'https://i.pravatar.cc/80?img=32' },
  { name: 'Nadège P.', role: 'Cliente vérifiée', text: "Service client à l'écoute, produits de qualité, exactement ce que je cherchais pour ma routine.", rating: 4, avatar: 'https://i.pravatar.cc/80?img=25' },
];

const UB_CONTACT = {
  phoneDisplay: '+221 78 305 36 57',
  whatsapp: '221783053657',
  city: 'Dakar, Sénégal',
};

function ubFormatPrice(v) {
  return new Intl.NumberFormat('fr-FR').format(v) + ' FCFA';
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
    id: p.id, name: p.name, category: p.category_id, price: p.price, oldPrice: p.old_price,
    stock: p.stock, rating: Number(p.rating), reviews: p.reviews, tag: p.tag,
    desc: p.description, img: p.image_url, video: p.video_url,
  };
}
async function ubGetAllProducts() {
  const { data, error } = await ubSupabase.from('products').select('*').order('created_at');
  if (error) { console.error('ubGetAllProducts', error); return []; }
  return data.map(ubMapProduct);
}
async function ubGetProduct(id) {
  const { data, error } = await ubSupabase.from('products').select('*').eq('id', id).maybeSingle();
  if (error || !data) return null;
  return ubMapProduct(data);
}

function ubCatsById(categories) {
  return Object.fromEntries(categories.map(c => [c.id, c]));
}
