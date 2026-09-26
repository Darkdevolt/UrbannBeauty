/* ============================================
   URBANN BEAUTY — Comportements du site public
   ============================================ */

/* ---------- Panier (localStorage) ---------- */
const UB_CART_KEY = 'ub_cart';

function ubGetCart() {
  try { return JSON.parse(localStorage.getItem(UB_CART_KEY)) || []; }
  catch (e) { return []; }
}
function ubSaveCart(cart) {
  localStorage.setItem(UB_CART_KEY, JSON.stringify(cart));
  ubUpdateCartCount();
  /* Previent la page courante (panier, mini-panier...) que le contenu a change. */
  window.dispatchEvent(new CustomEvent('ub:cart'));
}
/* Ajout au panier : ouvre le mini-panier lateral (sauf sur la page panier elle-meme,
   ou avec opts.silent) pour garder la cliente dans son elan d'achat -- la simple
   notification "ajoute" laissait le panier invisible jusqu'a la page panier. */
function ubAddToCart(id, qty = 1, opts = {}) {
  const cart = ubGetCart();
  const shade = opts.shade || null;
  const line = cart.find(l => l.id === id && !l.boxInstanceId && (l.shade || null) === shade);
  if (line) line.qty += qty;
  else cart.push(shade ? { id, qty, shade } : { id, qty });
  ubSaveCart(cart);
  ubTrack('add_to_cart', { productId: id, value: qty });
  ubBumpCartIcon();
  if (opts.silent || ubIsCartPage()) { ubShowToast(shade ? `Ajouté au panier · teinte ${shade}` : 'Produit ajouté au panier'); return; }
  ubOpenCartDrawer(ubLineKey({ id, shade }));
}
/* Une ligne de panier = un produit + une teinte eventuelle (le meme fond de teint en
   deux teintes fait deux lignes). La cle est sure dans un attribut onclick. */
