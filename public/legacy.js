window.BenOzLegacyRuntime?.destroy?.();
window.BenOzLegacyRuntime=(()=>{
let cleanup=null;
function init(){
  if(cleanup) return;
  const listeners=[];
  const timers=new Set();
  const frames=new Set();
  const observers=[];
  const nativeAdd=EventTarget.prototype.addEventListener;
  const originalLang=document.documentElement.lang;
  const originalDir=document.documentElement.dir;
  const originalImages=[...document.querySelectorAll('img')].map(img=>({img,alt:img.getAttribute('alt'),loading:img.getAttribute('loading'),decoding:img.getAttribute('decoding'),draggable:img.getAttribute('draggable')}));
  EventTarget.prototype.addEventListener=function(type,handler,options){
    nativeAdd.call(this,type,handler,options);
    listeners.push([this,type,handler,options]);
  };
  const schedule=(callback,delay)=>{
    const timer=window.setTimeout(()=>{timers.delete(timer);callback()},delay);
    timers.add(timer);
    return timer;
  };
  const scheduleFrame=(callback)=>{
    const frame=window.requestAnimationFrame(()=>{frames.delete(frame);callback()});
    frames.add(frame);
    return frame;
  };

try{
const museumLoader=document.getElementById('museumLoader');
window.addEventListener('load',()=>schedule(()=>museumLoader?.classList.add('is-hidden'),1100));
schedule(()=>museumLoader?.classList.add('is-hidden'),2200);

document.querySelectorAll('img').forEach((img,i)=>{
  if(i>2 && !img.hasAttribute('loading')) img.loading='lazy';
  img.decoding='async';
});

const entry=document.getElementById('entry');
const site=document.getElementById('site');
const projectHub=document.getElementById('projectHub');

const langBtn=document.getElementById('langBtn');
const originalLangLabel=langBtn.textContent;
const requestedLanguage=new URLSearchParams(location.search).get('lang')==='he'?'he':'en';
document.body.classList.toggle('en',requestedLanguage==='en');
document.documentElement.lang=requestedLanguage;
document.documentElement.dir=requestedLanguage==='he'?'rtl':'ltr';
langBtn.textContent=requestedLanguage==='en'?'עברית':'English';
document.querySelectorAll('[data-alt-en][data-alt-he]').forEach(img=>{
  img.alt=requestedLanguage==='en'?img.dataset.altEn:img.dataset.altHe;
});
langBtn.addEventListener('click',()=>{
  document.body.classList.toggle('en');
  const en=document.body.classList.contains('en');
  const language=en?'en':'he';
  document.documentElement.lang=language;
  document.documentElement.dir=en?'ltr':'rtl';
  langBtn.textContent=en?'עברית':'English';
  const url=new URL(location.href);
  if(en) url.searchParams.delete('lang'); else url.searchParams.set('lang','he');
  history.replaceState(history.state,'',`${url.pathname}${url.search}${url.hash}`);
  document.querySelectorAll('[data-alt-en][data-alt-he]').forEach(img=>{
    img.alt=en?img.dataset.altEn:img.dataset.altHe;
  });
  if(lightbox.classList.contains('open')) lbImg.alt=artImages[current]?.alt || '';
  window.dispatchEvent(new CustomEvent('benoz:languagechange',{detail:{language}}));
});

const observer=new IntersectionObserver(entries=>{
  entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('show')});
},{threshold:.1});
observers.push(observer);
document.querySelectorAll('.fade').forEach(el=>observer.observe(el));

const allArtImages=[...document.querySelectorAll('.art-media img')];
let artImages=allArtImages;
const lightbox=document.getElementById('lightbox');
const lbImg=lightbox.querySelector('img');
let current=0;
let lightboxOpener=null;
let lightboxLoadId=0;
let pendingDetailImage=null;
const interactionRoots=[entry,site,projectHub].filter(Boolean);
interactionRoots.forEach(element=>{element.inert=false});
function cancelPendingDetailImage(){
  if(!pendingDetailImage) return;
  pendingDetailImage.onload=null;
  pendingDetailImage.onerror=null;
  pendingDetailImage.removeAttribute('src');
  pendingDetailImage=null;
}
function closeLightbox(){
  const wasOpen=lightbox.classList.contains('open');
  lightboxLoadId+=1;
  cancelPendingDetailImage();
  lightbox.classList.remove('open');
  lightbox.setAttribute('aria-hidden','true');
  interactionRoots.forEach(element=>{element.inert=false});
  document.body.classList.remove('lightbox-open');
  document.body.classList.toggle('locked',entry?.classList.contains('active'));
  lbImg.removeAttribute('src');
  if(wasOpen && lightboxOpener?.isConnected) lightboxOpener.focus?.();
  lightboxOpener=null;
}
function showImage(i){
  if(!artImages.length) return;
  cancelPendingDetailImage();
  const opening=!lightbox.classList.contains('open');
  if(opening) lightboxOpener=document.activeElement;
  current=(i+artImages.length)%artImages.length;
  const sourceImage=artImages[current];
  const previewSrc=sourceImage.currentSrc || sourceImage.src;
  const fullSrc=sourceImage.dataset.fullSrc || previewSrc;
  const loadId=++lightboxLoadId;
  lbImg.src=previewSrc;
  lbImg.alt=sourceImage.alt;
  lightbox.classList.add('open');
  lightbox.setAttribute('aria-hidden','false');
  document.body.classList.add('locked','lightbox-open');
  if(opening) lightbox.querySelector('.close').focus();

  if(fullSrc!==previewSrc){
    const detailImage=new Image();
    pendingDetailImage=detailImage;
    detailImage.decoding='async';
    let decoded;
    if(typeof detailImage.decode==='function'){
      detailImage.src=fullSrc;
      decoded=detailImage.decode();
    }else{
      decoded=new Promise((resolve,reject)=>{
        detailImage.onload=resolve;
        detailImage.onerror=reject;
      });
      detailImage.src=fullSrc;
    }
    decoded.then(()=>{
      if(loadId===lightboxLoadId && lightbox.classList.contains('open')) lbImg.src=fullSrc;
      if(pendingDetailImage===detailImage) pendingDetailImage=null;
    }).catch(()=>{
      if(pendingDetailImage===detailImage) pendingDetailImage=null;
    });
  }
}
function openArtworkImage(img){
  const collectionId=img.closest('.artwork')?.dataset.collectionId;
  artImages=allArtImages.filter(candidate=>candidate.closest('.artwork')?.dataset.collectionId===collectionId);
  showImage(artImages.indexOf(img));
}
allArtImages.forEach(img=>img.addEventListener('click',()=>openArtworkImage(img)));
lightbox.querySelector('.close').addEventListener('click',closeLightbox);
lightbox.querySelector('.prev').addEventListener('click',e=>{e.stopPropagation();showImage(current-1)});
lightbox.querySelector('.next').addEventListener('click',e=>{e.stopPropagation();showImage(current+1)});
lightbox.addEventListener('click',e=>{if(e.target===lightbox)closeLightbox()});
window.addEventListener('pagehide',closeLightbox);
window.addEventListener('popstate',closeLightbox);
document.addEventListener('keydown',e=>{
  if(!lightbox.classList.contains('open'))return;
  if(e.key==='Escape') closeLightbox();
  if(e.key==='ArrowLeft')showImage(current-1);
  if(e.key==='ArrowRight')showImage(current+1);
  if(e.key==='Tab'){
    const focusable=[...lightbox.querySelectorAll('button:not([disabled]),[href],input:not([disabled]),[tabindex]:not([tabindex="-1"])')];
    const first=focusable[0];
    const last=focusable[focusable.length-1];
    if(e.shiftKey && document.activeElement===first){e.preventDefault();last?.focus()}
    else if(!e.shiftKey && document.activeElement===last){e.preventDefault();first?.focus()}
  }
});

document.addEventListener('contextmenu',e=>{
  if(e.target instanceof Element && e.target.closest('img,.art-media'))e.preventDefault();
});
document.addEventListener('dragstart',e=>{
  if(e.target instanceof Element && e.target.closest('img'))e.preventDefault();
});



// RC12: discourage iOS Safari long-press saving while preserving normal taps.
allArtImages.forEach(img=>{
  const media=img.closest('.art-media');
  if(!media || media.querySelector('.image-shield')) return;
  img.setAttribute('draggable','false');
  const shield=document.createElement('span');
  shield.className='image-shield';
  shield.setAttribute('aria-label',img.alt || 'View artwork');
  shield.setAttribute('role','button');
  shield.tabIndex=0;
  shield.addEventListener('click',()=>openArtworkImage(img));
  shield.addEventListener('keydown',e=>{
    if(e.key==='Enter' || e.key===' '){e.preventDefault();openArtworkImage(img)}
  });
  shield.addEventListener('contextmenu',e=>e.preventDefault());
  media.appendChild(shield);
});

['contextmenu','dragstart','selectstart'].forEach(type=>{
  document.addEventListener(type,e=>{
    if(
      e.target instanceof Element
      && e.target.closest('.art-media,.image-shield,.lb-stage,.lightbox img')
    ) e.preventDefault();
  },{capture:true});
});

// Artwork section navigation.
const artworkSections=[...document.querySelectorAll('.artwork')];
const artworkSectionsByCollection=new Map();
artworkSections.forEach(section=>{
  const collectionSections=artworkSectionsByCollection.get(section.dataset.collectionId) || [];
  collectionSections.push(section);
  artworkSectionsByCollection.set(section.dataset.collectionId,collectionSections);
});
artworkSections.forEach(section=>{
  const collectionSections=artworkSectionsByCollection.get(section.dataset.collectionId);
  const index=collectionSections.indexOf(section);
  const prev=section.querySelector('.art-prev');
  const next=section.querySelector('.art-next');
  if(prev) prev.disabled=index===0;
  if(next) next.disabled=index===collectionSections.length-1;
  prev?.addEventListener('click',()=>collectionSections[index-1]?.scrollIntoView({behavior:'smooth',block:'center'}));
  next?.addEventListener('click',()=>collectionSections[index+1]?.scrollIntoView({behavior:'smooth',block:'center'}));
});

// Enhanced lightbox zoom, live percentage, desktop controls and mobile pinch.
const lbStage=lightbox.querySelector('.lb-stage');
const lbCount=lightbox.querySelector('.lb-count');
const zoomLabel=lightbox.querySelector('.zoom-reset');
let zoom=1;
let startX=0;
let pinchStartDistance=0;
let pinchStartZoom=1;
let pinching=false;

function touchDistance(touches){
  const dx=touches[0].clientX-touches[1].clientX;
  const dy=touches[0].clientY-touches[1].clientY;
  return Math.hypot(dx,dy);
}
function applyZoom(){
  zoom=Math.max(1,Math.min(4,zoom));
  lbImg.style.transform=`scale(${zoom})`;
  lbImg.style.cursor=zoom>1?'zoom-out':'zoom-in';
  zoomLabel.textContent=`${Math.round(zoom*100)}%`;
}
function resetZoom(){
  zoom=1;
  applyZoom();
}
const originalShowImage=showImage;
showImage=function(i){
  originalShowImage(i);
  resetZoom();
  lbCount.textContent=`${current+1} / ${artImages.length}`;
}
lightbox.querySelector('.zoom-in').addEventListener('click',()=>{
  zoom=Math.min(4,zoom+.25);
  applyZoom();
});
lightbox.querySelector('.zoom-out').addEventListener('click',()=>{
  zoom=Math.max(1,zoom-.25);
  applyZoom();
});
zoomLabel.addEventListener('click',resetZoom);
lbImg.addEventListener('dblclick',()=>{
  zoom=zoom===1?2:1;
  applyZoom();
});
lbStage.addEventListener('wheel',e=>{
  e.preventDefault();
  zoom=Math.max(1,Math.min(4,zoom+(e.deltaY<0?.15:-.15)));
  applyZoom();
},{passive:false});

lbStage.addEventListener('touchstart',e=>{
  if(e.touches.length===2){
    pinching=true;
    pinchStartDistance=touchDistance(e.touches);
    pinchStartZoom=zoom;
    e.preventDefault();
    return;
  }
  if(e.touches.length===1){
    pinching=false;
    startX=e.touches[0].clientX;
  }
},{passive:false});

lbStage.addEventListener('touchmove',e=>{
  if(e.touches.length===2){
    if(!pinching){
      pinching=true;
      pinchStartDistance=touchDistance(e.touches);
      pinchStartZoom=zoom;
    }
    const distance=touchDistance(e.touches);
    if(pinchStartDistance>0){
      zoom=pinchStartZoom*(distance/pinchStartDistance);
      applyZoom();
    }
    e.preventDefault();
  }
},{passive:false});

lbStage.addEventListener('touchend',e=>{
  if(pinching){
    if(e.touches.length<2) pinching=false;
    return;
  }
  if(e.changedTouches.length!==1 || zoom>1.01) return;
  const dx=e.changedTouches[0].clientX-startX;
  if(Math.abs(dx)>55){
    dx<0?showImage(current+1):showImage(current-1);
  }
},{passive:true});
lbStage.addEventListener('touchcancel',()=>{pinching=false});
lbStage.addEventListener('click',e=>{
  if(e.target===lbStage && zoom<=1.01) closeLightbox();
});


// Subtle pointer parallax for the gallery opening.
const parallaxItems=[...document.querySelectorAll('.parallax-item')];
const heroSections=[...document.querySelectorAll('.hero')];
if(window.matchMedia('(hover:hover)').matches && !window.matchMedia('(prefers-reduced-motion: reduce)').matches){
  heroSections.forEach(heroSection=>{
    const heroParallaxItems=[...heroSection.querySelectorAll('.parallax-item')];
    let parallaxFrame=null;
    let pointerEvent=null;
    heroSection.addEventListener('mousemove',e=>{
      pointerEvent=e;
      if(parallaxFrame) return;
      parallaxFrame=scheduleFrame(()=>{
        parallaxFrame=null;
        const r=heroSection.getBoundingClientRect();
        const x=(pointerEvent.clientX-r.left)/r.width-.5;
        const y=(pointerEvent.clientY-r.top)/r.height-.5;
        heroParallaxItems.forEach((el,i)=>{
          const depth=(i+1)*1.4;
          el.style.transform=`translate(${x*depth}px,${y*depth}px)`;
        });
      });
    });
    heroSection.addEventListener('mouseleave',()=>{
      heroParallaxItems.forEach(el=>el.style.transform='translate(0,0)');
    });
  });
}

// Very quiet generated ambient sound, enabled only after user interaction.
const soundBtn=document.getElementById('soundBtn');
const originalSoundLabel=soundBtn.textContent;
let audioCtx=null;
let ambientGain=null;
let ambientOn=false;
let noiseSource=null;

function createAmbient(){
  if(audioCtx) return;
  audioCtx=new (window.AudioContext||window.webkitAudioContext)();
  ambientGain=audioCtx.createGain();
  ambientGain.gain.value=0.028;
  ambientGain.connect(audioCtx.destination);

  const bufferSize=audioCtx.sampleRate*4;
  const buffer=audioCtx.createBuffer(1,bufferSize,audioCtx.sampleRate);
  const data=buffer.getChannelData(0);
  for(let i=0;i<bufferSize;i++){
    data[i]=(Math.random()*2-1)*0.22;
  }

  noiseSource=audioCtx.createBufferSource();
  noiseSource.buffer=buffer;
  noiseSource.loop=true;

  const lowpass=audioCtx.createBiquadFilter();
  lowpass.type='lowpass';
  lowpass.frequency.value=520;

  const highpass=audioCtx.createBiquadFilter();
  highpass.type='highpass';
  highpass.frequency.value=90;

  noiseSource.connect(lowpass).connect(highpass).connect(ambientGain);
  noiseSource.start();
}

async function setAmbient(on){
  createAmbient();
  if(audioCtx.state==='suspended') await audioCtx.resume();
  ambientOn=on;
  ambientGain.gain.cancelScheduledValues(audioCtx.currentTime);
  ambientGain.gain.linearRampToValueAtTime(on?0.028:0,audioCtx.currentTime+.35);
  soundBtn.classList.toggle('is-on',on);
  soundBtn.setAttribute('aria-pressed',String(on));
  soundBtn.textContent=on?'◉':'◌';
}

soundBtn.addEventListener('click',()=>setAmbient(!ambientOn).catch(()=>{}));

// Start ambient softly after entering the gallery.
document.getElementById('enterBtn').addEventListener('click',()=>{
  schedule(()=>setAmbient(true).catch(()=>{}),450);
});


// RC16: restored direct artwork-to-music links with two-line labels.
// RC13: compact mobile navigation, QR-ready deep links and horizontal artwork swipes.
const topbar=document.querySelector('.topbar');
const mobileMenuBtn=document.getElementById('mobileMenuBtn');
const mainMenu=document.getElementById('mainMenu');
function closeMobileMenu(){
  topbar?.classList.remove('menu-open');
  mobileMenuBtn?.setAttribute('aria-expanded','false');
  if(mobileMenuBtn) mobileMenuBtn.textContent='☰';
}
mobileMenuBtn?.addEventListener('click',()=>{
  const open=!topbar.classList.contains('menu-open');
  topbar.classList.toggle('menu-open',open);
  mobileMenuBtn.setAttribute('aria-expanded',String(open));
  mobileMenuBtn.textContent=open?'×':'☰';
});
mainMenu?.querySelectorAll('a,button').forEach(item=>item.addEventListener('click',closeMobileMenu));
document.addEventListener('click',e=>{
  if(topbar?.classList.contains('menu-open') && !topbar.contains(e.target)) closeMobileMenu();
});

const artworkBySlug=new Map(artworkSections.map(section=>[section.dataset.artworkSlug,section]));
function openGalleryAt(section, smooth=false){
  scheduleFrame(()=>section?.scrollIntoView({behavior:smooth?'smooth':'auto',block:'start'}));
}
function handleArtworkHash(){
  const slug=decodeURIComponent(location.hash.slice(1));
  const section=artworkBySlug.get(slug);
  if(section) openGalleryAt(section,false);
}
window.addEventListener('hashchange',handleArtworkHash);
if(location.hash && artworkBySlug.has(decodeURIComponent(location.hash.slice(1)))){
  handleArtworkHash();
}

artworkSections.forEach(section=>{
  const collectionSections=artworkSectionsByCollection.get(section.dataset.collectionId);
  const index=collectionSections.indexOf(section);
  let sx=0,sy=0;
  section.addEventListener('touchstart',e=>{
    if(e.touches.length!==1)return;
    sx=e.touches[0].clientX;sy=e.touches[0].clientY;
  },{passive:true});
  section.addEventListener('touchend',e=>{
    if(e.changedTouches.length!==1 || lightbox.classList.contains('open'))return;
    const dx=e.changedTouches[0].clientX-sx;
    const dy=e.changedTouches[0].clientY-sy;
    if(Math.abs(dx)<70 || Math.abs(dx)<Math.abs(dy)*1.35)return;
    const target=dx<0?collectionSections[index+1]:collectionSections[index-1];
    if(target){
      history.replaceState(history.state,'','#'+target.dataset.artworkSlug);
      target.scrollIntoView({behavior:'smooth',block:'start'});
    }
  },{passive:true});
});

// Keep a shareable artwork URL while browsing the exhibition.
const hashObserver=new IntersectionObserver(entries=>{
  const visible=entries.filter(e=>e.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];
  if(visible?.target?.dataset.artworkSlug && site.classList.contains('active')){
    history.replaceState(history.state,'','#'+visible.target.dataset.artworkSlug);
  }
},{threshold:[.45,.65]});
observers.push(hashObserver);
artworkSections.forEach(section=>hashObserver.observe(section));

cleanup=()=>{
  listeners.reverse().forEach(([target,type,handler,options])=>target.removeEventListener(type,handler,options));
  timers.forEach(timer=>window.clearTimeout(timer));
  frames.forEach(frame=>window.cancelAnimationFrame(frame));
  observers.forEach(activeObserver=>activeObserver.disconnect());
  closeLightbox();
  document.querySelectorAll('video').forEach(video=>video.pause());
  document.querySelectorAll('.image-shield').forEach(shield=>shield.remove());
  document.querySelectorAll('.fade.show').forEach(element=>element.classList.remove('show'));
  closeMobileMenu();
  parallaxItems.forEach(element=>{element.style.transform=''});
  lbImg.removeAttribute('src');
  lbImg.removeAttribute('alt');
  lbImg.style.transform='';
  lbImg.style.cursor='';
  artworkSections.forEach(section=>{
    const prev=section.querySelector('.art-prev');
    const next=section.querySelector('.art-next');
    if(prev) prev.disabled=false;
    if(next) next.disabled=false;
  });
  langBtn.textContent=originalLangLabel;
  soundBtn.textContent=originalSoundLabel;
  soundBtn.classList.remove('is-on');
  soundBtn.setAttribute('aria-pressed','false');
  originalImages.forEach(({img,alt,loading,decoding,draggable})=>{
    if(alt===null) img.removeAttribute('alt'); else img.setAttribute('alt',alt);
    if(loading===null) img.removeAttribute('loading'); else img.setAttribute('loading',loading);
    if(decoding===null) img.removeAttribute('decoding'); else img.setAttribute('decoding',decoding);
    if(draggable===null) img.removeAttribute('draggable'); else img.setAttribute('draggable',draggable);
  });
  try{noiseSource?.stop()}catch{}
  audioCtx?.close().catch(()=>{});
  document.documentElement.lang=originalLang;
  document.documentElement.dir=originalDir;
};
}catch(error){
  listeners.reverse().forEach(([target,type,handler,options])=>target.removeEventListener(type,handler,options));
  timers.forEach(timer=>window.clearTimeout(timer));
  frames.forEach(frame=>window.cancelAnimationFrame(frame));
  observers.forEach(activeObserver=>activeObserver.disconnect());
  document.querySelectorAll('.image-shield').forEach(shield=>shield.remove());
  originalImages.forEach(({img,alt,loading,decoding,draggable})=>{
    if(alt===null) img.removeAttribute('alt'); else img.setAttribute('alt',alt);
    if(loading===null) img.removeAttribute('loading'); else img.setAttribute('loading',loading);
    if(decoding===null) img.removeAttribute('decoding'); else img.setAttribute('decoding',decoding);
    if(draggable===null) img.removeAttribute('draggable'); else img.setAttribute('draggable',draggable);
  });
  throw error;
}finally{
  EventTarget.prototype.addEventListener=nativeAdd;
}
}
function destroy(){
  cleanup?.();
  cleanup=null;
}
return {init,destroy};
})();
