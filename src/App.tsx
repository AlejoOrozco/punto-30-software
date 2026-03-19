import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import Header from './components/Header.tsx';
import VideoScroll from './components/VideoScroll.tsx';
import { Reveal } from './components/Reveal.tsx';
import { CardSwapSection, type CardItem } from './components/CardSwapSection.tsx';
import { TestimonialWall } from './components/TestimonialWall.tsx';
import appleIcon from './assets/SVG/apple.svg';
import samsungIcon from './assets/SVG/samsung.svg';
import xiaomiIcon from './assets/SVG/xiaomi.svg';
import motorolaIcon from './assets/SVG/motorola.svg';
import huaweiIcon from './assets/SVG/huawei.svg';
import lgIcon from './assets/SVG/LG.svg';

import bgCambioPantalla from './assets/Services/cambiopdepantalla.webp';
import bgCambioBateria from './assets/Services/cambiodebateria.webp';
import bgReparacionCamara from './assets/Services/reparaciondecamara.webp';
import bgDanioAgua from './assets/Services/reparacionporagua.webp';
import bgDiagnostico from './assets/Services/diagnosticogratuito.webp';

import bgProtectores from './assets/Accesories/protectoresdepantalla.webp';
import bgApplePencil from './assets/Accesories/applepencil.webp';
import bgTeclados from './assets/Accesories/tecladosparatablet.webp';
import bgFundas from './assets/Accesories/fundasycases.webp';
import bgCargadores from './assets/Accesories/cargadoresytablets.webp';
import bgAudifonos from './assets/Accesories/audifonos.webp';
import bgPowerBanks from './assets/Accesories/powerbanks.webp';
import bgSoportes from './assets/Accesories/soportesystands.webp';

/* ── Section data ──────────────────────────────────────────────────── */

const SERVICES: CardItem[] = [
  {
    title: 'Cambio de pantalla',
    description: 'Reemplazo de pantalla LCD, AMOLED y LED para todos los modelos de dispositivos.',
    tags: ['Apple', 'Samsung', 'Xiaomi', 'Huawei', 'Motorola', 'LG'],
    backgroundImage: bgCambioPantalla,
  },
  {
    title: 'Cambio de batería',
    description: 'Batería nueva original o de alta calidad, con calibración incluida.',
    tags: ['Apple', 'Xiaomi'],
    backgroundImage: bgCambioBateria,
  },
  {
    title: 'Reparación de cámara',
    description: 'Reemplazo de módulos de cámara frontal y trasera con piezas certificadas.',
    tags: ['Apple'],
    backgroundImage: bgReparacionCamara,
  },
  {
    title: 'Daño por agua',
    description: 'Limpieza ultrasónica, secado profesional y reemplazo de componentes afectados.',
    tags: ['Samsung'],
    backgroundImage: bgDanioAgua,
  },
  {
    title: 'Diagnóstico gratuito',
    description: 'Revisión completa de tu equipo sin costo. Te decimos exactamente qué necesita.',
    tags: ['Apple', 'Samsung', 'Xiaomi', 'Huawei', 'Motorola', 'LG'],
    backgroundImage: bgDiagnostico,
  },
];

