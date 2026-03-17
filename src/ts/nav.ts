const MOBILE_MENU_ID = 'mMenu';
const TOGGLE_MENU_SELECTOR = '[data-action="toggle-menu"]';

function toggleMenu(): void {
  const menu = document.getElementById(MOBILE_MENU_ID);
  if (menu) menu.classList.toggle('open');
}

export function initNav(): void {
  document.querySelectorAll(TOGGLE_MENU_SELECTOR).forEach((el) => {
    el.addEventListener('click', toggleMenu);
  });
}
