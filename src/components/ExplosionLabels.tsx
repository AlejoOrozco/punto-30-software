import { motion } from 'motion/react';
import { useMemo } from 'react';

type Chip = { readonly text: string; readonly className: string };
type SectionLink = { readonly text: string; readonly id: string; readonly side: 'left' | 'right' };

const EXPLOSION_CHIPS: readonly Chip[] = [
  {
    text: 'Garantía real en todo',
    className:
      'max-md:left-[5%] max-md:top-[14%] md:left-[10%] md:top-[22%]',
  },
  {
    text: 'Mismo día, sin esperas',
    className:
      'max-md:right-[5%] max-md:top-[14%] md:right-[12%] md:top-[22%]',
  },
  {
    text: 'Diagnóstico 100% gratis',
    className:
      'max-md:left-1/2 max-md:-translate-x-1/2 max-md:top-[22%] md:left-[10%] md:bottom-[26%]',
  },
];

const HERO_STATS: readonly Chip[] = [
  {
    text: '+5000 equipos reparados',
    className:
      'max-md:left-[5%] max-md:bottom-[22%] md:left-[8%] md:top-[50%]',
  },
  {
    text: '4.9 calificación en Google',
    className:
      'max-md:right-[5%] max-md:bottom-[22%] max-md:text-right md:right-[10%] md:top-[50%] text-right',
  },
  {
    text: 'Sin cobros ocultos',
    className:
      'max-md:left-1/2 max-md:-translate-x-1/2 max-md:bottom-[14%] md:right-[10%] md:bottom-[20%]',
  },
];

const FRAME2_SECTIONS: readonly SectionLink[] = [
  { text: 'Nuestros servicios', id: 'servicios', side: 'left' },
  { text: 'Nuestros accesorios', id: 'accesorios', side: 'right' },
];

const SMOOTH_TRANSITION = { duration: 0.5, ease: 'easeOut' } as const;

function explosionOpacity(p: number): number {
  if (p < 0.01) return 1;
  const holdEnd = 0.58;
  const fadeOutEnd = 0.78;
  if (p < holdEnd) return 1;
  if (p < fadeOutEnd) return 1 - (p - holdEnd) / (fadeOutEnd - holdEnd);
  return 0;
}

function GlowChip({ text, size = 'md' }: { text: string; size?: 'sm' | 'md' }) {
  return (
    <div
      className="flex items-center gap-2 rounded-full border border-[#2ECC71]/40 bg-black/40 px-3 py-2
                 backdrop-blur-md shadow-[0_0_18px_rgba(46,204,113,0.15),0_10px_34px_rgba(0,0,0,0.55)]"
    >
      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#2ECC71] shadow-[0_0_10px_#2ECC71]" />
      <span
        className={`font-semibold leading-snug tracking-wide text-white/95 ${
          size === 'sm' ? 'text-[11px] md:text-xs' : 'text-[12px] md:text-[13px]'
        }`}
      >
        {text}
      </span>
    </div>
  );
}

type Props = {
  progress: number;
  heroAlpha: number;
  frame2Alpha: number;
};

export function ExplosionLabels({ progress, heroAlpha, frame2Alpha }: Props) {
  const explOpacity = useMemo(() => explosionOpacity(progress), [progress]);

  return (
    <>
      {/* Explosion-phase chips — visible frame 1 through explosion, fade near end */}
      {EXPLOSION_CHIPS.map((item) => (
        <motion.div
          key={item.text}
          className={`pointer-events-none absolute z-[24] max-w-[min(200px,42vw)] ${item.className}`}
          animate={{ opacity: explOpacity }}
          transition={SMOOTH_TRANSITION}
        >
          <motion.div
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <GlowChip text={item.text} />
          </motion.div>
        </motion.div>
      ))}

      {/* Hero-frame stats — animate opacity via Framer Motion for smooth bi-directional transitions */}
      {HERO_STATS.map((item) => (
        <motion.div
          key={item.text}
          className={`pointer-events-none absolute z-[26] max-w-[min(220px,42vw)] ${item.className}`}
          animate={{ opacity: heroAlpha, y: [0, -6, 0] }}
          transition={{ opacity: SMOOTH_TRANSITION, y: { duration: 5.2, repeat: Infinity, ease: 'easeInOut' } }}
        >
          <GlowChip text={item.text} size="sm" />
        </motion.div>
      ))}

      {/* Frame-2 section headings — smooth fade in/out driven by frame2Alpha */}
      {FRAME2_SECTIONS.map((item) => (
        <motion.div
          key={item.text}
          className={`absolute z-[27] w-[min(100%,20rem)] max-md:left-1/2 max-md:w-[min(92vw,20rem)] max-md:-translate-x-1/2 md:top-1/2 md:w-auto md:-translate-y-1/2 ${
            item.side === 'left'
              ? 'max-md:top-[18%] max-md:text-center md:left-[4%] md:text-left'
              : 'max-md:bottom-[18%] max-md:text-center md:right-[4%] md:text-right'
          }`}
          animate={{ opacity: frame2Alpha }}
          transition={SMOOTH_TRANSITION}
          style={{ pointerEvents: frame2Alpha > 0.05 ? 'auto' : 'none' }}
        >
          <button
            type="button"
            className={`group block w-full cursor-pointer text-center transition-transform duration-300 hover:scale-[1.03] ${
              item.side === 'right' ? 'md:text-right' : ''
            }`}
            onClick={() => document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' })}
          >
            <span
              className={`block text-2xl font-extrabold tracking-[-0.04em] leading-tight
                bg-gradient-to-b from-white/95 via-white/80 to-white/0
                bg-clip-text text-transparent
                drop-shadow-[0_0_18px_rgba(46,204,113,0.35)]
                transition-all duration-300
                group-hover:drop-shadow-[0_0_34px_rgba(46,204,113,0.75)]
                md:text-3xl lg:text-4xl`}
              style={{ fontWeight: 800 }}
            >
              {item.text}
            </span>
          </button>
        </motion.div>
      ))}
    </>
  );
}
