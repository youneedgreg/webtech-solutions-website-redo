// Shared behaviour for demo-*.html "live demo" dashboard mockups.

// sidebar tab switching
const sideLinks=document.querySelectorAll('.demo-side [data-tab]');
const panels=document.querySelectorAll('.tab-panel[data-panel]');
const panelTitle=document.getElementById('panelTitle');
const panelSub=document.getElementById('panelSub');
sideLinks.forEach(link=>{
  link.addEventListener('click',e=>{
    e.preventDefault();
    const id=link.dataset.tab;
    sideLinks.forEach(a=>{
      const on=a===link;
      a.classList.toggle('active',on);
      if(on)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');
    });
    panels.forEach(p=>{p.hidden=p.dataset.panel!==id;});
    if(panelTitle)panelTitle.textContent=link.dataset.title||link.textContent.trim();
    if(panelSub)panelSub.textContent=link.dataset.sub||'';
    closeSidebar();
    window.scrollTo({top:0,behavior:'smooth'});
  });
});

// mobile sidebar
const demoApp=document.querySelector('.demo-app');
const sideToggle=document.getElementById('sideToggle');
const sideScrim=document.querySelector('.side-scrim');
const closeSidebar=()=>{
  if(!demoApp)return;
  demoApp.classList.remove('side-open');
  sideToggle&&sideToggle.setAttribute('aria-expanded','false');
};
if(sideToggle){
  sideToggle.addEventListener('click',()=>{
    const open=!demoApp.classList.contains('side-open');
    demoApp.classList.toggle('side-open',open);
    sideToggle.setAttribute('aria-expanded',String(open));
  });
}
sideScrim&&sideScrim.addEventListener('click',closeSidebar);
window.matchMedia('(min-width:981px)').addEventListener('change',e=>{if(e.matches)closeSidebar();});

// in-page tabs (within a card)
document.querySelectorAll('.tabs').forEach(group=>{
  const buttons=group.querySelectorAll('button[data-subtab]');
  const subpanels=group.parentElement.querySelectorAll('.subpanel[data-sub]');
  buttons.forEach(btn=>{
    btn.addEventListener('click',()=>{
      buttons.forEach(b=>b.classList.toggle('active',b===btn));
      subpanels.forEach(p=>{p.hidden=p.dataset.sub!==btn.dataset.subtab;});
    });
  });
});

// modals
document.querySelectorAll('[data-modal-open]').forEach(btn=>{
  btn.addEventListener('click',()=>{
    const modal=document.getElementById(btn.dataset.modalOpen);
    if(!modal)return;
    modal.classList.add('open');
    const focusEl=modal.querySelector('input,select,textarea,button,a');
    focusEl&&focusEl.focus();
  });
});
document.querySelectorAll('.modal-overlay').forEach(overlay=>{
  overlay.addEventListener('click',e=>{if(e.target===overlay)overlay.classList.remove('open');});
  overlay.querySelectorAll('[data-modal-close]').forEach(btn=>{
    btn.addEventListener('click',()=>overlay.classList.remove('open'));
  });
  overlay.querySelectorAll('form').forEach(form=>{
    form.addEventListener('submit',e=>{
      e.preventDefault();
      overlay.classList.remove('open');
    });
  });
});
window.addEventListener('keydown',e=>{
  if(e.key!=='Escape')return;
  document.querySelectorAll('.modal-overlay.open').forEach(o=>o.classList.remove('open'));
  document.getElementById('chatPanel')&&document.getElementById('chatPanel').classList.remove('open');
  closeSidebar();
});

// floating AI chat widget
const chatBtn=document.getElementById('chatBtn');
const chatPanel=document.getElementById('chatPanel');
const chatBody=document.getElementById('chatBody');
const chatForm=document.getElementById('chatForm');
const chatInput=document.getElementById('chatInput');

function addMsg(from,text){
  if(!chatBody)return;
  const div=document.createElement('div');
  div.className='fmsg '+from;
  div.textContent=text;
  chatBody.appendChild(div);
  chatBody.scrollTop=chatBody.scrollHeight;
}

function playScript(){
  const script=window.DEMO_CHAT_SCRIPT||[];
  let t=300;
  script.forEach(step=>{
    t+=step.from==='ai'?900:550;
    setTimeout(()=>addMsg(step.from,step.text),t);
  });
}

if(chatBtn){
  chatBtn.addEventListener('click',()=>{
    const open=chatPanel.classList.toggle('open');
    chatBtn.setAttribute('aria-expanded',String(open));
    if(open&&!chatBody.dataset.played){
      chatBody.dataset.played='1';
      playScript();
    }
  });
}
if(chatForm){
  chatForm.addEventListener('submit',e=>{
    e.preventDefault();
    const val=chatInput.value.trim();
    if(!val)return;
    addMsg('user',val);
    chatInput.value='';
    setTimeout(()=>addMsg('ai',window.DEMO_CHAT_REPLY||"Got it — in the full version I'd handle that for you right now and update this dashboard automatically."),900);
  });
}
