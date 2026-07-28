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
  window.dispatchEvent(new CustomEvent('benoz:languagechange',{detail:{language}}));
});

const observer=new IntersectionObserver(entries=>{
  entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('show')});
},{threshold:.1});
observers.push(observer);
document.querySelectorAll('.fade').forEach(el=>observer.observe(el));

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

cleanup=()=>{
  listeners.reverse().forEach(([target,type,handler,options])=>target.removeEventListener(type,handler,options));
  timers.forEach(timer=>window.clearTimeout(timer));
  frames.forEach(frame=>window.cancelAnimationFrame(frame));
  observers.forEach(activeObserver=>activeObserver.disconnect());
  document.querySelectorAll('video').forEach(video=>video.pause());
  document.querySelectorAll('.fade.show').forEach(element=>element.classList.remove('show'));
  closeMobileMenu();
  parallaxItems.forEach(element=>{element.style.transform=''});
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
