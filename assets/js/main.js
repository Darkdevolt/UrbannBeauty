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
}
function ubAddToCart(id, qty = 1) {
  const cart = ubGetCart();
  const line = cart.find(l => l.id === id && !l.boxInstanceId);
  if (line) line.qty += qty;
  else cart.push({ id, qty });
  ubSaveCart(cart);
  ubShowToast('Produit ajouté au panier');
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
function ubRemoveFromCart(id) {
  ubSaveCart(ubGetCart().filter(l => !(l.id === id && !l.boxInstanceId)));
}
function ubRemoveBoxFromCart(boxInstanceId) {
  ubSaveCart(ubGetCart().filter(l => l.boxInstanceId !== boxInstanceId));
}
function ubSetQty(id, qty) {
  const cart = ubGetCart();
  const line = cart.find(l => l.id === id);
  if (line) { line.qty = Math.max(1, qty); ubSaveCart(cart); }
}
/* Attache l'info demandee par un produit (texte et/ou photo, voir product.requiresClientNote)
   a sa ligne de panier : elle voyagera avec la commande jusqu'a l'admin au checkout. */
function ubSetCartLineNote(id, note, photoPath) {
  const cart = ubGetCart();
  const line = cart.find(l => l.id === id && !l.boxInstanceId);
  if (!line) return;
  line.clientNote = note || null;
  line.clientPhotoPath = photoPath || null;
  ubSaveCart(cart);
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
    <div class="topbar" id="ub-topbar">Livraison offerte dès 50 000 FCFA d'achat</div>
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
          <a href="panier.html" class="icon-btn" title="Panier">
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
  ubApplyLogo(document.getElementById('ub-logo'));

  /* Le bandeau code promo ne s'affiche que si l'admin a active un code avec
     "afficher dans le bandeau" (admin/promotions.html) -- rien par defaut. */
  ubGetActivePromoCodes().then(codes => {
    const promo = codes.find(c => c.showBanner);
    const topbar = document.getElementById('ub-topbar');
    if (promo && topbar) {
      topbar.innerHTML = `Livraison offerte dès 50 000 FCFA d'achat &nbsp;•&nbsp; <strong>-${promo.percent}%</strong> ${promo.label ? `${promo.label} ` : ''}avec le code <strong>${promo.code}</strong>`;
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
            <p class="desc" style="margin-top:-6px">📍 ${UB_CONTACT.city} · 📞 ${UB_CONTACT.phoneDisplay}</p>
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
  const tag = p.tag ? `<span class="editorial-tag ${p.tag === 'Stock faible' ? 'is-danger' : p.tag === 'Promo' ? 'is-gold' : ''}">${p.tag}</span>` : '';
  return `
  <article class="product-card editorial-product reveal">
    <div class="editorial-product-media">
      <a href="produit.html?id=${p.id}" class="editorial-product-image" aria-label="Voir ${p.name}">
        <img src="${p.img}" alt="${p.name}" loading="lazy">
      </a>
      <div class="editorial-product-top">
        ${tag}
        <button class="editorial-fav" type="button" onclick="event.preventDefault(); ubShowToast('Ajouté aux favoris');" aria-label="Ajouter ${p.name} aux favoris">${ubIcon('heart')}</button>
      </div>
      <a class="editorial-view" href="produit.html?id=${p.id}">Découvrir <span>↗</span></a>
    </div>
    <div class="editorial-product-info">
      <div class="editorial-product-meta">
        <span>${cat ? cat.name : 'Urbann Beauty'}</span>
        <span>${ubStars(p.rating)} <b>${p.rating.toFixed(1)}</b></span>
      </div>
      <h3><a href="produit.html?id=${p.id}">${p.name}</a></h3>
      <div class="editorial-product-bottom">
        <div class="editorial-price">
          <strong>${ubFormatPrice(p.price)}</strong>
          ${p.oldPrice ? `<del>${ubFormatPrice(p.oldPrice)}</del>` : ''}
        </div>
        <button class="editorial-add" type="button" onclick="ubAddToCart('${p.id}',1)" aria-label="Ajouter ${p.name} au panier">
          <span>Ajouter</span>${ubIcon('bag')}
        </button>
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
  document.body.appendChild(a);
}

document.addEventListener('DOMContentLoaded', () => {
  ubInitReveal();
  ubUpdateCartCount();
  ubRenderWhatsAppButton();
});