function ubLineKey(l) {
  return (encodeURIComponent(l.id) + '~' + encodeURIComponent(l.shade || '')).replace(/'/g, '%27');
}
function ubLineMatches(l, key) {
  if (l.boxInstanceId) return false;
  if (!String(key).includes('~')) return l.id === key && !l.shade;
  return ubLineKey(l) === key;
}
/* Ajoute une box cadeau au panier : chaque produit choisi devient sa propre ligne
   (qty 1, jamais fusionnee) rattachee a boxInstanceId/boxTemplateId. Le prix reel de
   ces lignes est toujours recalcule cote serveur a partir du template au moment de la
   commande (voir ub_place_order) -- rien ici n'est source de verite sur le prix. */
function ubAddBoxToCart(templateId, templateName, productIds) {
  const cart = ubGetCart();
  const boxInstanceId = 'box-' + Date.now() + '-' + Math.round(Math.random() * 1e6);
  productIds.forEach(id => cart.push({ id, qty: 1, boxInstanceId, boxTemplateId: templateId, boxLabel: templateName }));
  ubSaveCart(cart);
}
function ubRemoveFromCart(key) {
  ubSaveCart(ubGetCart().filter(l => !ubLineMatches(l, key)));
}
function ubRemoveBoxFromCart(boxInstanceId) {
  ubSaveCart(ubGetCart().filter(l => l.boxInstanceId !== boxInstanceId));
}
function ubSetQty(key, qty) {
  const cart = ubGetCart();
  const line = cart.find(l => ubLineMatches(l, key));
  if (line) { line.qty = Math.max(1, qty); ubSaveCart(cart); }
}
/* Attache l'info demandee par un produit (texte et/ou photo, voir product.requiresClientNote
   et product.requiresPhoto) a sa ligne de panier : elle voyagera avec la commande jusqu'a
   l'admin au checkout. */
function ubSetCartLineNote(key, note, photoPath) {
  const cart = ubGetCart();
  const line = cart.find(l => ubLineMatches(l, key));
  if (!line) return;
  line.clientNote = note || null;
  line.clientPhotoPath = photoPath || null;
  ubSaveCart(cart);
}
/* Produits qui demandent un choix (teinte) ou une info avant l'achat : pas d'ajout
   direct depuis une carte ou une suggestion, on passe par la fiche produit. */
function ubNeedsChoice(p) {
  return !!(p && ((p.shadeOptions && p.shadeOptions.length) || p.requiresPhoto || p.requiresClientNote));
}
function ubCartTotalItems() {
  return ubGetCart().reduce((s, l) => s + l.qty, 0);
}
function ubUpdateCartCount() {
  document.querySelectorAll('.js-cart-count').forEach(el => {
    el.textContent = ubCartTotalItems();
  });
}

/* ---------- Toast ---------- */
let ubToastTimer = null;
function ubShowToast(message) {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<span class="toast-icon">${ubIcon('check')}</span><span class="toast-msg"></span>`;
    document.body.appendChild(toast);
  }
  toast.querySelector('.toast-msg').textContent = message;
  toast.classList.add('show');
  clearTimeout(ubToastTimer);
  ubToastTimer = setTimeout(() => toast.classList.remove('show'), 2600);
}

/* ---------- Header / Footer (composants injectés) ---------- */
function ubRenderHeader(active) {
  const el = document.getElementById('site-header');
  if (!el) return;
  const links = [
    { href: 'index.html', label: 'Accueil', key: 'accueil' },
    { href: 'boutique.html', label: 'Boutique', key: 'boutique' },
    { href: 'categories.html', label: 'Catégories', key: 'categories' },
    { href: 'box-cadeau.html', label: 'Box Cadeau', key: 'boxcadeau' },
    { href: 'a-propos.html', label: 'À propos', key: 'apropos' },
    { href: 'contact.html', label: 'Contact', key: 'contact' },
  ];
  el.innerHTML = `
    <div class="topbar" id="ub-topbar">${ubTopbarText()}</div>
    <header class="site-header">
      <nav class="nav">
        <button class="burger" aria-label="Menu" id="ub-burger">${ubIcon('menu')}</button>
        <a href="index.html" class="logo" id="ub-logo">Urbann<span>Beauty</span></a>
        <ul class="nav-links" id="ub-nav-links">
          <li class="nav-search-mobile">
            <div class="search-box">
              ${ubIcon('search')}
              <input type="search" id="ub-search-input-mobile" placeholder="Rechercher un produit..." autocomplete="off">
            </div>
          </li>
          ${links.map(l => `<li><a href="${l.href}" class="${l.key === active ? 'active' : ''}">${l.label}</a></li>`).join('')}
        </ul>
        <div class="nav-actions">
          <div class="search-box">
            ${ubIcon('search')}
            <input type="search" id="ub-search-input" placeholder="Rechercher un produit..." autocomplete="off">
          </div>
          <a href="favoris.html" class="icon-btn ub-wish-link" title="Mes favoris" aria-label="Mes favoris">
            ${ubIcon('heart')}
            <span class="cart-count js-wish-count" style="display:none">0</span>
          </a>
          <a href="panier.html" class="icon-btn ub-cart-link" title="Panier" aria-label="Mon panier">
            ${ubIcon('bag')}
            <span class="cart-count js-cart-count">0</span>
          </a>
        </div>
      </nav>
    </header>
  `;
  const burger = document.getElementById('ub-burger');
  const navLinks = document.getElementById('ub-nav-links');
  burger.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    burger.innerHTML = navLinks.classList.contains('open') ? ubIcon('close') : ubIcon('menu');
  });
  const goSearch = (value) => { if (value.trim()) location.href = 'boutique.html?search=' + encodeURIComponent(value.trim()); };
  const searchInput = document.getElementById('ub-search-input');
  searchInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') goSearch(searchInput.value); });
  const searchInputMobile = document.getElementById('ub-search-input-mobile');
  searchInputMobile.addEventListener('keydown', (e) => { if (e.key === 'Enter') goSearch(searchInputMobile.value); });
  ubUpdateCartCount();
  ubUpdateWishCount();
  ubApplyLogo(document.getElementById('ub-logo'));
  /* L'icone panier ouvre le mini-panier au lieu de quitter la page (clic molette /
     Ctrl+clic gardent le comportement de lien classique). */
  el.querySelector('.ub-cart-link').addEventListener('click', (e) => {
    if (ubIsCartPage() || e.ctrlKey || e.metaKey || e.button === 1) return;
    e.preventDefault();
    ubOpenCartDrawer();
  });

  /* Le bandeau code promo ne s'affiche que si l'admin a active un code avec
     "afficher dans le bandeau" (admin/promotions.html) -- rien par defaut. */
  ubGetActivePromoCodes().then(codes => {
    const promo = codes.find(c => c.showBanner);
    const topbar = document.getElementById('ub-topbar');
    if (promo && topbar) {
      topbar.innerHTML = `${ubTopbarText()} &nbsp;•&nbsp; <strong>-${promo.percent}%</strong> ${promo.label ? `${promo.label} ` : ''}avec le code <strong>${promo.code}</strong>`;
    }
  });
}

function ubRenderFooter() {
  const el = document.getElementById('site-footer');
  if (!el) return;
  el.innerHTML = `
    <footer class="site-footer">
      <div class="container">
        <div class="footer-grid">
          <div>
            <a href="index.html" class="logo" id="ub-footer-logo">Urbann<span>Beauty</span></a>
            <p class="desc">Votre destination beauté : soins visage, corps, maquillage, accessoires et parfums sélectionnés avec exigence pour révéler votre éclat naturel.</p>
            <p class="desc ub-footer-contact"><span>${ubIcon('pin')} ${UB_CONTACT.city}</span><a href="tel:+${UB_CONTACT.whatsapp}">${ubIcon('phone')} ${UB_CONTACT.phoneDisplay}</a></p>
            <div class="social-row">
              <a href="#" aria-label="Instagram">${ubIcon('instagram')}</a>
              <a href="#" aria-label="Facebook">${ubIcon('facebook')}</a>
              <a href="#" aria-label="TikTok">${ubIcon('tiktok')}</a>
            </div>
          </div>
          <div>
            <h4>Boutique</h4>
            <ul>
              <li><a href="boutique.html?cat=visage">Soins visage</a></li>
              <li><a href="boutique.html?cat=corps">Soins du corps</a></li>
              <li><a href="boutique.html?cat=maquillage">Maquillage</a></li>
              <li><a href="boutique.html?cat=parfums">Parfums</a></li>
              <li><a href="diagnostic-teint.html">Trouver ma teinte</a></li>
            </ul>
          </div>
          <div>
            <h4>Aide</h4>
            <ul>
              <li><a href="contact.html">Contact</a></li>
              <li><a href="infos.html#livraison">Livraison &amp; retours</a></li>
              <li><a href="infos.html#faq">FAQ</a></li>
              <li><a href="suivi.html">Suivre ma commande</a></li>
              <li><a href="retour.html">Demander un retour</a></li>
            </ul>
          </div>
          <div>
            <h4>Restons en contact</h4>
            <p class="desc" style="margin-bottom:14px">Recevez nos nouveautés et offres exclusives.</p>
            <form class="coupon-row" id="footer-newsletter-form" style="margin:0">
              <input type="email" required placeholder="Votre email" style="background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.15);color:#fff">
              <button class="btn btn-primary btn-sm" type="submit">OK</button>
            </form>
          </div>
        </div>
        <div class="footer-bottom">
          <span>© 2026 Urbann Beauty. Tous droits réservés. · <a href="confidentialite.html" style="color:inherit;text-decoration:underline">Confidentialité</a></span>
          <div class="payment-icons">
            <span>Wave</span>
          </div>
        </div>
      </div>
    </footer>
  `;
  ubApplyLogo(document.getElementById('ub-footer-logo'));
  document.getElementById('footer-newsletter-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const input = e.target.querySelector('input[type="email"]');
    const btn = e.target.querySelector('button');
    const email = input.value.trim();
    if (!email) return;
    btn.disabled = true;
    const ok = await ubSubscribeNewsletter(email, 'footer');
    btn.disabled = false;
    ubShowToast(ok ? 'Merci pour votre inscription !' : "Une erreur est survenue, réessayez.");
    if (ok) e.target.reset();
  });
}

/* ---------- Reveal on scroll ---------- */
function ubInitReveal() {
  const items = document.querySelectorAll('.reveal');
  if (!items.length) return;
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); obs.unobserve(e.target); } });
  }, { threshold: 0.15 });
  items.forEach(i => obs.observe(i));
}

/* ---------- Carte produit — direction éditoriale premium ---------- */
function ubStars(rating) {
  const full = Math.round(rating);
  return Array.from({ length: 5 }, (_, i) => `<span style="opacity:${i < full ? 1 : .25}">★</span>`).join('');
}

function ubProductCardHTML(p, catsById) {
  const cat = catsById ? catsById[p.category] : null;
  const soldOut = p.stock != null && p.stock <= 0;
  const lowStock = !soldOut && p.stock != null && p.stock <= 5;
  const discount = p.oldPrice && p.oldPrice > p.price ? Math.round((1 - p.price / p.oldPrice) * 100) : 0;
  const tagLabel = soldOut ? 'Épuisé' : p.tag;
  const tag = tagLabel ? `<span class="editorial-tag ${soldOut || tagLabel === 'Stock faible' ? 'is-danger' : tagLabel === 'Promo' ? 'is-gold' : ''}">${tagLabel}</span>` : '';
  const discountBadge = discount && !soldOut ? `<span class="editorial-tag is-gold">-${discount}%</span>` : '';
  const wished = ubIsWished(p.id);
  return `
  <article class="product-card editorial-product reveal${soldOut ? ' is-soldout' : ''}">
    <div class="editorial-product-media">
      <a href="produit.html?id=${p.id}" class="editorial-product-image" aria-label="Voir ${p.name}">
        <img src="${p.img}" alt="${p.name}" loading="lazy">
      </a>
      <div class="editorial-product-top">
        <span class="ub-card-tags">${tag}${discountBadge}</span>
        <button class="editorial-fav${wished ? ' is-on' : ''}" type="button" data-wish="${p.id}" onclick="event.preventDefault(); ubToggleWishlist('${p.id}')" aria-pressed="${wished}" aria-label="Ajouter ${p.name} aux favoris">${ubIcon('heart')}</button>
      </div>
      ${lowStock ? `<span class="ub-card-urgency">Plus que ${p.stock} en stock</span>` : ''}
      <a class="editorial-view" href="produit.html?id=${p.id}">Découvrir <span>↗</span></a>
    </div>
    <div class="editorial-product-info">
      <div class="editorial-product-meta">
        <span>${cat ? cat.name : 'Urbann Beauty'}</span>
        ${p.reviews > 0 ? `<span>${ubStars(p.rating)} <b>${p.rating.toFixed(1)}</b></span>` : `<span class="ub-card-new">Nouveau</span>`}
      </div>
      <h3><a href="produit.html?id=${p.id}">${p.name}</a></h3>
      <div class="editorial-product-bottom">
        <div class="editorial-price">
          <strong>${ubFormatPrice(p.price)}</strong>
          ${p.oldPrice ? `<del>${ubFormatPrice(p.oldPrice)}</del>` : ''}
        </div>
        ${soldOut
          ? `<a class="editorial-add is-soldout" href="https://wa.me/${UB_CONTACT.whatsapp}?text=${encodeURIComponent(`Bonjour, le produit "${p.name}" est épuisé sur le site. Pouvez-vous me prévenir dès son retour en stock ?`)}" target="_blank" rel="noopener" onclick="ubTrack('whatsapp_click',{productId:'${p.id}'})" aria-label="Être prévenue du retour de ${p.name}"><span>Me prévenir</span>${ubIcon('bell')}</a>`
          : ubNeedsChoice(p)
            ? `<a class="editorial-add" href="produit.html?id=${p.id}" aria-label="Choisir la teinte de ${p.name}"><span>${p.shadeOptions && p.shadeOptions.length ? 'Choisir' : 'Voir'}</span>${ubIcon('droplet')}</a>`
            : `<button class="editorial-add" type="button" onclick="ubAddToCart('${p.id}',1)" aria-label="Ajouter ${p.name} au panier"><span>Ajouter</span>${ubIcon('bag')}</button>`}
      </div>
    </div>
  </article>`;
}

function ubTestimonialCardHTML(t) {
  if (t.type === 'capture' && t.screenshot) {
    return `
    <div class="testi-card is-shot reveal">
      <div class="testi-shot-badge">${ubIcon('whatsapp')} Conversation client</div>
      <img src="${t.screenshot}" alt="Échange avec ${t.name || 'un client'}" loading="lazy">
      ${t.name || t.text ? `<div class="testi-shot-cap">${t.name ? `<strong>${t.name}</strong>` : ''}${t.text ? `<span>${t.text}</span>` : ''}</div>` : ''}
    </div>`;
  }
  return `
  <div class="testi-card reveal">
    <div class="stars">${'★'.repeat(t.rating || 5)}${'☆'.repeat(5 - (t.rating || 5))}</div>
    <p>“${t.text || ''}”</p>
    <div class="testi-user">
      <img src="${t.avatar || 'https://i.pravatar.cc/80'}" alt="${t.name || ''}">
      <div><strong>${t.name || ''}</strong><span>${t.role || ''}</span></div>
    </div>
  </div>`;
}

function ubRenderWhatsAppButton() {
  if (document.querySelector('.whatsapp-float')) return;
  const a = document.createElement('a');
  a.href = `https://wa.me/${UB_CONTACT.whatsapp}?text=${encodeURIComponent('Bonjour Urbann Beauty, j\'aimerais avoir des informations sur vos produits.')}`;
  a.target = '_blank';
  a.rel = 'noopener';
  a.className = 'whatsapp-float';
  a.title = 'Discuter sur WhatsApp';
  a.innerHTML = ubIcon('whatsapp');
  a.addEventListener('click', () => ubTrack('whatsapp_click'));
  document.body.appendChild(a);
}
/* Permet a une page (fiche produit, panier...) d'adapter le message pre-rempli du
   bouton WhatsApp flottant au contexte, pour que la conseillere sache de quoi on parle. */
function ubSetWhatsAppContext(text) {
  ubRenderWhatsAppButton();
  const a = document.querySelector('.whatsapp-float');
  if (a) a.href = `https://wa.me/${UB_CONTACT.whatsapp}?text=${encodeURIComponent(text)}`;
}

/* Icones declarees dans le HTML statique : <span data-ub-icon="gift"></span> */
function ubHydrateIcons(scope) {
  (scope || document).querySelectorAll('[data-ub-icon]').forEach(el => { if (!el.firstChild) el.innerHTML = ubIcon(el.dataset.ubIcon); });
}
document.addEventListener('DOMContentLoaded', () => {
  ubHydrateIcons();
  ubInitReveal();
  ubUpdateCartCount();
  ubRenderWhatsAppButton();
  ubTrackVisit();
});

/* ============================================
   CONVERSION — mini-panier, favoris, parcours
   ============================================ */

/* Feuille de style des outils de conversion, injectee une fois pour toutes les pages
   publiques (evite d'avoir a modifier chaque <head>). */
(function ubLoadConversionCss() {
  if (document.querySelector('link[data-ub-conversion]')) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'assets/css/conversion.css';
  link.dataset.ubConversion = '1';
  document.head.appendChild(link);
})();

const UB_FREE_SHIPPING_THRESHOLD = 50000;
function ubTopbarText() {
  return `Livraison offerte dès ${ubFormatPrice(UB_FREE_SHIPPING_THRESHOLD)} d'achat &nbsp;•&nbsp; Commande préparée sous 24 à 48h`;
}
function ubIsCartPage() {
  return /panier\.html$/.test(location.pathname);
}
function ubStore(key, fallback) {
  try { const v = JSON.parse(localStorage.getItem(key)); return v == null ? fallback : v; } catch (e) { return fallback; }
}
function ubStoreSet(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* navigation privee : sans consequence */ }
}
function ubRandomId(prefix) {
  return prefix + Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
}

