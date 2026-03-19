type Review = {
  quote: string;
  author: string;
  meta: string;
  initials: string;
};

const TOP_ROW: Review[] = [
  {
    quote:
      '“Me repararon la pantalla del iPhone 14 en 45 minutos. Quedó perfecta, mejor que en otras tiendas donde me pedían 3 días. Precio muy justo.”',
    author: 'María Camila R.',
    meta: 'iPhone 14 · Pantalla',
    initials: 'MC',
  },
  {
    quote:
      '“Compré el teclado para mi iPad Pro y me lo instalaron al instante. Excelente calidad y atención muy personalizada. Volvería sin dudarlo.”',
    author: 'Andrés M.',
    meta: 'iPad Pro · Teclado',
    initials: 'AM',
  },
  {
    quote:
      '“Mi Samsung se había caído al agua. Lo dieron por muerto en otro lugar pero aquí lo recuperaron. Increíble. Para siempre mi tienda de confianza.”',
    author: 'Laura V.',
    meta: 'Samsung · Daño por agua',
    initials: 'LV',
  },
];

const BOTTOM_ROW: Review[] = [
  {
    quote:
      '“El diagnóstico fue gratis como prometieron y el presupuesto muy honesto. Repararon mi Xiaomi ese mismo día. Recomendados 100%.”',
    author: 'Carlos H.',
    meta: 'Xiaomi · Batería',
    initials: 'CH',
  },
  {
    quote:
      '“Compré protector y funda para toda la familia. Todos de excelente calidad, los pusieron en el momento. El trato fue muy amable y profesional.”',
    author: 'Patricia G.',
    meta: 'Accesorios · Familia',
    initials: 'PG',
  },
  {
    quote:
      '“Me salvaron el iPad que usa mi hija para el colegio. Rápido, bien hecho y con garantía. Un negocio serio de verdad en Bogotá.”',
    author: 'Julián T.',
    meta: 'iPad · Pantalla',
    initials: 'JT',
  },
];

function ReviewCard({ item }: { item: Review }) {
  return (
    <article className="review-card">
      <div className="mb-3 text-[18px] leading-none text-[#F4B400]">★★★★★</div>
      <p className="review-quote">{item.quote}</p>
      <div className="mt-5 flex items-center gap-3">
        <div className="review-avatar">{item.initials}</div>
        <div>
          <p className="review-author">{item.author}</p>
          <p className="review-meta">{item.meta}</p>
          <p className="review-verified">✓ Reseña verificada Google</p>
        </div>
      </div>
    </article>
  );
}

function MarqueeRow({
  items,
  direction,
}: {
  items: Review[];
  direction: 'left' | 'right';
}) {
  return (
    <div className={`review-row ${direction === 'left' ? 'review-row-left' : 'review-row-right'}`}>
      <div className="review-track">
        {[...items, ...items].map((item, i) => (
          <ReviewCard key={`${item.author}-${i}`} item={item} />
        ))}
      </div>
    </div>
  );
}

export function TestimonialWall() {
  return (
    <section className="border-y border-white/10 bg-black px-6 py-20 md:py-28">
      <div className="mx-auto mb-10 max-w-5xl text-center">
        <p className="text-4xl font-semibold tracking-tight text-white md:text-5xl">
          4.9 <span className="text-[#2ECC71]">★</span>
        </p>
        <p className="mt-2 text-sm text-[#94A3B8] md:text-base">Basado en reseñas de Google</p>
      </div>
      <div className="review-wall">
        <MarqueeRow items={TOP_ROW} direction="left" />
        <MarqueeRow items={BOTTOM_ROW} direction="right" />
      </div>
    </section>
  );
}
