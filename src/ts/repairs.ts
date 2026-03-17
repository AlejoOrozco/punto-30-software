import type { BrandKey, RepairItem } from '../types.ts';

export const REPAIRS: readonly RepairItem[] = [
  { icon: '📱', name: 'Cambio de pantalla', time: '30–60 min', brands: ['apple', 'samsung', 'xiaomi', 'huawei', 'motorola', 'lg'] },
  { icon: '🔋', name: 'Cambio de batería', time: '20–45 min', brands: ['apple', 'samsung', 'xiaomi', 'huawei', 'motorola', 'lg'] },
  { icon: '📸', name: 'Reparación de cámara', time: '30–60 min', brands: ['apple', 'samsung', 'xiaomi', 'huawei'] },
  { icon: '🔌', name: 'Conector de carga', time: '30–60 min', brands: ['apple', 'samsung', 'xiaomi', 'motorola'] },
  { icon: '🔊', name: 'Altavoz / Micrófono', time: '30–45 min', brands: ['apple', 'samsung', 'xiaomi', 'huawei', 'motorola'] },
  { icon: '💧', name: 'Daño por agua', time: '1–3 horas', brands: ['apple', 'samsung', 'xiaomi', 'huawei'] },
  { icon: '📟', name: 'Pantalla de tablet', time: '45–90 min', brands: ['tablet', 'apple'] },
  { icon: '🔘', name: 'Botones y volumen', time: '20–40 min', brands: ['apple', 'samsung', 'xiaomi', 'motorola'] },
  { icon: '📡', name: 'Señal / Antena', time: '45–90 min', brands: ['apple', 'samsung', 'xiaomi'] },
  { icon: '🖥️', name: 'Touch no responde', time: '30–60 min', brands: ['apple', 'samsung', 'xiaomi', 'huawei', 'tablet'] },
  { icon: '⚡', name: 'No enciende', time: 'Diagnóstico gratis', brands: ['apple', 'samsung', 'xiaomi', 'huawei', 'motorola', 'lg', 'tablet'] },
  { icon: '🌡️', name: 'Sobrecalentamiento', time: 'Diagnóstico gratis', brands: ['apple', 'samsung', 'xiaomi', 'huawei'] },
  { icon: '📲', name: 'Face ID / Huella digital', time: '45–90 min', brands: ['apple', 'samsung'] },
  { icon: '🔩', name: 'Carcasa y chasis', time: '30–60 min', brands: ['apple', 'samsung', 'xiaomi'] },
  { icon: '💾', name: 'Recuperación de datos', time: '1–3 horas', brands: ['apple', 'samsung', 'xiaomi', 'huawei', 'motorola', 'lg', 'tablet'] },
  { icon: '📟', name: 'Batería de tablet', time: '30–60 min', brands: ['tablet', 'apple'] },
  { icon: '🖊️', name: 'Apple Pencil / Stylus', time: 'Revisión y configuración', brands: ['tablet', 'apple'] },
  { icon: '⌨️', name: 'Teclado de tablet', time: '15–20 min', brands: ['tablet'] },
];

const REPAIRS_GRID_ID = 'repairsGrid';
const MORE_BTN_ID = 'moreBtn';
const BRAND_TABS_SELECTOR = '[data-brand]';
const VISIBLE_COUNT = 8;

let showAll = false;
let currentBrand: BrandKey = 'all';

function getFilteredRepairs(): RepairItem[] {
  if (currentBrand === 'all') return [...REPAIRS];
  return REPAIRS.filter((r) => r.brands.includes(currentBrand));
}

function renderRepairs(): void {
  const grid = document.getElementById(REPAIRS_GRID_ID);
  const moreBtn = document.getElementById(MORE_BTN_ID);
  if (!grid || !moreBtn) return;

  const filtered = getFilteredRepairs();
  const toShow = showAll ? filtered : filtered.slice(0, VISIBLE_COUNT);

  grid.innerHTML = toShow
    .map(
      (r) => `
    <div class="rcard">
      <div class="rcard-icon">${r.icon}</div>
      <div><div class="rcard-name">${r.name}</div><div class="rcard-time">⏱ ${r.time}</div></div>
    </div>`
    )
    .join('');

  if (filtered.length <= VISIBLE_COUNT) {
    moreBtn.style.display = 'none';
  } else {
    moreBtn.style.display = 'block';
    moreBtn.textContent = showAll ? 'Ver menos ↑' : `Ver todos (${filtered.length}) ↓`;
  }
}

function setActiveTab(activeButton: Element): void {
  document.querySelectorAll(BRAND_TABS_SELECTOR).forEach((el) => el.classList.remove('on'));
  activeButton.classList.add('on');
}

function handleBrandClick(button: HTMLElement): void {
  const brand = button.getAttribute('data-brand');
  if (brand === null) return;
  currentBrand = brand as BrandKey;
  showAll = false;
  setActiveTab(button);
  renderRepairs();
}

function handleToggleAll(): void {
  showAll = !showAll;
  renderRepairs();
}

export function initRepairs(): void {
  renderRepairs();

  document.querySelectorAll(BRAND_TABS_SELECTOR).forEach((btn) => {
    btn.addEventListener('click', () => handleBrandClick(btn as HTMLElement));
  });

  const moreBtn = document.getElementById(MORE_BTN_ID);
  moreBtn?.addEventListener('click', handleToggleAll);
}
