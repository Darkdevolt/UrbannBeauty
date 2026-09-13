/* Urbann Beauty — Premium interaction layer */
(function(){
  'use strict';

  function initHeaderScroll(){
    const header=document.querySelector('.site-header');
    if(!header) return;
    const update=()=>header.classList.toggle('ub-scrolled',window.scrollY>18);
    update();
    window.addEventListener('scroll',update,{passive:true});
  }

  function initRevealStagger(){
    document.querySelectorAll('.product-grid,.cat-grid,.testi-grid,.usp-strip .container').forEach(grid=>{
      [...grid.children].forEach((item,i)=>item.style.transitionDelay=`${Math.min(i*70,280)}ms`);
    });
  }

  function initHeroParallax(){
    const hero=document.querySelector('.hero');
    const visual=document.querySelector('.hero-visual');
    if(!hero||!visual||window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let ticking=false;
    const update=()=>{
      const rect=hero.getBoundingClientRect();
      if(rect.bottom<0||rect.top>innerHeight){ticking=false;return;}
      const progress=Math.max(-1,Math.min(1,(innerHeight/2-(rect.top+rect.height/2))/innerHeight));
      visual.style.transform=`translate3d(0,${progress*-10}px,0)`;
      ticking=false;
    };
    window.addEventListener('scroll',()=>{if(!ticking){requestAnimationFrame(update);ticking=true;}},{passive:true});
  }

  function initButtonFeedback(){
    document.addEventListener('click',e=>{
      const btn=e.target.closest('.btn-primary,.product-quickadd');
      if(!btn||btn.dataset.ubPulse==='1') return;
      btn.dataset.ubPulse='1';
      btn.animate([{transform:'translateY(0) scale(1)'},{transform:'translateY(-2px) scale(.985)'},{transform:'translateY(0) scale(1)'}],{duration:280,easing:'cubic-bezier(.22,1,.36,1)'}).finished.catch(()=>{}).finally(()=>delete btn.dataset.ubPulse);
    });
  }

  function init(){
    initHeaderScroll();
    initRevealStagger();
    initHeroParallax();
    initButtonFeedback();
    setTimeout(()=>window.ubInitReveal&&window.ubInitReveal(),60);
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