const ACCESSORIES: CardItem[] = [
  {
    title: 'Protectores de pantalla',
    description: 'Vidrio templado, privacidad, anti-rayones. Instalación incluida sin costo extra.',
    tags: ['iPhone', 'Samsung', 'iPad'],
    backgroundImage: bgProtectores,
  },
  {
    title: 'Apple Pencil & Stylus',
    description: 'Para dibujar, tomar notas y firmar. Compatibles con iPad y tablets Android.',
    tags: ['iPad', 'Universal'],
    backgroundImage: bgApplePencil,
  },
  {
    title: 'Teclados para tablet',
    description: 'Bluetooth con funda integrada. Transforma tu tablet en una laptop portátil.',
    tags: ['iPad', 'Samsung Tab'],
    backgroundImage: bgTeclados,
  },
  {
    title: 'Fundas & Cases',
    description: 'Antiimpacto, transparentes, diseños exclusivos. Para todos los modelos.',
    tags: ['iPhone', 'Samsung', 'Xiaomi'],
    backgroundImage: bgFundas,
  },
  {
    title: 'Cargadores & Cables',
    description: 'Carga rápida USB-C, Lightning, MagSafe. Originales y certificados.',
    tags: ['USB-C', 'Lightning', 'MagSafe'],
    backgroundImage: bgCargadores,
  },
  {
    title: 'Audífonos',
    description: 'Bluetooth, con cable, deportivos. Sonido de calidad para cada momento.',
    tags: ['Bluetooth', 'Type-C'],
    backgroundImage: bgAudifonos,
  },
  {
    title: 'Power Banks',
    description: 'De 10,000 a 20,000 mAh. Carga tu dispositivo en cualquier lugar.',
    tags: ['Universal'],
    backgroundImage: bgPowerBanks,
  },
  {
    title: 'Soportes & Stands',
    description: 'Para escritorio, carro y cocina. Posiciones ajustables para máxima comodidad.',
    tags: ['Universal', 'Auto'],
    backgroundImage: bgSoportes,
  },
];

