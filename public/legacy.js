const museumLoader=document.getElementById('museumLoader');
window.addEventListener('load',()=>setTimeout(()=>museumLoader.classList.add('is-hidden'),1100));
setTimeout(()=>museumLoader.classList.add('is-hidden'),2200);

document.querySelectorAll('img').forEach((img,i)=>{
  if(i>2) img.loading='lazy';
  img.decoding='async';
});

// English is the default language on first load.
document.documentElement.lang='en';
document.documentElement.dir='ltr';

const entry=document.getElementById('entry');
const site=document.getElementById('site');
const projectHub=document.getElementById('projectHub');
document.getElementById('enterBtn').addEventListener('click',()=>{
  entry.style.display='none';
  projectHub?.classList.add('active');
  site.classList.remove('active');
  document.body.classList.remove('locked');
  window.scrollTo(0,0);
});

function openProject(target){
  projectHub?.classList.remove('active');
  site.classList.add('active');
  document.body.classList.remove('locked');
  requestAnimationFrame(()=>{
    const section=document.getElementById(target);
    if(section) section.scrollIntoView({behavior:'auto',block:'start'});
    else window.scrollTo(0,0);
  });
}
document.querySelectorAll('[data-project-target]').forEach(button=>{
  button.addEventListener('click',()=>{
    if(!projectHub?.classList.contains('active') || projectHub.classList.contains('is-leaving')) return;

    const target=button.dataset.projectTarget;
    const isPoster=button.classList.contains('museum-poster');

    if(!isPoster || window.matchMedia('(prefers-reduced-motion: reduce)').matches){
      openProject(target);
      return;
    }

    button.classList.add('is-selected');
    projectHub.classList.add('is-leaving');
    window.setTimeout(()=>{
      openProject(target);
      button.classList.remove('is-selected');
      projectHub.classList.remove('is-leaving');
    },520);
  });
});

const langBtn=document.getElementById('langBtn');
langBtn.addEventListener('click',()=>{
  document.body.classList.toggle('en');
  const en=document.body.classList.contains('en');
  document.documentElement.lang=en?'en':'he';
  document.documentElement.dir=en?'ltr':'rtl';
  langBtn.textContent=en?'עברית':'English';
});

const observer=new IntersectionObserver(entries=>{
  entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('show')});
},{threshold:.1});
document.querySelectorAll('.fade').forEach(el=>observer.observe(el));

const artImages=[...document.querySelectorAll('.art-media img')];
const lightbox=document.getElementById('lightbox');
const lbImg=lightbox.querySelector('img');
let current=0;
function showImage(i){
  current=(i+artImages.length)%artImages.length;
  lbImg.src=artImages[current].src;
  lightbox.classList.add('open');
  document.body.classList.add('locked');
}
artImages.forEach((img,i)=>img.addEventListener('click',()=>showImage(i)));
lightbox.querySelector('.close').addEventListener('click',()=>{lightbox.classList.remove('open');document.body.classList.remove('locked')});
lightbox.querySelector('.prev').addEventListener('click',e=>{e.stopPropagation();showImage(current-1)});
lightbox.querySelector('.next').addEventListener('click',e=>{e.stopPropagation();showImage(current+1)});
lightbox.addEventListener('click',e=>{if(e.target===lightbox){lightbox.classList.remove('open');document.body.classList.remove('locked')}});
document.addEventListener('keydown',e=>{
  if(!lightbox.classList.contains('open'))return;
  if(e.key==='Escape'){lightbox.classList.remove('open');document.body.classList.remove('locked')}
  if(e.key==='ArrowLeft')showImage(current-1);
  if(e.key==='ArrowRight')showImage(current+1);
});

