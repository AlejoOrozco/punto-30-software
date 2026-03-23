import { useState, type ReactNode } from 'react';
import CardSwap, { Card } from './CardSwap.tsx';
import { Reveal } from './Reveal.tsx';

import appleIcon from '../assets/SVG/apple.svg';
import samsungIcon from '../assets/SVG/samsung.svg';
import xiaomiIcon from '../assets/SVG/xiaomi.svg';
import huaweiIcon from '../assets/SVG/huawei.svg';
import motorolaIcon from '../assets/SVG/motorola.svg';
import lgIcon from '../assets/SVG/LG.svg';

/* ── Brand icon map ────────────────────────────────────────────────── */

const BRAND_ICON: Record<string, string> = {
  apple: appleIcon,
  iphone: appleIcon,
  ipad: appleIcon,
  samsung: samsungIcon,
  'samsung tab': samsungIcon,
  xiaomi: xiaomiIcon,
  huawei: huaweiIcon,
  motorola: motorolaIcon,
  lg: lgIcon,
  universal: '',
  'usb-c': '',
  lightning: '',
  magsafe: '',
  bluetooth: '',
  'type-c': '',
  auto: '',
};

function TagBadge({ name }: { name: string }) {
  const icon = BRAND_ICON[name.toLowerCase()];
  return (
    <div className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1">
      {icon && <img src={icon} alt={name} className="h-3.5 w-3.5 opacity-70" />}
      <span className="text-[10px] font-medium uppercase tracking-wider text-white/50">{name}</span>
    </div>
  );
}

/* ── Public types ──────────────────────────────────────────────────── */

export interface CardItem {
  title: string;
  description: string;
  tags: string[];
  backgroundImage?: string;
}

interface CardSwapSectionProps {
  id: string;
  label: string;
  heading: string;
  subtitle: ReactNode;
  items: CardItem[];
}

/* ── Background crossfade layer ────────────────────────────────────── */

function BackgroundLayer({ images, activeIndex }: { images: string[]; activeIndex: number }) {
  if (images.length === 0) return null;
  return (
    <div className="absolute inset-0 z-0 overflow-hidden" aria-hidden>
      {images.map((src, i) => (
        <img
          key={src}
          src={src}
          alt=""
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ease-in-out"
          style={{ opacity: i === activeIndex ? 0.3 : 0 }}
        />
      ))}
    </div>
  );
}

/* ── Component ─────────────────────────────────────────────────────── */

export function CardSwapSection({
  id,
  label,
  heading,
  subtitle,
  items,
}: CardSwapSectionProps) {
  const bgImages = items.map((item) => item.backgroundImage).filter(Boolean) as string[];
  const hasBg = bgImages.length === items.length;
  const [activeCard, setActiveCard] = useState(0);

  const textBlock = (
    <div className="relative z-10 w-full shrink-0 lg:w-[38%]">
      <Reveal>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#2ECC71]">
          {label}
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white md:text-5xl">
          {heading}
        </h2>
        <p className="mt-4 max-w-md text-sm leading-relaxed text-[#94A3B8] md:text-base">
          {subtitle}
        </p>
      </Reveal>
    </div>
  );

  const cardsBlock = (
    <div className="relative z-10 w-full lg:w-[62%]" style={{ height: 560 }}>
      <CardSwap
        cardDistance={50}
        verticalDistance={60}
        delay={2500}
        pauseOnHover={false}
        width={380}
        height={470}
        skewAmount={5}
        easing="elastic"
        onActiveChange={hasBg ? setActiveCard : undefined}
      >
        {items.map((item) => (
          <Card key={item.title} customClass="p-8 flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-bold tracking-tight text-white md:text-2xl">
                {item.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-[#94A3B8] md:text-base">
                {item.description}
              </p>
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              {item.tags.map((t) => (
                <TagBadge key={t} name={t} />
              ))}
            </div>
          </Card>
        ))}
      </CardSwap>
    </div>
  );

  return (
    <section
      id={id}
      className="relative flex min-h-screen flex-col justify-center overflow-hidden bg-black px-6 py-24 md:py-32"
    >
      {hasBg && <BackgroundLayer images={bgImages} activeIndex={activeCard} />}

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col items-start gap-16 lg:flex-row lg:items-center">
        {textBlock}
        {cardsBlock}
      </div>
    </section>
  );
}
