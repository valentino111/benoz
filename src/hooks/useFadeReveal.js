import { useEffect } from 'react';

export default function useFadeReveal(enabled) {
  useEffect(() => {
    if (!enabled) return undefined;

    const elements = [...document.querySelectorAll('.fade')];
    if (!('IntersectionObserver' in window)) {
      elements.forEach((element) => element.classList.add('show'));
      return () => elements.forEach((element) => element.classList.remove('show'));
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('show');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    elements.forEach((element) => observer.observe(element));
    return () => {
      observer.disconnect();
      elements.forEach((element) => element.classList.remove('show'));
    };
  }, [enabled]);
}
