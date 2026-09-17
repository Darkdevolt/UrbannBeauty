/* ============================================
   URBANN BEAUTY — Boule guide dorée (assistant de navigation)
   S'injecte seule (CSS + markup), comme le bouton WhatsApp de main.js.
   Aucune IA/back-end : recherche par mots-clés dans le plan du site,
   puis navigation directe vers la page/section correspondante.
   ============================================ */

const UB_GUIDE_SITEMAP = [
  { title: 'Boutique', desc: 'Voir tous les produits', href: 'boutique.html',
    keywords: ['boutique', 'produits', 'acheter', 'shop', 'catalogue', 'shopping'] },
  { title: 'Soins visage', desc: 'Catégorie visage de la boutique', href: 'boutique.html?cat=visage',
    keywords: ['visage', 'soin visage', 'peau'] },
  { title: 'Soins du corps', desc: 'Catégorie corps de la boutique', href: 'boutique.html?cat=corps',
    keywords: ['corps', 'soin corps', 'gommage', 'huile'] },
  { title: 'Maquillage', desc: 'Catégorie maquillage de la boutique', href: 'boutique.html?cat=maquillage',
    keywords: ['maquillage', 'makeup', 'rouge a levres', 'fond de teint'] },
  { title: 'Parfums', desc: 'Catégorie parfums de la boutique', href: 'boutique.html?cat=parfums',
    keywords: ['parfum', 'parfums', 'fragrance', 'eau de toilette'] },
  { title: 'Catégories', desc: 'Explorer toutes les catégories', href: 'categories.html',
    keywords: ['categories', 'categorie', 'rayons'] },
  { title: 'Trouver ma teinte', desc: 'Diagnostic pour choisir sa teinte de fond de teint', href: 'diagnostic-teint.html',
    keywords: ['teinte', 'diagnostic', 'fond de teint', 'quelle couleur', 'quelle teinte', 'carnation'] },
  { title: 'Box Cadeau', desc: 'Composer une box cadeau personnalisée', href: 'box-cadeau.html',
    keywords: ['box', 'box cadeau', 'coffret', 'cadeau', 'offrir'] },
  { title: 'Mon panier', desc: 'Voir mon panier et passer commande', href: 'panier.html',
    keywords: ['panier', 'passer commande', 'valider ma commande', 'payer', 'paiement', 'checkout'] },
  { title: 'Suivre ma commande', desc: 'Suivre l\'état de ma commande', href: 'suivi.html',
    keywords: ['suivi', 'suivre ma commande', 'suivre commande', 'ou est ma commande', 'statut commande', 'tracking'] },
  { title: 'Demander un retour', desc: 'Retourner ou échanger un produit', href: 'retour.html',
    keywords: ['retour', 'retourner', 'echange', 'echanger', 'rembourser', 'remboursement'] },
  { title: 'Livraison', desc: 'Zones, délais et frais de livraison', href: 'infos.html#livraison',
    keywords: ['livraison', 'delai', 'frais de port', 'expedition', 'zone de livraison'] },
  { title: 'FAQ', desc: 'Questions fréquentes', href: 'infos.html#faq',
    keywords: ['faq', 'question', 'aide', 'renseignement'] },
  { title: 'Contact', desc: 'Nous écrire ou nous appeler', href: 'contact.html',
    keywords: ['contact', 'contacter', 'joindre', 'telephone', 'email', 'ecrire'] },
  { title: 'À propos', desc: 'Découvrir Urbann Beauty', href: 'a-propos.html',
    keywords: ['a propos', 'qui sommes nous', 'histoire', 'marque'] },
  { title: 'Confidentialité', desc: 'Politique de confidentialité', href: 'confidentialite.html',
    keywords: ['confidentialite', 'donnees personnelles', 'vie privee', 'rgpd'] },
  { title: 'Accueil', desc: 'Retour à la page d\'accueil', href: 'index.html',
    keywords: ['accueil', 'home', 'debut'] },
];

const UB_GUIDE_CHIPS = ['Boutique', 'Trouver ma teinte', 'Box Cadeau', 'Livraison', 'Suivre ma commande', 'Contact'];

/* Rouge à lèvres stylisé : tube + épaulement + galbe arrondi */
const UB_GUIDE_LIPSTICK_ICON = '<rect x="8" y="13" width="8" height="8" rx="1.2"/><path d="M8 13L9 6M16 13L15 6"/><path d="M9 6a3 3.5 0 0 1 6 0"/>';

