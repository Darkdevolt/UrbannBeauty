/* Urbann Beauty — Homepage premium header + interactions */
(function(){
  'use strict';
  function render(){
    const root=document.getElementById('site-header');
    if(!root) return;
    const links=[
      ['index.html','Accueil','accueil'],['boutique.html','Boutique','boutique'],['categories.html','Catégories','categories'],['box-cadeau.html','Box Cadeau','boxcadeau'],['a-propos.html','À propos','apropos'],['contact.html','Contact','contact']
    ];
    root.innerHTML=`
      <div class="ub-topline">
        <span>Livraison offerte dès 50 000 FCFA d'achat</span><b>•</b><span><strong>-15%</strong> sur votre première commande avec le code <strong>URBANN15</strong></span><span class="ub-toplinks">Nos magasins &nbsp;&nbsp; | &nbsp;&nbsp; Aide &nbsp;&nbsp; | &nbsp;&nbsp; FR⌄</span>
      </div>
      <header class="site-header ub-premium-header">
        <nav class="nav">
          <button class="burger" aria-label="Menu" id="ub-burger-premium">${ubIcon('menu')}</button>
          <a href="index.html" class="ub-brand" id="ub-premium-logo" aria-label="Urbann Beauty"><span>Urbann</span> <i>Beauty</i><small>RÉVÉLEZ VOTRE BEAUTÉ</small></a>
          <ul class="nav-links" id="ub-nav-links-premium">
            ${links.map(l=>`<li><a href="${l[0]}" class="${l[2]==='accueil'?'active':''}">${l[1]}</a></li>`).join('')}
          </ul>
          <div class="nav-actions ub-premium-actions">
            <label class="ub-search">${ubIcon('search')}<input id="ub-search-input" type="search" placeholder="Rechercher un produit..." autocomplete="off"></label>
            <a href="panier.html" class="icon-btn ub-circle" title="Panier">${ubIcon('bag')}<span class="cart-count js-cart-count">0</span></a>
          </div>
        </nav>
      </header>`;
    const burger=document.getElementById('ub-burger-premium');
    const menu=document.getElementById('ub-nav-links-premium');
    burger.addEventListener('click',()=>{menu.classList.toggle('open');burger.innerHTML=menu.classList.contains('open')?ubIcon('close'):ubIcon('menu');});
    const input=document.getElementById('ub-search-input');
    input.addEventListener('keydown',e=>{if(e.key==='Enter'&&input.value.trim()) location.href='boutique.html?search='+encodeURIComponent(input.value.trim());});
    ubUpdateCartCount();
    ubApplyLogo(document.getElementById('ub-premium-logo'));
  }
  function init(){
    render();
    const header=document.querySelector('.ub-premium-header');
    const update=()=>header&&header.classList.toggle('ub-scrolled',scrollY>24);
    update(); window.addEventListener('scroll',update,{passive:true});
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init,{once:true}); else init();
})();
