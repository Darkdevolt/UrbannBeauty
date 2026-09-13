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
  const line = cart.find(l => l.id === id);
  if (line) line.qty += qty;
  else cart.push({ id, qty });
  ubSaveCart(cart);
  ubShowToast('Ajouté au panier avec succès');
}
function ubRemoveFromCart(id) {
  ubSaveCart(ubGetCart().filter(l => l.id !== id));
}
function ubSetQty(id, qty) {
  const cart = ubGetCart();
  const line = cart.find(l => l.id === id);
  if (line) { line.qty = Math.max(1, qty); ubSaveCart(cart); }
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
    { href: 'boutique.html?cat=visage', label: 'Catégories', key: 'categories' },
    { href: 'a-propos.html', label: 'À propos', key: 'apropos' },
    { href: 'contact.html', label: 'Contact', key: 'contact' },
  ];
  el.innerHTML = `
    <div class="topbar">Livraison offerte dès 50 000 FCFA d'achat &nbsp;•&nbsp; <strong>-15%</strong> sur votre première commande avec le code <strong>URBANN15</strong></div>
    <header class="site-header">
      <nav class="nav">
        <button class="burger" aria-label="Menu" id="ub-burger">${ubIcon('menu')}</button>
        <a href="index.html" class="logo">Urbann<span>Beauty</span></a>
        <ul class="nav-links" id="ub-nav-links">
          ${links.map(l => `<li><a href="${l.href}" class="${l.key === active ? 'active' : ''}">${l.label}</a></li>`).join('')}
        </ul>
        <div class="nav-actions">
          <div class="search-box">
            ${ubIcon('search')}
            <input type="text" placeholder="Rechercher un produit...">
          </div>
          <a href="admin/index.html" class="icon-btn" title="Espace admin">${ubIcon('user')}</a>
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
  ubUpdateCartCount();
}

function ubRenderFooter() {
  const el = document.getElementById('site-footer');
  if (!el) return;
  el.innerHTML = `
    <footer class="site-footer">
      <div class="container">
        <div class="footer-grid">
          <div>
            <a href="index.html" class="logo">Urbann<span>Beauty</span></a>
            <p class="desc">Votre destination beauté : soins visage, corps, maquillage et parfums sélectionnés avec exigence pour révéler votre éclat naturel.</p>
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
            </ul>
          </div>
          <div>
            <h4>Aide</h4>
            <ul>
              <li><a href="contact.html">Contact</a></li>
              <li><a href="#">Livraison &amp; retours</a></li>
              <li><a href="#">FAQ</a></li>
              <li><a href="admin/index.html">Espace admin</a></li>
            </ul>
          </div>
          <div>
            <h4>Restons en contact</h4>
            <p class="desc" style="margin-bottom:14px">Recevez nos nouveautés et offres exclusives.</p>
            <form class="coupon-row" onsubmit="event.preventDefault(); ubShowToast('Merci pour votre inscription !');" style="margin:0">
              <input type="email" required placeholder="Votre email" style="background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.15);color:#fff">
              <button class="btn btn-primary btn-sm" type="submit">OK</button>
            </form>
          </div>
        </div>
        <div class="footer-bottom">
          <span>© 2026 Urbann Beauty. Tous droits réservés.</span>
          <div class="payment-icons">
            <span>Orange Money</span><span>Wave</span><span>Visa</span><span>MasterCard</span>
          </div>
        </div>
      </div>
    </footer>
  `;
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

/* ---------- Rendu carte produit ---------- */
function ubStars(rating) {
  const full = Math.round(rating);
  return Array.from({ length: 5 }, (_, i) => `<span style="opacity:${i < full ? 1 : .3}">★</span>`).join('');
}

function ubProductCardHTML(p) {
  const cat = ubGetCategory(p.category);
  return `
  <div class="product-card reveal">
    <a href="produit.html?id=${p.id}" class="product-media" style="position:relative;display:block">
      <img src="${p.img}" alt="${p.name}" loading="lazy">
      <div class="product-tags">
        ${p.tag ? `<span class="badge ${p.tag === 'Stock faible' ? 'badge-danger' : (p.tag === 'Promo' ? 'badge-gold' : 'badge-mauve')}">${p.tag}</span>` : ''}
      </div>
      <button class="product-fav" onclick="event.preventDefault(); ubShowToast('Ajouté aux favoris');" aria-label="Favori">${ubIcon('heart')}</button>
      <button class="product-quickadd" onclick="event.preventDefault(); ubAddToCart('${p.id}',1);">${ubIcon('bag')} Ajouter au panier</button>
    </a>
    <div class="product-info">
      <span class="product-cat">${cat ? cat.name : ''}</span>
      <h3><a href="produit.html?id=${p.id}">${p.name}</a></h3>
      <div class="product-rating"><span class="stars">${ubStars(p.rating)}</span> (${p.reviews})</div>
      <div class="product-price">
        <span class="price-now">${ubFormatPrice(p.price)}</span>
        ${p.oldPrice ? `<span class="price-old">${ubFormatPrice(p.oldPrice)}</span>` : ''}
      </div>
    </div>
  </div>`;
}

document.addEventListener('DOMContentLoaded', () => {
  ubInitReveal();
  ubUpdateCartCount();
});