function ubGuideNormalize(str) {
  return (str || '')
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .trim();
}

const UB_GUIDE_STOPWORDS = new Set(['comment', 'pour', 'avec', 'dans', 'chez', 'sur', 'les', 'des', 'une', 'un', 'le', 'la', 'de', 'du', 'et', 'ou', 'est', 'ma', 'mon', 'ta', 'ton', 'sa', 'son', 'je', 'tu', 'il', 'elle', 'peut', 'veux', 'voudrais', 'aller']);

function ubGuideEscapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function ubGuideSearch(query) {
  const q = ubGuideNormalize(query);
  if (!q) return [];
  const rawTerms = q.split(/\s+/).filter(Boolean);
  const terms = rawTerms.filter(t => t.length >= 3 && !UB_GUIDE_STOPWORDS.has(t));
  const searchTerms = terms.length ? terms : rawTerms;

  const scored = UB_GUIDE_SITEMAP.map(entry => {
    const titleN = ubGuideNormalize(entry.title);
    const descN = ubGuideNormalize(entry.desc);
    const kwsN = entry.keywords.map(ubGuideNormalize);
    let score = 0;

    kwsN.forEach(nk => {
      if (nk === q) score += 25;
      else if (nk.length >= 4 && q.includes(nk)) score += 12;
      else if (q.length >= 4 && nk.includes(q)) score += 8;
    });

    searchTerms.forEach(t => {
      const re = new RegExp('\\b' + ubGuideEscapeRegExp(t) + '\\b');
      if (re.test(titleN)) score += 6;
      else if (re.test(descN)) score += 3;
      if (kwsN.some(nk => re.test(nk))) score += 3;
    });

    return { entry, score };
  }).filter(r => r.score > 0);
  scored.sort((a, b) => b.score - a.score);
  return scored.map(r => r.entry);
}

function ubGuideIconFor(title) {
  const t = title.toLowerCase();
  if (t.includes('panier') || t.includes('commande') && !t.includes('suivre')) return 'bag';
  if (t.includes('suivre')) return 'truck';
  if (t.includes('retour')) return 'undo';
  if (t.includes('livraison')) return 'truck';
  if (t.includes('contact')) return 'mail';
  if (t.includes('teinte')) return 'drop';
  if (t.includes('box')) return 'gift';
  return 'compass';
}

const UB_GUIDE_MINI_ICONS = {
  bag: '<path d="M6 7h12l1 13H5L6 7z" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M9 7a3 3 0 016 0" fill="none" stroke="currentColor" stroke-width="1.6"/>',
  truck: '<path d="M2 7h11v9H2z" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M13 10h4l3 3v3h-7v-6z" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="6" cy="18" r="1.6" fill="currentColor"/><circle cx="17" cy="18" r="1.6" fill="currentColor"/>',
  undo: '<path d="M4 10h9a5 5 0 010 10h-3" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><path d="M8 6l-4 4 4 4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M4 6l8 7 8-7" fill="none" stroke="currentColor" stroke-width="1.6"/>',
  drop: '<path d="M12 3s6 7 6 11a6 6 0 01-12 0c0-4 6-11 6-11z" fill="none" stroke="currentColor" stroke-width="1.6"/>',
  gift: '<rect x="4" y="9" width="16" height="11" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M2 9h20v3H2z" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M12 9v11M12 9c-2-3-6-3-6-1s3 1 6 1zm0 0c2-3 6-3 6-1s-3 1-6 1z" fill="none" stroke="currentColor" stroke-width="1.4"/>',
  compass: '<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M15 9l-2 6-4 1 2-6z" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/>',
};

function ubGuideResultHTML(entry) {
  const ico = ubGuideIconFor(entry.title);
  return `
  <button type="button" class="ub-guide-result" data-href="${entry.href}">
    <span class="ub-guide-result-ico"><svg viewBox="0 0 24 24">${UB_GUIDE_MINI_ICONS[ico]}</svg></span>
    <span><strong>${entry.title}</strong><span>${entry.desc}</span></span>
  </button>`;
}

function ubGuideGo(href, panelBody) {
  if (panelBody) {
    panelBody.innerHTML = `<div class="ub-guide-status"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v4M12 18v4M4.9 4.9l2.8 2.8M16.3 16.3l2.8 2.8M2 12h4M18 12h4M4.9 19.1l2.8-2.8M16.3 7.7l2.8-2.8"/></svg> Je vous y emmène…</div>`;
  }
  setTimeout(() => { window.location.href = href; }, 450);
}

