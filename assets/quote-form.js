// Multistep quote wizard
(function(){
  const form=document.getElementById('quoteForm');
  if(!form)return;

  const WA='254721538659';
  const steps=[...form.querySelectorAll('.q-step')];
  const bar=document.getElementById('qBar');
  const count=document.getElementById('qCount');
  const label=document.getElementById('qLabel');
  const back=document.getElementById('qBack');
  const next=document.getElementById('qNext');
  const done=document.getElementById('qDone');
  const summary=document.getElementById('qSummary');
  const top=document.querySelector('.q-top');
  const progress=document.querySelector('.q-progress');

  const data={services:[],project:'',budget:'',timeline:''};
  let i=0;

  const nextLabel='Next <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
  const sendLabel='Get my free quote <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';

  function stepValid(){
    const s=steps[i];
    if(s.dataset.key==='details'){
      return form.querySelector('#qName').value.trim()!==''&&form.querySelector('#qContact').value.trim()!=='';
    }
    const v=data[s.dataset.key];
    return Array.isArray(v)?v.length>0:!!v;
  }

  function render(){
    steps.forEach((s,n)=>s.classList.toggle('active',n===i));
    bar.style.width=Math.round(((i+1)/steps.length)*100)+'%';
    count.textContent='Step '+(i+1)+' of '+steps.length;
    label.textContent=steps[i].dataset.label;
    back.style.visibility=i===0?'hidden':'visible';
    next.innerHTML=i===steps.length-1?sendLabel:nextLabel;
    next.disabled=!stepValid();
    if(steps[i].dataset.key==='details')renderSummary();
  }

  function renderSummary(){
    summary.innerHTML='<b>Your picks</b><ul>'+
      '<li><b>Services</b> '+(data.services.join(', ')||'—')+'</li>'+
      '<li><b>Project</b> '+(data.project||'—')+'</li>'+
      '<li><b>Budget</b> '+(data.budget||'—')+'</li>'+
      '<li><b>Timeline</b> '+(data.timeline||'—')+'</li>'+
      '</ul>';
  }

  form.addEventListener('click',e=>{
    const opt=e.target.closest('.q-opt');
    if(!opt)return;
    const s=opt.closest('.q-step');
    const key=s.dataset.key;
    if('multi'in s.dataset){
      const on=opt.getAttribute('aria-pressed')==='true';
      opt.setAttribute('aria-pressed',on?'false':'true');
      data[key]=[...s.querySelectorAll('.q-opt[aria-pressed="true"]')].map(b=>b.dataset.value);
    }else{
      s.querySelectorAll('.q-opt').forEach(b=>b.setAttribute('aria-pressed',b===opt?'true':'false'));
      data[key]=opt.dataset.value;
    }
    next.disabled=!stepValid();
  });

  form.addEventListener('input',()=>{next.disabled=!stepValid();});

  // No backend yet — Enter in a text field must not reload the page
  form.addEventListener('submit',e=>{e.preventDefault();if(stepValid())next.click();});

  back.addEventListener('click',()=>{if(i>0){i--;render();}});

  next.addEventListener('click',()=>{
    if(!stepValid())return;
    if(i<steps.length-1){i++;render();return;}
    finish();
  });

  function finish(){
    data.name=form.querySelector('#qName').value.trim();
    data.business=form.querySelector('#qBusiness').value.trim();
    data.contact=form.querySelector('#qContact').value.trim();
    const msg=encodeURIComponent('Hi Webtech! Quote request from your website:\n'+
      '• Services: '+data.services.join(', ')+'\n'+
      '• Project: '+data.project+'\n'+
      '• Budget: '+data.budget+'\n'+
      '• Timeline: '+data.timeline+'\n'+
      '• Name: '+data.name+(data.business?'\n• Business: '+data.business:'')+'\n'+
      '• Contact: '+data.contact);
    document.getElementById('qWhatsApp').href='https://wa.me/'+WA+'?text='+msg;

    const qStatus=document.getElementById('qStatus');
    if(qStatus){
      qStatus.hidden=true;
      qStatus.className='form-status';
    }
    if(window.WebtechForms){
      window.WebtechForms.submit({
        subject:'New quote request from the Webtech Solutions website',
        from_name:data.name||'Website visitor',
        name:data.name,
        business:data.business,
        contact:data.contact,
        services:data.services.join(', '),
        project:data.project,
        budget:data.budget,
        timeline:data.timeline
      }).then(ok=>{
        if(!ok&&qStatus){
          qStatus.hidden=false;
          qStatus.className='form-status is-error';
          qStatus.textContent="Heads up — we couldn't auto-send this to our team. Please tap WhatsApp below so we don't miss it.";
        }
      });
    }

    form.hidden=true;
    top.hidden=true;
    progress.hidden=true;
    done.hidden=false;
    done.scrollIntoView({behavior:'smooth',block:'center'});
  }

  document.getElementById('qRestart').addEventListener('click',()=>{
    data.services=[];data.project='';data.budget='';data.timeline='';
    form.reset();
    form.querySelectorAll('.q-opt').forEach(b=>b.setAttribute('aria-pressed','false'));
    i=0;
    form.hidden=false;top.hidden=false;progress.hidden=false;done.hidden=true;
    const qStatus=document.getElementById('qStatus');
    if(qStatus)qStatus.hidden=true;
    render();
  });

  render();
})();
