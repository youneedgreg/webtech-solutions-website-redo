(function(){
  if(!document.querySelector('.lead-chat'))return;
  const WA="254721538659";
  const body=document.getElementById('leadBody');
  const input=document.getElementById('leadInput');
  const bar=document.getElementById('leadBar');
  const data={};
  let step=0;

  const flow=[
    {key:'service',bot:["Habari! 👋 Welcome to Webtech Solutions. I'm the AI assistant.","What can we help you build?"],
     chips:['A new website','SEO / Google ranking','Branding & logo','An AI agent','Something else']},
    {key:'name',bot:["Great choice. And what's your name?"],type:'text',placeholder:'Type your name…'},
    {key:'business',bot:(d)=>["Asante, "+d.name.split(' ')[0]+"! What's the name of your business?"],type:'text',placeholder:'Business name…'},
    {key:'budget',bot:["Roughly what budget range are you working with? (Just to point you to the right option — no pressure.)"],
     chips:['Just exploring','Under KES 100k','KES 100k – 500k','500k+']},
    {key:'timeline',bot:["When are you hoping to start?"],
     chips:['As soon as possible','Within a month','In 1–3 months','Just planning']},
    {key:'contact',bot:["Perfect. Last thing — what's the best phone or email to reach you on?"],type:'text',placeholder:'Phone or email…'}
  ];

  function scroll(){body.scrollTop=body.scrollHeight;}
  function addBot(text){const d=document.createElement('div');d.className='lmsg bot';d.textContent=text;body.appendChild(d);scroll();}
  function addUser(text){const d=document.createElement('div');d.className='lmsg user';d.textContent=text;body.appendChild(d);scroll();}
  function typing(){const t=document.createElement('div');t.className='typing';t.innerHTML='<i></i><i></i><i></i>';body.appendChild(t);scroll();return t;}

  function isQuestion(text){return /\?/.test(text);}

  async function handleAiAside(text,s){
    addUser(text);
    clearInput();
    const t=typing();
    const result=window.WebtechAI?await window.WebtechAI.ask({message:text,step:s.key}):null;
    await new Promise(r=>setTimeout(r,260));
    t.remove();
    if(result&&result.reply){addBot(result.reply);}
    else{addBot("Hmm, I can't quite answer that right now — but our team can! Tap WhatsApp below or just continue and we'll follow up personally.");}
    await new Promise(r=>setTimeout(r,200));
    renderControls(s);
  }

  function setBar(){bar.style.width=Math.round((step/flow.length)*100)+'%';}

  async function botSay(lines,after){
    for(const line of lines){
      const t=typing();
      await new Promise(r=>setTimeout(r,520));
      t.remove();
      addBot(line);
      await new Promise(r=>setTimeout(r,260));
    }
    after&&after();
  }

  function clearInput(){input.innerHTML='';}

  function renderStep(){
    setBar();
    if(step>=flow.length){return finish();}
    const s=flow[step];
    const lines=typeof s.bot==='function'?s.bot(data):s.bot;
    clearInput();
    botSay(lines,()=>renderControls(s));
  }

  function renderControls(s){
    clearInput();
    if(s.chips){
      const wrap=document.createElement('div');wrap.className='lead-chips';
      s.chips.forEach(c=>{
        const b=document.createElement('button');b.className='lchip';b.type='button';b.textContent=c;
        b.onclick=()=>{data[s.key]=c;addUser(c);step++;renderStep();};
        wrap.appendChild(b);
      });
      input.appendChild(wrap);

      const askToggle=document.createElement('button');askToggle.type='button';askToggle.className='lead-ask-toggle';askToggle.textContent='Have a question instead?';
      const askWrap=document.createElement('div');askWrap.className='lead-ask';
      const askField=document.createElement('div');askField.className='lead-field';
      const askInput=document.createElement('input');askInput.type='text';askInput.placeholder='Ask us anything…';
      const askBtn=document.createElement('button');askBtn.className='lead-send';askBtn.type='button';
      askBtn.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2 11 13M22 2l-7 20-4-9-9-4Z"/></svg>';
      const askSubmit=()=>{const v=askInput.value.trim();if(!v)return;handleAiAside(v,s);};
      askBtn.onclick=askSubmit;
      askInput.addEventListener('keydown',e=>{if(e.key==='Enter')askSubmit();});
      askField.appendChild(askInput);askField.appendChild(askBtn);askWrap.appendChild(askField);
      askToggle.onclick=()=>askWrap.classList.toggle('open');
      input.appendChild(askToggle);input.appendChild(askWrap);
    }else{
      const f=document.createElement('div');f.className='lead-field';
      const inp=document.createElement('input');inp.type='text';inp.placeholder=s.placeholder||'Type here…';
      const btn=document.createElement('button');btn.className='lead-send';btn.type='button';
      btn.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2 11 13M22 2l-7 20-4-9-9-4Z"/></svg>';
      const submit=()=>{const v=inp.value.trim();if(!v)return;if(isQuestion(v)){handleAiAside(v,s);return;}data[s.key]=v;addUser(v);step++;renderStep();};
      btn.onclick=submit;
      inp.addEventListener('keydown',e=>{if(e.key==='Enter')submit();});
      f.appendChild(inp);f.appendChild(btn);input.appendChild(f);
      setTimeout(()=>inp.focus(),100);
    }
  }

  function finish(){
    bar.style.width='100%';
    const sum=document.createElement('div');sum.className='lmsg summary';
    sum.innerHTML='<b>✅ Lead captured — asante sana!</b>'+
      '<ul>'+
      '<li><b>Service</b> '+(data.service||'—')+'</li>'+
      '<li><b>Name</b> '+(data.name||'—')+'</li>'+
      '<li><b>Business</b> '+(data.business||'—')+'</li>'+
      '<li><b>Budget</b> '+(data.budget||'—')+'</li>'+
      '<li><b>Timeline</b> '+(data.timeline||'—')+'</li>'+
      '<li><b>Contact</b> '+(data.contact||'—')+'</li>'+
      '</ul>';
    body.appendChild(sum);scroll();

    const sendPromise=window.WebtechForms?window.WebtechForms.submit({
      subject:'New AI chat lead — Webtech Solutions website',
      from_name:data.name||'Website visitor',
      service:data.service||'',
      name:data.name||'',
      business:data.business||'',
      budget:data.budget||'',
      timeline:data.timeline||'',
      contact:data.contact||''
    }):Promise.resolve(false);

    botSay(["That's everything our team needs. We'll reach out shortly — usually within a few hours.","Want to send this straight to us on WhatsApp now?"],async ()=>{
      const sent=await sendPromise;
      clearInput();
      const msg=encodeURIComponent('Hi Webtech! New enquiry via your AI form:\n• Service: '+(data.service||'')+'\n• Name: '+(data.name||'')+'\n• Business: '+(data.business||'')+'\n• Budget: '+(data.budget||'')+'\n• Timeline: '+(data.timeline||'')+'\n• Contact: '+(data.contact||''));
      const row=document.createElement('div');row.className='lead-chips';
      const wa=document.createElement('a');wa.className='lead-continue wa';wa.href='https://wa.me/'+WA+'?text='+msg;wa.target='_blank';wa.rel='noopener';
      wa.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.4 8.4 0 0 1-12.3 7.5L3 21l2-5.7A8.4 8.4 0 1 1 21 11.5Z"/></svg> Send on WhatsApp';
      const again=document.createElement('button');again.className='lead-restart';again.type='button';again.textContent='Start over';
      again.onclick=()=>{body.innerHTML='';for(const k in data)delete data[k];step=0;renderStep();};
      row.appendChild(wa);row.appendChild(again);input.appendChild(row);
      if(!sent){
        const note=document.createElement('div');note.className='lmsg bot';
        note.textContent="Heads up — please also tap WhatsApp below so we don't miss your details.";
        body.appendChild(note);scroll();
      }
    });
  }

  let started=false;
  const io=new IntersectionObserver((e)=>{e.forEach(x=>{if(x.isIntersecting&&!started){started=true;renderStep();io.disconnect();}});},{threshold:.3});
  io.observe(document.querySelector('.lead-chat'));
})();
