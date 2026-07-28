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

cleanup=()=>{
  listeners.reverse().forEach(([target,type,handler,options])=>target.removeEventListener(type,handler,options));
  timers.forEach(timer=>window.clearTimeout(timer));
  frames.forEach(frame=>window.cancelAnimationFrame(frame));
  observers.forEach(activeObserver=>activeObserver.disconnect());
  document.querySelectorAll('video').forEach(video=>video.pause());
  document.querySelectorAll('.fade.show').forEach(element=>element.classList.remove('show'));
  parallaxItems.forEach(element=>{element.style.transform=''});
  originalImages.forEach(({img,alt,loading,decoding,draggable})=>{
    if(alt===null) img.removeAttribute('alt'); else img.setAttribute('alt',alt);
    if(loading===null) img.removeAttribute('loading'); else img.setAttribute('loading',loading);
    if(decoding===null) img.removeAttribute('decoding'); else img.setAttribute('decoding',decoding);
    if(draggable===null) img.removeAttribute('draggable'); else img.setAttribute('draggable',draggable);
  });
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
