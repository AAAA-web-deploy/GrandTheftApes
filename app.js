(() => {
  const config = window.GTA_CONFIG || {};
  const safeUrl = value => { try { const url = new URL(value); return ['https:', 'http:'].includes(url.protocol) ? url.href : ''; } catch { return ''; } };
  const buyUrl = safeUrl(config.buyUrl);
  document.querySelectorAll('.js-buy').forEach(link => {
    if (buyUrl) { link.href = buyUrl; link.target = '_blank'; link.rel = 'noopener noreferrer'; }
    else { link.title = 'The purchase link is coming soon'; link.setAttribute('aria-label', 'Buy $GTA — purchase link coming soon; view token information'); }
  });
  const socialKeys = { telegram: 'telegramUrl', x: 'xUrl', discord: 'discordUrl' };
  document.querySelectorAll('.js-social').forEach(button => {
    const name = button.dataset.social;
    const url = safeUrl(config[socialKeys[name]]);
    const label = name === 'x' ? 'X' : name[0].toUpperCase() + name.slice(1);
    if (url) { button.disabled = false; button.setAttribute('aria-label', `Open ${label}`); button.addEventListener('click', () => window.open(url, '_blank', 'noopener,noreferrer')); }
    else { button.disabled = true; button.title = 'Coming soon'; button.setAttribute('aria-label', `${label} coming soon`); }
  });
  const contract = /^0x[a-fA-F0-9]{40}$/.test(config.contractAddress || '') ? config.contractAddress : '';
  const display = document.getElementById('contract-display');
  const homeAddress = document.getElementById('contract-home');
  if (contract) {
    display.textContent = `${contract.slice(0, 6)}…${contract.slice(-4)}`;
    display.title = contract;
    if (homeAddress) homeAddress.textContent = contract;
  } else {
    if (display) display.textContent = 'COMING SOON';
    if (homeAddress) homeAddress.textContent = 'COMING SOON';
    document.querySelectorAll('.js-copy-ca').forEach(button => {
      button.disabled = true;
      button.title = 'Coming soon';
      button.setAttribute('aria-label', 'Contract address coming soon');
    });
  }
  const copyStatus = document.getElementById('copy-status');
  async function copyContract(button) {
    try {
      await navigator.clipboard.writeText(contract);
    } catch {
      const area = document.createElement('textarea');
      area.value = contract;
      area.setAttribute('readonly', '');
      area.style.position = 'fixed';
      area.style.left = '-9999px';
      document.body.append(area);
      area.select();
      document.execCommand('copy');
      area.remove();
    }
    const previous = button.textContent;
    const icon = button.querySelector('img');
    button.classList.add('copied');
    button.setAttribute('aria-label', 'Contract address copied');
    if (!icon) button.textContent = 'COPIED';
    if (copyStatus) copyStatus.textContent = 'Contract address copied';
    window.setTimeout(() => {
      button.classList.remove('copied');
      button.setAttribute('aria-label', icon ? 'Copy contract address' : 'Copy CA');
      if (!icon) button.textContent = previous;
      if (copyStatus) copyStatus.textContent = '';
    }, 1600);
  }
  if (contract) document.querySelectorAll('.js-copy-ca').forEach(button => button.addEventListener('click', () => copyContract(button)));

  const collections = [
    {title:'Iconic Moments',badge:'iconic_moments',folder:'01_iconic_moments',files:['01_chase','02_aftermath','03_celebration','04_helicopter','05_mission_map','06_escape']},
    {title:'Vice City',badge:'vice_city',folder:'02_vice_city',files:['01_boulevard','02_convertible','03_rooftop','04_airboat','05_motel','06_motorcycles']},
    {title:'San Andreas',badge:'san_andreas',folder:'03_san_andreas',files:['01_lowrider_hero','02_neighborhood','03_lowrider_angle','04_bicycle','05_underpass','06_city_overlook']},
    {title:'The Ape Crew',badge:'the_ape_crew',folder:'04_the_ape_crew',files:['01_lead','02_partner','03_bandana','04_shirts','05_planning','06_crew']},
    {title:'Heists & Getaways',badge:'heists_getaways',folder:'05_heists_and_getaways',files:['01_planning','02_bank','03_driver','04_escape','05_pursuit','06_afterward']},
    {title:'Between Missions',badge:'between_missions',folder:'06_between_missions',files:['01_diner','02_gas_station','03_beach','04_convenience_store','05_drive','06_conversation']},
    {title:'GTA Posters',badge:'gta_posters',folder:'07_gta_posters',files:['01_crew_poster','02_lead_poster','03_masked_crew','04_convertible_poster','05_lowrider_poster','06_wanted_portrait']}
  ];
  const container=document.getElementById('gallery-rows');
  const dialog=document.getElementById('lightbox');
  const image=document.getElementById('lightbox-image');
  const motionToggle=document.querySelector('.motion-toggle');
  const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
  let scrolling=!reducedMotion.matches, lastFrame=0;
  const scrollingRows=[];
  function updateMotionButton(){motionToggle.textContent=scrolling?'PAUSE SCROLL':'PLAY SCROLL';motionToggle.setAttribute('aria-pressed',String(!scrolling));}
  motionToggle.addEventListener('click',()=>{scrolling=!scrolling;lastFrame=0;updateMotionButton()});
  updateMotionButton();
  let activeCollection=0, activeImage=0;
  const nameOf = file => file.slice(3).replaceAll('_',' ');
  const pathOf = (group,index) => `assets-gallery/${group.folder}/${group.files[index]}.jpg`;
  function showImage(groupIndex,index) {
    activeCollection=groupIndex;activeImage=index;
    const group=collections[groupIndex];
    image.src=pathOf(group,index);image.alt=`${group.title}: ${nameOf(group.files[index])}`;
    document.getElementById('lightbox-caption').textContent=image.alt;
    document.getElementById('lightbox-count').textContent=`${index+1} / ${group.files.length}`;
    if (!dialog.open) dialog.showModal();
  }
  collections.forEach((group,groupIndex)=>{
    const row=document.createElement('div');row.className='gallery-row';row.setAttribute('aria-label',`${group.title} gallery`);
    const spriteY=[1082,1138,1192,1246,1300,1349,1398][groupIndex];
    const label=document.createElement('div');label.className='category-image';label.setAttribute('role','img');label.setAttribute('aria-label',group.title);label.style.backgroundPosition=`0% ${spriteY/(1536-54)*100}%`;
    const previous=document.createElement('button');previous.type='button';previous.className='gallery-arrow';previous.textContent='‹';previous.setAttribute('aria-label',`Previous ${group.title} image`);
    const track=document.createElement('div');track.className='gallery-track';track.setAttribute('tabindex','0');track.setAttribute('aria-label',`${group.title}: scroll to see all six images`);
    const counter=document.createElement('span');counter.className='gallery-counter';counter.setAttribute('aria-live','polite');
    const next=document.createElement('button');next.type='button';next.className='gallery-arrow';next.textContent='›';next.setAttribute('aria-label',`Next ${group.title} image`);
    let selected=0;
    const maxStart=()=>{const first=track.children[0];if(!first)return group.files.length-1;const step=first.getBoundingClientRect().width+parseFloat(getComputedStyle(track).gap||0);return Math.min(group.files.length-1,Math.ceil((track.scrollWidth-track.clientWidth)/step));};
    const update=()=>{counter.textContent=`${selected+1} / ${group.files.length}`;previous.disabled=selected===0;next.disabled=selected>=maxStart();};
    const originalCards=[];
    group.files.forEach((file,index)=>{
      const card=document.createElement('button');card.className='art-card';card.type='button';card.setAttribute('aria-label',`Open ${group.title}: ${nameOf(file)}`);
      const img=document.createElement('img');img.loading='lazy';img.decoding='async';img.src=pathOf(group,index);img.alt='';card.append(img);
      if (groupIndex===0 && (index===0 || index===1)) {const overlay=document.createElement('span');overlay.className='card-overlay';overlay.textContent=index===1?'WASTED':'★★★★★';if(index===0)overlay.classList.add('stars');card.append(overlay);}
      card.addEventListener('click',()=>showImage(groupIndex,index));track.append(card);originalCards.push(card);
    });
    // A second visual copy makes a seamless loop without adding extra gallery items
    // to the accessibility tree or keyboard tab order.
    originalCards.forEach((card,index)=>{const copy=card.cloneNode(true);copy.setAttribute('aria-hidden','true');copy.tabIndex=-1;copy.addEventListener('click',()=>showImage(groupIndex,index));track.append(copy)});
    const move=increment=>{selected=Math.max(0,Math.min(maxStart(),selected+increment));const card=track.children[selected];track.scrollTo({left:card.offsetLeft-track.offsetLeft,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});update();};
    previous.addEventListener('click',()=>move(-1));next.addEventListener('click',()=>move(1));
    track.addEventListener('keydown',event=>{if(event.key==='ArrowRight'){event.preventDefault();move(1)}if(event.key==='ArrowLeft'){event.preventDefault();move(-1)}});
    track.addEventListener('scroll',()=>{const first=track.children[0];if(!first)return;const step=first.getBoundingClientRect().width+parseFloat(getComputedStyle(track).gap||0);const now=((Math.round(track.scrollLeft/step)%group.files.length)+group.files.length)%group.files.length;if(now!==selected && !track.matches(':focus-within')){selected=now;update()}},{passive:true});
    // Odd rows: content moves right to left. Even rows: left to right.
    const state={row,track,direction:groupIndex%2===0?1:-1,hover:false,focus:false,resumeAt:0,position:0,wasPlaying:false,initialized:false};
    row.addEventListener('pointerenter',()=>{state.hover=true});row.addEventListener('pointerleave',()=>{state.hover=false});
    row.addEventListener('pointerdown',()=>{state.resumeAt=Date.now()+5000});
    row.addEventListener('focusin',()=>{state.focus=true});row.addEventListener('focusout',event=>{if(!row.contains(event.relatedTarget))state.focus=false});
    scrollingRows.push(state);
    row.append(label,previous,track,counter,next);container.append(row);update();window.addEventListener('resize',()=>{selected=Math.min(selected,maxStart());update()});
  });
  function animateRows(time){
    const delta=lastFrame?Math.min(time-lastFrame,50):0;lastFrame=time;
    for(const state of scrollingRows){
      const {row,track}=state;const bounds=row.getBoundingClientRect();
      const playing=scrolling&&!dialog.open&&!document.hidden&&!state.hover&&!state.focus&&Date.now()>=state.resumeAt&&bounds.bottom>0&&bounds.top<innerHeight;
      track.classList.toggle('auto-running',playing);
      if(!playing){state.wasPlaying=false;continue;}
      const first=track.children[0],repeat=track.children[6];
      if(!first||!repeat)continue;
      const cycle=repeat.offsetLeft-first.offsetLeft;if(cycle<=0)continue;
      if(!state.initialized){if(state.direction<0)track.scrollLeft=cycle;state.initialized=true;}
      if(!state.wasPlaying){state.position=track.scrollLeft;state.wasPlaying=true;}
      let next=state.position+state.direction*delta*.018;
      next=((next%cycle)+cycle)%cycle;
      state.position=next;track.scrollLeft=next;
    }
    requestAnimationFrame(animateRows);
  }
  requestAnimationFrame(animateRows);
  document.querySelector('.lightbox-close').addEventListener('click',()=>dialog.close());
  document.getElementById('lightbox-previous').addEventListener('click',()=>showImage(activeCollection,(activeImage+5)%6));
  document.getElementById('lightbox-next').addEventListener('click',()=>showImage(activeCollection,(activeImage+1)%6));
  dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close()});
  dialog.addEventListener('keydown',e=>{if(e.key==='ArrowLeft')showImage(activeCollection,(activeImage+5)%6);if(e.key==='ArrowRight')showImage(activeCollection,(activeImage+1)%6)});
  const releaseTimer=document.getElementById('release-timer');
  if(releaseTimer){
    const parsed=/^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2})(?::(\d{2}))?)?/.exec(config.releaseAt||'2026-11-19T00:00:00');
    const releaseAt=parsed?new Date(+parsed[1],+parsed[2]-1,+parsed[3],+(parsed[4]||0),+(parsed[5]||0),+(parsed[6]||0)).getTime():new Date(2026,10,19).getTime();
    const units=['days','hours','minutes','seconds'].map(name=>releaseTimer.querySelector(`[data-timer="${name}"]`));
    const pad=value=>String(Math.max(0,value)).padStart(2,'0');
    const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
    const paint=card=>next=>{
      card.querySelectorAll('b').forEach(node=>{node.textContent=next});
    };
    const flipCard=(card,next,delay)=>{
      const sheet=card.querySelector('.card-sheet b');
      const front=card.querySelector('.flap-front b');
      const flap=card.querySelector('.card-flap');
      const current=front.textContent;
      const token=card._flip=(card._flip||0)+1;
      const commit=()=>{
        if(card._flip!==token) return;
        if(reducedMotion||current===next){paint(card)(next);return;}
        front.textContent=current;
        sheet.textContent=next;
        flap.classList.remove('is-flipping');
        void flap.offsetWidth;
        flap.classList.add('is-flipping');
        const finish=()=>{
          flap.removeEventListener('animationend',finish);
          if(card._flip!==token) return;
          front.textContent=next;
          flap.classList.remove('is-flipping');
        };
        flap.addEventListener('animationend',finish);
      };
      if(delay) window.setTimeout(commit,delay);
      else commit();
    };
    const tick=first=>{
      const left=releaseAt-Date.now();
      const total=Math.max(0,Math.floor(left/1000));
      const values=[
        pad(Math.floor(total/86400)),
        pad(Math.floor(total/3600)%24),
        pad(Math.floor(total/60)%60),
        pad(total%60)
      ];
      values.forEach((value,index)=>{
        const card=units[index];
        if(!card) return;
        if(first) paint(card)(value);
        else if(card.querySelector('.card-sheet b').textContent!==value) flipCard(card,value,(3-index)*90);
      });
      const label=releaseTimer.querySelector('strong');
      if(label) label.textContent=left<=0?'GTA VI IS LIVE':'GTA VI Release';
    };
    tick(true);
    window.setInterval(()=>tick(false),1000);
  }
  const siteVideos=document.querySelectorAll('.video-section video');
  siteVideos.forEach(video=>video.addEventListener('play',()=>{siteVideos.forEach(other=>{if(other!==video)other.pause()})}));
  const menu=document.querySelector('.menu-toggle'),nav=document.getElementById('main-nav');
  menu.addEventListener('click',()=>{const open=nav.classList.toggle('open');menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'Close navigation':'Open navigation')});
  nav.querySelectorAll('a, .js-copy-ca').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('open');menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','Open navigation')}));
})();