/* ---------- Suivi du parcours d'achat (entonnoir visible dans l'admin) ----------
   Anonyme : un identifiant aleatoire par navigateur, aucune donnee personnelle.
   Ne bloque jamais la page (fire-and-forget, erreurs ignorees). */
function ubVisitorId() {
  let id = ubStore('ub_vid', null);
  if (!id) { id = ubRandomId('v'); ubStoreSet('ub_vid', id); }
  return id;
}
function ubTrack(event, { productId, value } = {}) {
  try {
    if (typeof ubSupabase === 'undefined') return;
    ubSupabase.from('site_events').insert({ session_id: ubVisitorId(), event, product_id: productId || null, value: value ?? null }).then(() => {}, () => {});
  } catch (e) { /* jamais bloquant */ }
}
/* N'envoie un evenement qu'une fois par jour et par cle (visite, debut de checkout...) */
function ubTrackOncePerDay(event, key, extra) {
  const day = new Date().toISOString().slice(0, 10);
  const seen = ubStore('ub_tracked', {});
  const k = event + ':' + (key || '');
  if (seen[k] === day) return;
  Object.keys(seen).forEach(x => { if (seen[x] !== day) delete seen[x]; });
  seen[k] = day;
  ubStoreSet('ub_tracked', seen);
  ubTrack(event, extra);
}
function ubTrackVisit() { ubTrackOncePerDay('visit'); }