function ubGuideRenderBody(panelBody, list) {
  if (!list.length) {
    panelBody.querySelector('.ub-guide-results-zone').innerHTML = '<p class="ub-guide-empty">Aucun résultat. Essayez « livraison », « teinte », « panier »…</p>';
    return;
  }
  panelBody.querySelector('.ub-guide-results-zone').innerHTML = `<div class="ub-guide-results">${list.slice(0, 5).map(ubGuideResultHTML).join('')}</div>`;
}

function ubInitGuide() {
  if (document.getElementById('ub-guide-root')) return;

  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'assets/css/ub-guide.css';
  document.head.appendChild(link);

  const root = document.createElement('div');
  root.id = 'ub-guide-root';
  root.innerHTML = `
    <div class="ub-guide-panel" id="ub-guide-panel">
      <div class="ub-guide-panel-head">
        <span class="ub-guide-mini-orb"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${UB_GUIDE_LIPSTICK_ICON}</svg></span>
        <div><strong>Votre guide</strong><span>Dites-moi où vous voulez aller</span></div>
        <button type="button" class="ub-guide-panel-close" id="ub-guide-close" aria-label="Fermer">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 6l12 12M18 6L6 18"/></svg>
        </button>
      </div>
      <div class="ub-guide-panel-body">
        <form class="ub-guide-search" id="ub-guide-form">
          <input type="text" id="ub-guide-input" placeholder="Ex : où trouver ma teinte ?" autocomplete="off">
          <button type="submit" aria-label="Chercher">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
          </button>
        </form>
        <p class="ub-guide-label">Raccourcis</p>
        <div class="ub-guide-chips">${UB_GUIDE_CHIPS.map(c => `<button type="button" class="ub-guide-chip" data-q="${c}">${c}</button>`).join('')}</div>
        <div class="ub-guide-results-zone"></div>
      </div>
    </div>
    <button type="button" class="ub-guide-orb" id="ub-guide-orb" aria-label="Ouvrir le guide de navigation" aria-expanded="false">
      <span class="ub-lip-glow"></span>
      <span class="ub-lip-case"></span>
      <span class="ub-lip-band"></span>
      <span class="ub-lip-bullet"></span>
    </button>
  `;
  document.body.appendChild(root);

  const orb = document.getElementById('ub-guide-orb');
  const panel = document.getElementById('ub-guide-panel');
  const panelBody = panel.querySelector('.ub-guide-panel-body');
  const closeBtn = document.getElementById('ub-guide-close');
  const form = document.getElementById('ub-guide-form');
  const input = document.getElementById('ub-guide-input');

  const openPanel = () => {
    panel.classList.add('open');
    orb.setAttribute('aria-expanded', 'true');
    const hint = document.querySelector('.ub-guide-hint');
    if (hint) hint.remove();
    setTimeout(() => input.focus(), 150);
  };
  const closePanel = () => {
    panel.classList.remove('open');
    orb.setAttribute('aria-expanded', 'false');
  };

  orb.addEventListener('click', () => panel.classList.contains('open') ? closePanel() : openPanel());
  closeBtn.addEventListener('click', closePanel);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closePanel(); });
  document.addEventListener('click', (e) => {
    if (!root.contains(e.target)) closePanel();
  });

  const runSearch = (query, autoNavigate) => {
    const results = ubGuideSearch(query);
    if (autoNavigate && results.length && ubGuideNormalize(query).length > 2) {
      ubGuideGo(results[0].href, panelBody);
      return;
    }
    ubGuideRenderBody(panelBody, results);
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    runSearch(input.value, true);
  });
  input.addEventListener('input', () => runSearch(input.value, false));

  root.querySelectorAll('.ub-guide-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      input.value = chip.dataset.q;
      runSearch(chip.dataset.q, true);
    });
  });

  panelBody.addEventListener('click', (e) => {
    const btn = e.target.closest('.ub-guide-result');
    if (btn) ubGuideGo(btn.dataset.href, panelBody);
  });

  /* Bulle d'accroche affichée une fois par session */
  if (!sessionStorage.getItem('ub_guide_hint_seen')) {
    const hint = document.createElement('div');
    hint.className = 'ub-guide-hint';
    hint.textContent = 'Besoin d\'aide pour naviguer ?';
    root.appendChild(hint);
    sessionStorage.setItem('ub_guide_hint_seen', '1');
    setTimeout(() => hint.remove(), 5000);
  }
}

document.addEventListener('DOMContentLoaded', ubInitGuide);
