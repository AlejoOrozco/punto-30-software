const PROOF_BAR_SELECTOR = '.proof-bar';
const PROOF_NUM_SELECTOR = '.proof-num';
const DURATION_MS = 1500;
const STEPS = 60;

function animateCounters(): void {
  document.querySelectorAll(PROOF_NUM_SELECTOR).forEach((el) => {
    const text = el.textContent ?? '';
    const num = parseInt(text.replace(/\D/g, ''), 10);
    if (Number.isNaN(num)) return;

    let current = 0;
    const stepMs = DURATION_MS / STEPS;
    const increment = num / STEPS;

    const timer = setInterval(() => {
      current += increment;
      if (current >= num) {
        current = num;
        clearInterval(timer);
      }
      el.textContent = text.replace(/\d+/, String(Math.floor(current)));
    }, stepMs);
  });
}

export function initCounters(): void {
  const proofBar = document.querySelector(PROOF_BAR_SELECTOR);
  if (!proofBar) return;

  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0]?.isIntersecting) {
        animateCounters();
        observer.disconnect();
      }
    },
    { threshold: 0.5 }
  );

  observer.observe(proofBar);
}