/* ---------- Favoris (liste d'envies, sans compte) ---------- */
function ubGetWishlist() { return ubStore('ub_wishlist', []); }
function ubIsWished(id) { return ubGetWishlist().includes(id); }
function ubToggleWishlist(id) {
  let list = ubGetWishlist();
  const on = !list.includes(id);
  list = on ? [id, ...list] : list.filter(x => x !== id);
  ubStoreSet('ub_wishlist', list.slice(0, 60));
  document.querySelectorAll(`[data-wish="${CSS.escape(id)}"]`).forEach(b => { b.classList.toggle('is-on', on); b.setAttribute('aria-pressed', on); });
  ubUpdateWishCount();
  ubShowToast(on ? 'Ajouté à vos favoris' : 'Retiré de vos favoris');
  return on;
}
function ubUpdateWishCount() {
  const n = ubGetWishlist().length;
  document.querySelectorAll('.js-wish-count').forEach(el => { el.textContent = n; el.style.display = n ? '' : 'none'; });
}

/* ---------- Produits consultes recemment ---------- */
function ubRememberViewed(id) {
  ubStoreSet('ub_recent', [id, ...ubStore('ub_recent', []).filter(x => x !== id)].slice(0, 12));
}
function ubGetRecentlyViewed() { return ubStore('ub_recent', []); }

