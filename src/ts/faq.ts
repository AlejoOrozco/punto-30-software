const FAQ_ITEM_SELECTOR = '.faq-item';
const FAQ_QUESTION_SELECTOR = '.faq-q';
const FAQ_ANSWER_SELECTOR = '.faq-a';

function toggleFaq(button: HTMLElement): void {
  const item = button.closest(FAQ_ITEM_SELECTOR);
  const answer = item?.querySelector<HTMLElement>(FAQ_ANSWER_SELECTOR);
  if (!item || !answer) return;

  const wasOpen = item.classList.contains('open');

  document.querySelectorAll(FAQ_ITEM_SELECTOR).forEach((el) => {
    el.classList.remove('open');
    const ans = el.querySelector<HTMLElement>(FAQ_ANSWER_SELECTOR);
    if (ans) ans.style.maxHeight = '0';
  });

  if (!wasOpen) {
    item.classList.add('open');
    answer.style.maxHeight = `${answer.scrollHeight}px`;
  }
}

export function initFaq(): void {
  document.querySelectorAll(FAQ_QUESTION_SELECTOR).forEach((btn) => {
    btn.addEventListener('click', () => toggleFaq(btn as HTMLElement));
  });
}
