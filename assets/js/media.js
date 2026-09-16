/* URBANN BEAUTY — Médias (Supabase Storage + table media_config) */

const UB_MEDIA_DEFAULTS = {
  editorialRoutine: 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?q=80&w=900&auto=format&fit=crop',
  brandsEditorial: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?q=80&w=1200&auto=format&fit=crop',
  commitmentBeauty: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=1000&auto=format&fit=crop',
};

async function ubGetMediaConfig() {
  const { data, error } = await ubSupabase.from('media_config').select('*');
  if (error) { console.error('ubGetMediaConfig', error); return { ...UB_MEDIA_DEFAULTS }; }
  const cfg = { ...UB_MEDIA_DEFAULTS };
  data.forEach(row => { cfg[row.key] = row.url; });
  return cfg;
}
async function ubSetMedia(key, url) {
  const { error } = await ubSupabase.from('media_config').upsert({ key, url, updated_at: new Date().toISOString() });
  if (error) console.error('ubSetMedia', error);
  return !error;
}

const UB_CATEGORY_IMAGE_FALLBACKS = {
  visage: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?q=80&w=500&auto=format&fit=crop',
  maquillage: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?q=80&w=500&auto=format&fit=crop',
  parfums: 'https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=500&auto=format&fit=crop',
  corps: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=500&auto=format&fit=crop',
  cheveux: 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?q=80&w=500&auto=format&fit=crop',
  accessoires: 'https://images.unsplash.com/photo-1583241800698-9c2660433e0f?q=80&w=500&auto=format&fit=crop',
};
function ubGetCategoryImage(category) {
  if (category && category.image) return category.image;
  return UB_CATEGORY_IMAGE_FALLBACKS[category?.id] || UB_CATEGORY_IMAGE_FALLBACKS.visage;
}

/* Upload direct vers Supabase Storage (bucket "media", public en lecture) */
async function ubUploadImage(file, folder) {
  if (!file || !file.type.startsWith('image/')) return null;
  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
  const path = `${folder}/${Date.now()}-${Math.round(Math.random() * 1e6)}.${ext}`;
  const { error } = await ubSupabase.storage.from('media').upload(path, file, { upsert: true, contentType: file.type });
  if (error) { console.error('ubUploadImage', error); return null; }
  const { data } = ubSupabase.storage.from('media').getPublicUrl(path);
  return data.publicUrl;
}
/* Upload d'une photo envoyee par une cliente au checkout (ex: photo de teint pour un
   fond de teint) vers un bucket prive distinct de "media" : n'importe quelle
   visiteuse peut deposer une photo, mais seul un admin connecte peut la consulter
   (voir policies storage.objects "client upload own photo" / "admin read client
   photos"). On retourne le CHEMIN dans le bucket, pas une URL publique : le bucket
   n'etant pas public, l'affichage cote admin passe par une URL signee temporaire
   (voir ubAdminGetClientPhotoUrl dans admin.js). */
async function ubUploadClientPhoto(file) {
  if (!file || !file.type.startsWith('image/')) return null;
  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
  const path = `notes/${Date.now()}-${Math.round(Math.random() * 1e6)}.${ext}`;
  const { error } = await ubSupabase.storage.from('client-uploads').upload(path, file, { contentType: file.type });
  if (error) { console.error('ubUploadClientPhoto', error); return null; }
  return path;
}
/* Capture d'ecran de la transaction Wave envoyee au checkout, preuve de paiement
   obligatoire (voir ub_place_order). Meme bucket prive que ubUploadClientPhoto,
   mais dossier "payment-proofs/" distinct de "notes/" : la purge automatique a
   7 jours ne cible que "notes/", les preuves de paiement sont conservees. */
async function ubUploadPaymentProof(file) {
  if (!file || !file.type.startsWith('image/')) return null;
  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
  const path = `payment-proofs/${Date.now()}-${Math.round(Math.random() * 1e6)}.${ext}`;
  const { error } = await ubSupabase.storage.from('client-uploads').upload(path, file, { contentType: file.type });
  if (error) { console.error('ubUploadPaymentProof', error); return null; }
  return path;
}
async function ubUploadVideo(file, folder) {
  if (!file || !file.type.startsWith('video/')) return null;
  const ext = (file.name.split('.').pop() || 'mp4').toLowerCase();
  const path = `${folder}/${Date.now()}-${Math.round(Math.random() * 1e6)}.${ext}`;
  const { error } = await ubSupabase.storage.from('media').upload(path, file, { upsert: true, contentType: file.type });
  if (error) { console.error('ubUploadVideo', error); return null; }
  const { data } = ubSupabase.storage.from('media').getPublicUrl(path);
  return data.publicUrl;
}

async function ubApplyManagedMedia() {
  const cfg = await ubGetMediaConfig();
  const setSrc = (id, src) => { const el = document.getElementById(id); if (el && src) el.src = src; };
  setSrc('hero-main-image', cfg.heroMain);
  setSrc('hero-product-image', cfg.heroProduct);
  setSrc('editorial-routine-image', cfg.editorialRoutine);
  const offer = document.getElementById('welcome-offer');
  if (offer && cfg.welcomeOffer) offer.style.backgroundImage = `linear-gradient(90deg, rgba(39,24,42,.18), rgba(39,24,42,.42)), url("${cfg.welcomeOffer}")`;
  const brands = document.querySelector('.ub-brands');
  if (brands && cfg.brandsEditorial) brands.style.backgroundImage = `linear-gradient(90deg, rgba(255,250,247,.94), rgba(255,250,247,.55)), url("${cfg.brandsEditorial}")`;
  const commitments = document.querySelector('.ub-commitments');
  if (commitments && cfg.commitmentBeauty) commitments.style.backgroundImage = `linear-gradient(180deg, rgba(255,250,247,.94), rgba(255,250,247,.72)), url("${cfg.commitmentBeauty}")`;
  return cfg;
}
