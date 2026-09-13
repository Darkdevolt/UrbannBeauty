/* URBANN BEAUTY — Gestion centralisée des médias (front-end demo)
   Les uploads sont conservés dans localStorage dans cette version statique.
   L'interface est pensée pour pouvoir être reliée plus tard à un Storage/API.
*/
const UB_MEDIA_KEY = 'ub_home_media';

const UB_DEFAULT_MEDIA = {
  heroMain: '/assets/img/hero-main.webp.png',
  heroProduct: '/assets/img/hero-product.webp.png',
  welcomeOffer: '/assets/img/welcome-offer.webp.png',
  editorialRoutine: 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?q=80&w=900&auto=format&fit=crop',
  brandsEditorial: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?q=80&w=1200&auto=format&fit=crop',
  commitmentBeauty: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=1000&auto=format&fit=crop'
};

function ubGetMediaConfig() {
  try { return { ...UB_DEFAULT_MEDIA, ...(JSON.parse(localStorage.getItem(UB_MEDIA_KEY) || '{}')) }; }
  catch (e) { return { ...UB_DEFAULT_MEDIA }; }
}
function ubSaveMediaConfig(config) {
  localStorage.setItem(UB_MEDIA_KEY, JSON.stringify({ ...UB_DEFAULT_MEDIA, ...config }));
}
function ubSetMedia(key, url) {
  const config = ubGetMediaConfig();
  config[key] = url;
  ubSaveMediaConfig(config);
  return config;
}
function ubGetCategoryImage(category) {
  if (category && category.image) return category.image;
  const defaults = {
    visage: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?q=80&w=500&auto=format&fit=crop',
    maquillage: '/assets/img/cat-maquillage.webp.png',
    parfums: '/assets/img/cat-parfums.webp.png',
    corps: '/assets/img/cat-corps.webp.png',
    cheveux: 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?q=80&w=500&auto=format&fit=crop',
    accessoires: '/assets/img/cat-accessoires.webp.png'
  };
  return defaults[category?.id] || defaults.visage;
}

function ubReadImageFile(file, callback) {
  if (!file || !file.type.startsWith('image/')) return;
  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.onload = () => {
      const max = 1200;
      const ratio = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(img.naturalWidth * ratio));
      canvas.height = Math.max(1, Math.round(img.naturalHeight * ratio));
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      callback(canvas.toDataURL('image/webp', 0.72));
    };
    img.src = reader.result;
  };
  reader.readAsDataURL(file);
}

function ubApplyManagedMedia() {
  const cfg = ubGetMediaConfig();
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
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ubApplyManagedMedia);
else ubApplyManagedMedia();
