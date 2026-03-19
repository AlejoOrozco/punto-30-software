import { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Reveal } from './Reveal.tsx';

gsap.registerPlugin(ScrollTrigger);

const STEPS = [
  { title: 'Diagnóstico', body: 'Revisión clara del daño y opciones reales, sin presión.' },
  { title: 'Reparación', body: 'Trabajo limpio, pruebas reales y estándar de alta gama.' },
  { title: 'Entrega', body: 'Equipo probado, garantía y recomendaciones para cuidarlo.' },
] as const;

export function ProcessTimeline() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;

    const mm = gsap.matchMedia();

    mm.add('(min-width: 768px)', () => {
      const scrollWidth = track.scrollWidth - section.offsetWidth;
      if (scrollWidth <= 0) return;

      const tween = gsap.to(track, {
        x: -scrollWidth,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: () => `+=${scrollWidth + section.offsetWidth * 0.5}`,
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
        },
      });

      return () => {
        tween.scrollTrigger?.kill();
        tween.kill();
      };
    });

    return () => mm.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative bg-black py-20 md:min-h-screen md:py-0">
      <div className="mx-auto max-w-6xl px-6 pb-8 md:pt-24 md:pb-12">
        <Reveal>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#2ECC71]">Proceso</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white md:text-4xl">
            Cómo lo hacemos
          </h2>
          <p className="mt-3 max-w-xl text-sm text-[#94A3B8]">
            Tres momentos clave — desliza para recorrer el recorrido.
          </p>
        </Reveal>
      </div>

      {/* Mobile: horizontal scroll */}
      <div
        className="flex gap-4 overflow-x-auto px-6 pb-12 [-ms-overflow-style:none] [scrollbar-width:none]
                   md:hidden [&::-webkit-scrollbar]:hidden"
      >
        {STEPS.map((s) => (
          <div
            key={s.title}
            className="min-w-[min(85vw,320px)] shrink-0 rounded-2xl border border-white/10 bg-white/[0.03] p-6"
          >
            <div className="mb-3 h-px w-8 bg-[#2ECC71]" />
            <h3 className="text-lg font-semibold text-white">{s.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-[#94A3B8]">{s.body}</p>
          </div>
        ))}
      </div>

      {/* Desktop: pinned horizontal scrub */}
      <div className="hidden overflow-hidden pb-24 md:block">
        <div ref={trackRef} className="flex w-max gap-8 px-12 pb-8">
          {STEPS.map((s) => (
            <div
              key={s.title}
              className="flex h-[min(42vh,360px)] w-[min(72vw,520px)] shrink-0 flex-col justify-center
                         rounded-2xl border border-white/10 bg-white/[0.03] p-10"
            >
              <div className="mb-4 h-px w-10 bg-[#2ECC71]" />
              <h3 className="text-2xl font-semibold text-white">{s.title}</h3>
              <p className="mt-4 max-w-md text-base leading-relaxed text-[#94A3B8]">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
