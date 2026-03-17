const PROD_CAROUSEL_ID = 'prodCarousel';
const CAROUSEL_STEP = 210;
const SCROLL_LEFT_SELECTOR = '[data-carousel-dir="-1"]';
const SCROLL_RIGHT_SELECTOR = '[data-carousel-dir="1"]';

function scrollCarousel(direction: number): void {
  const carousel = document.getElementById(PROD_CAROUSEL_ID);
  if (!carousel) return;
  carousel.scrollBy({ left: direction * CAROUSEL_STEP, behavior: 'smooth' });
}

export function initCarousel(): void {
  document.querySelector(SCROLL_LEFT_SELECTOR)?.addEventListener('click', () => scrollCarousel(-1));
  document.querySelector(SCROLL_RIGHT_SELECTOR)?.addEventListener('click', () => scrollCarousel(1));
}