const audios=[...document.querySelectorAll('audio')];
document.querySelectorAll('.track').forEach(track=>{
  const audio=track.querySelector('audio');
  const play=track.querySelector('.play');
  const range=track.querySelector('.range');
  const time=track.querySelector('.time');

  play.addEventListener('click',()=>{
    if(audio.paused){
      audios.forEach(a=>{if(a!==audio)a.pause()});
      audio.play();
    }else audio.pause();
  });
  audio.addEventListener('play',()=>play.textContent='❚❚');
  audio.addEventListener('pause',()=>play.textContent='▶');
  audio.addEventListener('timeupdate',()=>{
    range.value=audio.duration?audio.currentTime/audio.duration*100:0;
    const m=Math.floor(audio.currentTime/60);
    const s=Math.floor(audio.currentTime%60).toString().padStart(2,'0');
    time.textContent=`${m}:${s}`;
  });
  range.addEventListener('input',()=>{
    if(audio.duration) audio.currentTime=range.value/100*audio.duration;
  });
});

document.addEventListener('contextmenu',e=>{
  if(e.target.closest('img,.art-media'))e.preventDefault();
});
document.addEventListener('dragstart',e=>{
  if(e.target.closest('img'))e.preventDefault();
});



// RC12: discourage iOS Safari long-press saving while preserving normal taps.
artImages.forEach((img,index)=>{
  const media=img.closest('.art-media');
  if(!media || media.querySelector('.image-shield')) return;
  img.setAttribute('draggable','false');
  const shield=document.createElement('span');
  shield.className='image-shield';
  shield.setAttribute('aria-label',img.alt || 'View artwork');
  shield.setAttribute('role','button');
  shield.tabIndex=0;
  shield.addEventListener('click',()=>showImage(index));
  shield.addEventListener('keydown',e=>{
    if(e.key==='Enter' || e.key===' '){e.preventDefault();showImage(index)}
  });
  shield.addEventListener('contextmenu',e=>e.preventDefault());
  media.appendChild(shield);
});

['contextmenu','dragstart','selectstart'].forEach(type=>{
  document.addEventListener(type,e=>{
    if(e.target.closest('.art-media,.image-shield,.lb-stage,.lightbox img')) e.preventDefault();
  },{capture:true});
});

// Artwork section navigation.
const artworkSections=[...document.querySelectorAll('.artwork')];
artworkSections.forEach((section,index)=>{
  const prev=section.querySelector('.art-prev');
  const next=section.querySelector('.art-next');
  if(prev) prev.disabled=index===0;
  if(next) next.disabled=index===artworkSections.length-1;
  prev?.addEventListener('click',()=>artworkSections[index-1]?.scrollIntoView({behavior:'smooth',block:'center'}));
  next?.addEventListener('click',()=>artworkSections[index+1]?.scrollIntoView({behavior:'smooth',block:'center'}));
});

// Collector details dialog.
const detailsDialog=document.getElementById('detailsDialog');
const dialogTitleHe=document.getElementById('dialogTitleHe');
const dialogTitleEn=document.getElementById('dialogTitleEn');
const dialogStatus=document.getElementById('dialogStatus');
const dialogPrice=document.getElementById('dialogPrice');
const dialogWhatsapp=document.getElementById('dialogWhatsapp');

document.querySelectorAll('.details-btn').forEach(btn=>btn.addEventListener('click',()=>{
  const isAvailable=btn.dataset.available==='true';
  dialogTitleHe.textContent=btn.dataset.titleHe;
  dialogTitleEn.textContent=btn.dataset.titleEn;

  dialogStatus.innerHTML=isAvailable
    ? '<span data-lang="he">יצירה מקורית • זמינה</span><span data-lang="en">Original Artwork • Available</span>'
    : '<span data-lang="he">יצירה מתוך הסדרה • אינה מוצעת למכירה בתערוכה זו</span><span data-lang="en">Work from the Series • Not offered in this exhibition</span>';

  dialogPrice.textContent=isAvailable ? btn.dataset.price : '';
  dialogPrice.hidden=!isAvailable;

  const message=isAvailable
    ? `Hello, I am interested in "${btn.dataset.titleEn}" (${btn.dataset.price}).`
    : `Hello, I would like more information about "${btn.dataset.titleEn}".`;
  dialogWhatsapp.href=`https://wa.me/972544520987?text=${encodeURIComponent(message)}`;

  detailsDialog.showModal();
}));
detailsDialog.querySelector('.dialog-close').addEventListener('click',()=>detailsDialog.close());
detailsDialog.addEventListener('click',e=>{if(e.target===detailsDialog)detailsDialog.close()});

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


