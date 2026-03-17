const REVEAL_SELECTOR = '.reveal';
const THRESHOLD = 0.1;

export function initReveal(): void {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) e.target.classList.add('visible');
      });
    },
    { threshold: THRESHOLD }
  );

  document.querySelectorAll(REVEAL_SELECTOR).forEach((el) => observer.observe(el));
}
