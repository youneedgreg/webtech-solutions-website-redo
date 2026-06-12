// nav scroll state
const nav=document.getElementById('nav');
const onScroll=()=>nav.classList.toggle('scrolled',window.scrollY>20);
onScroll();window.addEventListener('scroll',onScroll,{passive:true});

// mobile menu
const menuBtn=document.getElementById('menuBtn');
const mobileMenu=document.getElementById('mobileMenu');
const setMenu=(open)=>{
  nav.classList.toggle('open',open);
  menuBtn.setAttribute('aria-expanded',open);
  menuBtn.setAttribute('aria-label',open?'Close menu':'Open menu');
};
menuBtn.addEventListener('click',()=>setMenu(!nav.classList.contains('open')));
mobileMenu.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>setMenu(false)));
window.addEventListener('keydown',e=>{if(e.key==='Escape')setMenu(false);});
window.matchMedia('(min-width:981px)').addEventListener('change',e=>{if(e.matches)setMenu(false);});

// scroll reveals
const io=new IntersectionObserver((entries)=>{
  entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}});
},{threshold:0.12,rootMargin:'0px 0px -40px 0px'});
document.querySelectorAll('.reveal').forEach(el=>io.observe(el));

// contact form — UI skeleton only, no backend submission yet
const contactForm=document.getElementById('contactForm');
if(contactForm){
  contactForm.addEventListener('submit',e=>{
    e.preventDefault();
    if(!contactForm.checkValidity()){contactForm.reportValidity();return;}
    const btn=contactForm.querySelector('button[type="submit"]');
    btn.textContent='Message sent ✓';
    btn.disabled=true;
    btn.style.opacity='.7';
  });
}

// blog topic filter
const topicRow=document.getElementById('topicRow');
if(topicRow){
  topicRow.addEventListener('click',e=>{
    const btn=e.target.closest('.topic');if(!btn)return;
    topicRow.querySelectorAll('.topic').forEach(b=>b.classList.toggle('on',b===btn));
    const t=btn.dataset.topic;
    document.querySelectorAll('.bgrid .bcard').forEach(card=>{
      const cat=card.querySelector('.bcat');
      card.style.display=(t==='all'||(cat&&cat.textContent.trim()===t))?'':'none';
    });
  });
}

// portfolio project filter
const workFilter=document.getElementById('workFilter');
if(workFilter){
  workFilter.addEventListener('click',e=>{
    const btn=e.target.closest('.topic');if(!btn)return;
    workFilter.querySelectorAll('.topic').forEach(b=>b.classList.toggle('on',b===btn));
    const f=btn.dataset.filter;
    document.querySelectorAll('.pgrid .pcard').forEach(card=>{
      const cats=(card.dataset.cats||'').split(' ');
      card.style.display=(f==='all'||cats.includes(f))?'':'none';
    });
  });
}