/* ---------- Catalogue en cache (une seule requete par page) ---------- */
let ubCatalogPromise = null;
function ubGetCatalog() {
  if (!ubCatalogPromise) {
    ubCatalogPromise = Promise.all([ubGetAllProducts(), ubGetGiftBoxTemplates()]).then(([products, templates]) => ({
      products,
      productsById: Object.fromEntries(products.map(p => [p.id, p])),
      templatesById: Object.fromEntries(templates.map(t => [t.id, t])),
    }));
  }
  return ubCatalogPromise;
}

/* Sous-total du panier : lignes classiques au prix catalogue + chaque box cadeau a
   son prix fixe. Indicatif uniquement : le serveur recalcule tout a la commande. */
function ubComputeCartSummary(cart, productsById, templatesById) {
  const regular = [], boxes = {};
  cart.forEach(l => {
    const product = productsById[l.id];
    if (!product) return;
    if (l.boxInstanceId) {
      (boxes[l.boxInstanceId] = boxes[l.boxInstanceId] || { instanceId: l.boxInstanceId, label: l.boxLabel, templateId: l.boxTemplateId, items: [] }).items.push({ ...l, product });
    } else regular.push({ ...l, product });
  });
  const boxList = Object.values(boxes).map(b => {
    const tpl = templatesById[b.templateId];
    return { ...b, available: !!tpl, price: tpl ? tpl.price : b.items.reduce((s, l) => s + l.product.price, 0) };
  });
  const subtotal = regular.reduce((s, l) => s + l.product.price * l.qty, 0) + boxList.reduce((s, b) => s + b.price, 0);
  return { regular, boxes: boxList, subtotal, count: regular.reduce((s, l) => s + l.qty, 0) + boxList.length };
}