// Return to the original entrance screen.
function returnHome(event){
  event?.preventDefault();
  window.scrollTo({top:0,behavior:'instant'});
  site.classList.remove('active');
  entry.style.display='none';
  projectHub?.classList.add('active');
  document.body.classList.remove('locked');
}
document.getElementById('homeBtn').addEventListener('click',returnHome);
document.getElementById('brandHome').addEventListener('click',returnHome);


// Animate music covers on hover. On touch devices, tap to play.
document.querySelectorAll('.track-media').forEach(media=>{
  const video=media.querySelector('.track-hover-video');
  if(!video) return;

  const startPreview=()=>{
    video.currentTime=0;
    media.classList.add('is-playing');
    const promise=video.play();
    if(promise) promise.catch(()=>{
      media.classList.remove('is-playing');
    });
  };

  const stopPreview=()=>{
    video.pause();
    video.currentTime=0;
    media.classList.remove('is-playing');
  };

  media.addEventListener('mouseenter',startPreview);
  media.addEventListener('mouseleave',stopPreview);

  media.addEventListener('click',()=>{
    if(window.matchMedia('(hover:none)').matches){
      if(video.paused) startPreview();
      else stopPreview();
    }
  });

  video.addEventListener('ended',()=>{
    video.currentTime=0;
    media.classList.remove('is-playing');
  });
});


// Subtle pointer parallax for the gallery opening.
const parallaxItems=[...document.querySelectorAll('.parallax-item')];
const heroSection=document.querySelector('.hero');
if(heroSection && window.matchMedia('(hover:hover)').matches){
  heroSection.addEventListener('mousemove',e=>{
    const r=heroSection.getBoundingClientRect();
    const x=(e.clientX-r.left)/r.width-.5;
    const y=(e.clientY-r.top)/r.height-.5;
    parallaxItems.forEach((el,i)=>{
      const depth=(i+1)*1.4;
      el.style.transform=`translate(${x*depth}px,${y*depth}px)`;
    });
  });
  heroSection.addEventListener('mouseleave',()=>{
    parallaxItems.forEach(el=>el.style.transform='translate(0,0)');
  });
}

// Very quiet generated ambient sound, enabled only after user interaction.
const soundBtn=document.getElementById('soundBtn');
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

soundBtn.addEventListener('click',()=>setAmbient(!ambientOn));

// Start ambient softly after entering the gallery.
document.getElementById('enterBtn').addEventListener('click',()=>{
  setTimeout(()=>setAmbient(true),450);
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
  entry.style.display='none';
  projectHub?.classList.remove('active');
  site.classList.add('active');
  document.body.classList.remove('locked');
  requestAnimationFrame(()=>section?.scrollIntoView({behavior:smooth?'smooth':'auto',block:'start'}));
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

artworkSections.forEach((section,index)=>{
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
    const target=dx<0?artworkSections[index+1]:artworkSections[index-1];
    if(target){
      history.replaceState(null,'','#'+target.dataset.artworkSlug);
      target.scrollIntoView({behavior:'smooth',block:'start'});
    }
  },{passive:true});
});

// Keep a shareable artwork URL while browsing the exhibition.
const hashObserver=new IntersectionObserver(entries=>{
  const visible=entries.filter(e=>e.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];
  if(visible?.target?.dataset.artworkSlug && site.classList.contains('active')){
    history.replaceState(null,'','#'+visible.target.dataset.artworkSlug);
  }
},{threshold:[.45,.65]});
artworkSections.forEach(section=>hashObserver.observe(section));
