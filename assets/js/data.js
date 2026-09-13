/* ============================================
   URBANN BEAUTY — Données de démonstration
   (mock data côté client, remplaçable par une API)
   ============================================ */

const UB_CATEGORIES = [
  { id: 'visage', name: 'Soins visage', icon: 'face' },
  { id: 'corps', name: 'Soins du corps', icon: 'body' },
  { id: 'maquillage', name: 'Maquillage', icon: 'makeup' },
  { id: 'cheveux', name: 'Cheveux', icon: 'hair' },
  { id: 'parfums', name: 'Parfums', icon: 'perfume' },
  { id: 'accessoires', name: 'Accessoires', icon: 'accessory' },
];

const UB_PRODUCTS = [
  {
    id: 'p1', name: 'Sérum Éclat Vitamine C', category: 'visage',
    price: 24000, oldPrice: 29000, rating: 4.8, reviews: 132, stock: 42,
    tag: 'Best-seller',
    img: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=800&auto=format&fit=crop',
    desc: "Un sérum concentré en vitamine C pure qui illumine le teint, atténue les taches et lisse le grain de peau dès 2 semaines d'utilisation."
  },
  {
    id: 'p2', name: 'Crème Hydratante Karité & Miel', category: 'corps',
    price: 15500, oldPrice: null, rating: 4.6, reviews: 88, stock: 65,
    tag: 'Nouveau',
    img: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=800&auto=format&fit=crop',
    desc: "Formule riche au beurre de karité brut et au miel, pour une peau nourrie 48h et un parfum doux et gourmand."
  },
  {
    id: 'p3', name: 'Palette Nude Essentielle', category: 'maquillage',
    price: 32000, oldPrice: 38000, rating: 4.9, reviews: 210, stock: 20,
    tag: 'Best-seller',
    img: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?q=80&w=800&auto=format&fit=crop',
    desc: "12 teintes nude ultra-pigmentées, texture soyeuse, pour un maquillage jour comme nuit."
  },
  {
    id: 'p4', name: 'Huile Capillaire Argan & Ricin', category: 'cheveux',
    price: 12000, oldPrice: null, rating: 4.7, reviews: 156, stock: 8,
    tag: 'Stock faible',
    img: 'https://images.unsplash.com/photo-1626015449444-9d9587782a70?q=80&w=800&auto=format&fit=crop',
    desc: "Répare les pointes fourchues, fortifie la fibre capillaire et apporte brillance et douceur."
  },
  {
    id: 'p5', name: 'Eau de Parfum Fleur de Nuit', category: 'parfums',
    price: 45000, oldPrice: null, rating: 4.9, reviews: 74, stock: 30,
    tag: 'Édition limitée',
    img: 'https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=800&auto=format&fit=crop',
    desc: "Un sillage floral et boisé, notes de jasmin, ambre et santal. Tenue longue durée."
  },
  {
    id: 'p6', name: 'Trousse de Pinceaux Pro (8 pcs)', category: 'accessoires',
    price: 18000, oldPrice: 22000, rating: 4.5, reviews: 61, stock: 50,
    tag: null,
    img: 'https://images.unsplash.com/photo-1583241800698-9c2660433e0f?q=80&w=800&auto=format&fit=crop',
    desc: "8 pinceaux essentiels aux poils doux, idéals pour un maquillage professionnel à la maison."
  },
  {
    id: 'p7', name: 'Masque Purifiant Argile Verte', category: 'visage',
    price: 13500, oldPrice: null, rating: 4.4, reviews: 47, stock: 38,
    tag: null,
    img: 'https://images.unsplash.com/photo-1570194065650-d99fb4bedf0a?q=80&w=800&auto=format&fit=crop',
    desc: "Purifie les pores, absorbe l'excès de sébum et resserre le grain de peau en 15 minutes."
  },
  {
    id: 'p8', name: 'Gommage Corps Sucre & Coco', category: 'corps',
    price: 11000, oldPrice: null, rating: 4.6, reviews: 39, stock: 44,
    tag: 'Nouveau',
    img: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?q=80&w=800&auto=format&fit=crop',
    desc: "Exfolie en douceur et laisse la peau incroyablement lisse grâce au sucre de canne et à l'huile de coco."
  },
  {
    id: 'p9', name: 'Rouge à Lèvres Velours Mat', category: 'maquillage',
    price: 9500, oldPrice: null, rating: 4.7, reviews: 98, stock: 70,
    tag: null,
    img: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?q=80&w=800&auto=format&fit=crop',
    desc: "Fini mat velouté, tenue 8h, formule enrichie en vitamine E pour des lèvres confortables."
  },
  {
    id: 'p10', name: 'Shampoing Doux Sans Sulfate', category: 'cheveux',
    price: 10500, oldPrice: null, rating: 4.5, reviews: 52, stock: 3,
    tag: 'Stock faible',
    img: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=800&auto=format&fit=crop',
    desc: "Nettoie en douceur sans agresser le cuir chevelu ni décolorer les cheveux colorés."
  },
  {
    id: 'p11', name: 'Coffret Découverte Parfums', category: 'parfums',
    price: 22000, oldPrice: 27000, rating: 4.8, reviews: 33, stock: 26,
    tag: 'Promo',
    img: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=800&auto=format&fit=crop',
    desc: "4 miniatures de nos meilleures fragrances pour découvrir votre signature olfactive."
  },
  {
    id: 'p12', name: 'Miroir Grossissant LED', category: 'accessoires',
    price: 16500, oldPrice: null, rating: 4.3, reviews: 21, stock: 15,
    tag: null,
    img: 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?q=80&w=800&auto=format&fit=crop',
    desc: "Éclairage LED réglable et grossissement x5 pour une application maquillage précise."
  },
];

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

function ubGetProduct(id) {
  return UB_PRODUCTS.find(p => p.id === id);
}

function ubGetCategory(id) {
  return UB_CATEGORIES.find(c => c.id === id);
}