/* Barre de progression "livraison offerte" : le levier n°1 pour augmenter le panier moyen. */
function ubFreeShippingHTML(subtotal) {
  const left = UB_FREE_SHIPPING_THRESHOLD - subtotal;
  const pct = Math.min(100, Math.round(subtotal / UB_FREE_SHIPPING_THRESHOLD * 100));
  return `<div class="ub-ship-progress${left <= 0 ? ' is-done' : ''}">
    <p>${left > 0 ? `Plus que <strong>${ubFormatPrice(left)}</strong> pour profiter de la <strong>livraison offerte</strong>` : `${ubIcon('truck')} Bravo, la <strong>livraison vous est offerte</strong> !`}</p>
    <div class="ub-ship-bar"><span style="width:${pct}%"></span></div>
  </div>`;
}

/* Suggestions pour completer le panier : produits en stock, pas deja dans le panier,
   d'abord dans les memes categories, et de preference ceux qui font franchir le seuil
   de livraison offerte. */
function ubCartSuggestions(cart, products, subtotal, limit = 3) {
  const inCart = new Set(cart.map(l => l.id));
  const cats = new Set(products.filter(p => inCart.has(p.id)).map(p => p.category));
  const gap = UB_FREE_SHIPPING_THRESHOLD - subtotal;
  return products
    .filter(p => !inCart.has(p.id) && p.stock > 0 && !ubNeedsChoice(p))
    .map(p => ({ p, score: (cats.has(p.category) ? 3 : 0) + (gap > 0 && p.price >= gap ? 2 : 0) + (p.tag === 'Best-seller' ? 1 : 0) + p.rating / 5 }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(x => x.p);
}

function ubBumpCartIcon() {
  document.querySelectorAll('.ub-cart-link').forEach(a => { a.classList.remove('is-bump'); void a.offsetWidth; a.classList.add('is-bump'); });
}

/* ---------- Mini-panier lateral ---------- */
function ubEnsureCartDrawer() {
  let drawer = document.getElementById('ub-cart-drawer');
  if (drawer) return drawer;
  const overlay = document.createElement('div');
  overlay.className = 'ub-drawer-overlay';
  overlay.id = 'ub-drawer-overlay';
  overlay.addEventListener('click', ubCloseCartDrawer);
  drawer = document.createElement('aside');
  drawer.className = 'ub-drawer';
  drawer.id = 'ub-cart-drawer';
  drawer.setAttribute('role', 'dialog');
  drawer.setAttribute('aria-modal', 'true');
  drawer.setAttribute('aria-label', 'Mon panier');
  drawer.innerHTML = `<div class="ub-drawer-head"><h3>Mon panier <span id="ub-drawer-count"></span></h3><button type="button" class="ub-drawer-close" aria-label="Fermer" onclick="ubCloseCartDrawer()">${ubIcon('close')}</button></div><div class="ub-drawer-body" id="ub-drawer-body"></div><div class="ub-drawer-foot" id="ub-drawer-foot"></div>`;
  document.body.append(overlay, drawer);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') ubCloseCartDrawer(); });
  return drawer;
}
let ubDrawerHighlight = null;
async function ubOpenCartDrawer(highlightId) {
  ubDrawerHighlight = highlightId || null;
  const drawer = ubEnsureCartDrawer();
  document.getElementById('ub-drawer-body').innerHTML = `<div class="ub-drawer-loading"><span></span><span></span></div>`;
  document.getElementById('ub-drawer-foot').innerHTML = '';
  requestAnimationFrame(() => { drawer.classList.add('open'); document.getElementById('ub-drawer-overlay').classList.add('open'); });
  document.documentElement.classList.add('ub-no-scroll');
  await ubRenderCartDrawer();
  drawer.querySelector('.ub-drawer-close').focus({ preventScroll: true });
}
function ubCloseCartDrawer() {
  const drawer = document.getElementById('ub-cart-drawer');
  if (!drawer || !drawer.classList.contains('open')) return;
  drawer.classList.remove('open');
  document.getElementById('ub-drawer-overlay').classList.remove('open');
  document.documentElement.classList.remove('ub-no-scroll');
}
async function ubRenderCartDrawer() {
  const body = document.getElementById('ub-drawer-body'), foot = document.getElementById('ub-drawer-foot');
  if (!body) return;
  const cart = ubGetCart();
  const { products, productsById, templatesById } = await ubGetCatalog();
  const sum = ubComputeCartSummary(cart, productsById, templatesById);
  document.getElementById('ub-drawer-count').textContent = sum.count ? `(${sum.count})` : '';
  if (!sum.count) {
    body.innerHTML = `<div class="ub-drawer-empty">${ubIcon('bag')}<h4>Votre panier est vide</h4><p>Nos best-sellers n'attendent que vous.</p><a class="btn btn-primary" href="boutique.html">Découvrir la boutique</a></div>`;
    foot.innerHTML = '';
    return;
  }
  const hl = ubDrawerHighlight ? String(ubDrawerHighlight) : null;
  const added = hl ? productsById[decodeURIComponent(hl.split('~')[0])] : null;
  const addedShade = hl && hl.includes('~') ? decodeURIComponent(hl.split('~')[1] || '') : '';
  const suggestions = ubCartSuggestions(cart, products, sum.subtotal, 3);
  body.innerHTML = `
    ${added ? `<div class="ub-drawer-added">${ubIcon('check')} <span><strong>${added.name}</strong>${addedShade ? ` (teinte ${ubEscapeHtml(addedShade)})` : ''} a été ajouté à votre panier</span></div>` : ''}
    ${ubFreeShippingHTML(sum.subtotal)}
    <ul class="ub-drawer-lines">
      ${sum.boxes.map(b => `<li class="ub-drawer-line"><div class="ub-drawer-thumb is-box">${ubIcon('box')}</div><div class="ub-drawer-info"><strong>Box cadeau — ${b.label || ''}</strong><small>${b.items.map(l => l.product.name).join(', ')}</small><div class="ub-drawer-row"><b>${ubFormatPrice(b.price)}</b><button type="button" class="ub-link-btn" onclick="ubRemoveBoxFromCart('${b.instanceId}');ubRenderCartDrawer()">Retirer</button></div></div></li>`).join('')}
      ${sum.regular.map(l => {
        const maxed = l.product.stock != null && l.qty >= l.product.stock;
        const key = ubLineKey(l);
        return `<li class="ub-drawer-line${hl && (hl === key || hl === l.id) ? ' is-new' : ''}"><a href="produit.html?id=${l.id}" class="ub-drawer-thumb"><img src="${l.product.img}" alt=""></a><div class="ub-drawer-info"><a href="produit.html?id=${l.id}"><strong>${l.product.name}</strong></a>${l.shade ? ubShadeTagHTML(l.product, l.shade) : ''}<small>${ubFormatPrice(l.product.price)}${maxed ? ' · stock maximum atteint' : ''}</small><div class="ub-drawer-row"><div class="qty-selector qty-sm"><button type="button" aria-label="Retirer un" onclick="ubDrawerQty('${key}',${l.qty - 1})">−</button><span>${l.qty}</span><button type="button" aria-label="Ajouter un" ${maxed ? 'disabled' : ''} onclick="ubDrawerQty('${key}',${l.qty + 1})">+</button></div><b>${ubFormatPrice(l.product.price * l.qty)}</b></div></div><button type="button" class="ub-drawer-remove" aria-label="Supprimer ${l.product.name}" onclick="ubDrawerQty('${key}',0)">${ubIcon('trash')}</button></li>`;
      }).join('')}
    </ul>
    ${suggestions.length ? `<div class="ub-drawer-suggest"><h4>Complétez votre routine</h4>${suggestions.map(p => `<div class="ub-suggest-item"><a href="produit.html?id=${p.id}"><img src="${p.img}" alt=""></a><div><a href="produit.html?id=${p.id}"><strong>${p.name}</strong></a><small>${ubFormatPrice(p.price)}</small></div><button type="button" class="btn btn-outline btn-sm" onclick="ubAddToCart('${p.id}',1,{silent:true});ubDrawerHighlight='${p.id}';ubRenderCartDrawer()">+ Ajouter</button></div>`).join('')}</div>` : ''}`;
  foot.innerHTML = `
    <div class="ub-drawer-total"><span>Sous-total</span><strong>${ubFormatPrice(sum.subtotal)}</strong></div>
    <p class="ub-drawer-note">Livraison calculée selon votre quartier à l'étape suivante.</p>
    <a href="panier.html" class="btn btn-primary btn-block ub-drawer-cta">Commander ${ubIcon('shield')}</a>
    <button type="button" class="ub-link-btn ub-drawer-continue" onclick="ubCloseCartDrawer()">Continuer mes achats</button>
    <div class="ub-drawer-trust"><span>${ubIcon('shield')} Paiement Wave</span><span>${ubIcon('truck')} Livraison Dakar & régions</span><span>${ubIcon('return')} Retour 7 jours</span></div>`;
}
/* Pastille "Teinte : X" affichee sur une ligne de panier. */
function ubShadeTagHTML(product, shadeName) {
  const opt = (product.shadeOptions || []).find(o => o.name === shadeName);
  const hex = opt && /^#[0-9a-f]{3,8}$/i.test(opt.hex || '') ? opt.hex : '#c9a58c';
  return `<span class="ub-shade-tag"><i style="background:${hex}"></i>Teinte : ${ubEscapeHtml(shadeName)}</span>`;
}
function ubDrawerQty(key, qty) {
  if (qty <= 0) ubRemoveFromCart(key); else ubSetQty(key, qty);
  ubRenderCartDrawer();
}