export default function App() {
  const pageRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!pageRef.current) return;
    gsap.fromTo(
      pageRef.current.querySelectorAll('[data-fade]'),
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out', stagger: 0.06 },
    );
  }, []);

  return (
    <main ref={pageRef} className="min-h-screen bg-black text-white">
      <Header />

      <section className="pt-0">
        <VideoScroll />
      </section>

      {/* Soft transition: video → servicios */}
      <div
        aria-hidden
        className="pointer-events-none relative z-10 -my-10 h-20
                   bg-gradient-to-b from-black/0 via-black/85 to-black/0"
      />

      <CardSwapSection
        id="servicios"
        label="Servicios"
        heading="Nuestros servicios"
        subtitle="Reparaciones profesionales con piezas de alta calidad, garantía real y entrega el mismo día."
        items={SERVICES}
      />

      {/* Soft transition: servicios → accesorios (no hard gap) */}
      <div
        aria-hidden
        className="pointer-events-none relative z-10 -my-10 h-20
                   bg-gradient-to-b from-black/0 via-black/85 to-black/0"
      />

      <CardSwapSection
        id="accesorios"
        label="Accesorios"
        heading="Nuestros accesorios"
        subtitle="Todo lo que necesitas para proteger, cargar y potenciar tu dispositivo."
        items={ACCESSORIES}
      />

      {/* Soft transition: accesorios → brand strip */}
      <div
        aria-hidden
        className="pointer-events-none relative z-10 -my-10 h-20
                   bg-gradient-to-b from-black/0 via-black/85 to-black/0"
      />

      {/* SECTION 3 — Brand strip (after video) */}
      <section className="relative mx-auto max-w-5xl px-6 py-20 md:py-28">
        <Reveal>
          <h2 className="text-center text-3xl font-semibold tracking-tight text-white md:text-4xl">
            Especialistas en alta gama
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-center text-sm text-[#94A3B8] md:text-base">
            trabajamos con estas marcas, si la tuya no está en la lista,{' '}
            <a
              href="https://wa.me/573125820019"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-[#2ECC71] underline decoration-[#2ECC71]/60 underline-offset-4 hover:decoration-[#2ECC71]"
            >
              contactanos
            </a>
            .
          </p>
        </Reveal>

        <div
          className="mx-auto mt-10 flex items-center justify-start gap-10 overflow-x-auto pb-2 md:justify-center
                     [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {[
            { name: 'Apple', icon: appleIcon },
            { name: 'Samsung', icon: samsungIcon },
            { name: 'Xiaomi', icon: xiaomiIcon },
            { name: 'Motorola', icon: motorolaIcon },
            { name: 'Huawei', icon: huaweiIcon },
            { name: 'LG', icon: lgIcon },
          ].map((item, idx) => (
            <Reveal key={item.name} delay={idx * 0.06}>
              <div className="flex items-center gap-3 whitespace-nowrap">
                <img src={item.icon} alt={item.name} className="h-9 w-9 opacity-95" />
                <div className="text-sm font-semibold tracking-wide text-white/90">{item.name}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <TestimonialWall />

      <section data-fade className="border-t border-white/10 bg-black px-6 py-16 text-white md:py-24">
        <div className="mx-auto grid w-full max-w-6xl gap-10 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <h2 className="text-4xl font-extrabold tracking-tight md:text-6xl">
              Visítanos o escríbenos ahora
            </h2>
            <p className="mt-4 max-w-xl text-base text-[#94A3B8] md:text-xl">
              Sin cita previa. Atención inmediata. Estamos en Bogotá para ayudarte.
            </p>

            <div className="mt-10 space-y-5">
              <div className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-md">
                <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-lg bg-[#2ECC71]/15">📍</div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#94A3B8]">Dirección</p>
                  <p className="mt-1 text-xl font-bold">Bogotá, Colombia</p>
                  <p className="mt-1 text-sm text-[#94A3B8]">Calle 13 #15-51, Bogotá, Colombia, 111411</p>
                </div>
              </div>

              <div className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-md">
                <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-lg bg-[#2ECC71]/15">🕘</div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#94A3B8]">Horario de atención</p>
                  <p className="mt-1 text-xl font-bold">Lun–Sáb: 9:00 am – 7:00 pm</p>
                  <p className="mt-1 text-sm text-[#94A3B8]">Domingos: 10:00 am – 4:00 pm</p>
                </div>
              </div>

              <div className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-md">
                <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-lg bg-[#2ECC71]/15">📞</div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#94A3B8]">WhatsApp & teléfono</p>
                  <p className="mt-1 text-xl font-bold">+57 312 582 0019</p>
                  <p className="mt-1 text-sm text-[#94A3B8]">Respuesta en menos de 15 minutos</p>
                </div>
              </div>
            </div>

            <a
              href="tel:+573125820019"
              className="mt-8 inline-flex items-center rounded-xl border border-[#2ECC71]/70 bg-white/[0.03] px-6 py-3 text-base font-semibold text-white transition hover:bg-[#2ECC71]/20"
            >
              📞 Llamar ahora
            </a>
          </div>

          <div className="rounded-3xl border border-white/10 bg-[#0F1118] p-6 text-white shadow-[0_24px_70px_rgba(0,0,0,0.35)]">
            <h3 className="text-3xl font-extrabold leading-tight md:text-4xl">¿Listo para reparar tu equipo?</h3>
            <p className="mt-4 text-base text-white/75 md:text-lg">
              Escríbenos por WhatsApp ahora. Respondemos en menos de 15 minutos en horario de atención.
            </p>

            <a
              href="https://wa.me/573125820019"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex rounded-xl bg-[#2ECC71] px-6 py-3 text-lg font-bold text-black transition hover:brightness-95"
            >
              💬 Escribir por WhatsApp
            </a>

            <div className="mt-8 overflow-hidden rounded-2xl border border-white/10">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3976.919486238095!2d-74.0846151!3d4.608434000000001!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e3f997315b9d473%3A0x237107cf0f1c6e5d!2sCl.%2013%20%2315-51%2C%20Bogot%C3%A1!5e0!3m2!1ses-419!2sco!4v1773960868656!5m2!1ses-419!2sco"
                className="h-[300px] w-full border-0"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Mapa de Táctiles Punto 30"
              />
            </div>
          </div>
        </div>

        <p className="mx-auto mt-10 max-w-6xl text-center text-xs text-[#94A3B8]">
          Sitio web creado por el equipo de SimpLexaLabs
        </p>
      </section>

      <a
        href="https://wa.me/573125820019"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="WhatsApp"
        className="btn-neon fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#2ECC71]
                   text-black shadow-[0_8px_32px_rgba(46,204,113,0.35)] transition hover:scale-105"
      >
        <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      </a>
    </main>
  );
}
