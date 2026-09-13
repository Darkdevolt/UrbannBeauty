/* URBANN BEAUTY — Gestion centralisée des médias (front-end demo)
   Les uploads sont conservés dans localStorage dans cette version statique.
   L'interface est pensée pour pouvoir être reliée plus tard à un Storage/API.
*/
const UB_MEDIA_KEY = 'ub_home_media';

const UB_DEFAULT_MEDIA = {
  heroMain: 'assets/img/hero-main.webp.png',
  heroProduct: 'assets/img/hero-product.webp.png',
  welcomeOffer: 'assets/img/welcome-offer.webp.png',
  editorialRoutine: 'assets/img/editorial-routine.webp.png',
  brandsEditorial: 'assets/img/brands-editorial.webp.png',
  commitmentBeauty: 'assets/img/commitment-beauty.webp.png'
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
    visage: 'assets/img/cat-visage.webp.png',
    maquillage: 'assets/img/cat-maquillage.webp.png',
    parfums: 'assets/img/cat-parfums.webp.png',
    corps: 'assets/img/cat-corps.webp.png',
    cheveux: 'assets/img/cat-cheveux.webp.png',
    accessoires: 'assets/img/cat-accessoires.webp.png'
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
