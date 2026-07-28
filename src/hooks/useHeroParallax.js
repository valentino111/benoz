import { useEffect, useRef } from 'react';

export default function useHeroParallax() {
  const heroRef = useRef(null);

  useEffect(() => {
    const hero = heroRef.current;
    if (
      !hero
      || !window.matchMedia('(hover:hover)').matches
      || window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return undefined;
    }

    const items = [...hero.querySelectorAll('.parallax-item')];
    let frame = 0;
    let pointerEvent = null;

    const reset = () => {
      items.forEach((item) => {
        item.style.transform = 'translate(0,0)';
      });
    };
    const render = () => {
      frame = 0;
      const bounds = hero.getBoundingClientRect();
      if (!pointerEvent || !bounds.width || !bounds.height) return;
      const x = (pointerEvent.clientX - bounds.left) / bounds.width - 0.5;
      const y = (pointerEvent.clientY - bounds.top) / bounds.height - 0.5;
      items.forEach((item, index) => {
        const depth = (index + 1) * 1.4;
        item.style.transform = `translate(${x * depth}px,${y * depth}px)`;
      });
    };
    const handlePointerMove = (event) => {
      pointerEvent = event;
      if (!frame) frame = window.requestAnimationFrame(render);
    };

    hero.addEventListener('pointermove', handlePointerMove);
    hero.addEventListener('pointerleave', reset);
    return () => {
      hero.removeEventListener('pointermove', handlePointerMove);
      hero.removeEventListener('pointerleave', reset);
      if (frame) window.cancelAnimationFrame(frame);
      items.forEach((item) => {
        item.style.transform = '';
      });
    };
  }, []);

  return heroRef;
}
