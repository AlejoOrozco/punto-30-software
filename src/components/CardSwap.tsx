import React, {
  Children,
  cloneElement,
  forwardRef,
  isValidElement,
  type ReactElement,
  type ReactNode,
  type RefObject,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import gsap from 'gsap';

/* ── Types ─────────────────────────────────────────────────────────── */

export interface CardSwapProps {
  width?: number | string;
  height?: number | string;
  cardDistance?: number;
  verticalDistance?: number;
  delay?: number;
  pauseOnHover?: boolean;
  onCardClick?: (idx: number) => void;
  onActiveChange?: (idx: number) => void;
  skewAmount?: number;
  easing?: 'linear' | 'elastic';
  children: ReactNode;
}

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  customClass?: string;
}

/* ── Card (public) ─────────────────────────────────────────────────── */

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ customClass, className, style, ...rest }, ref) => (
    <div
      ref={ref}
      {...rest}
      className={[
        'absolute left-1/2 top-1/2 rounded-2xl border border-white/10 bg-black/80 backdrop-blur-md',
        'shadow-[0_0_30px_rgba(46,204,113,0.08)] will-change-transform',
        '[backface-visibility:hidden] [transform-style:preserve-3d]',
        customClass,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={style}
    />
  ),
);
Card.displayName = 'Card';

/* ── Internals ─────────────────────────────────────────────────────── */

type CardRef = RefObject<HTMLDivElement | null>;

interface Slot {
  x: number;
  y: number;
  z: number;
  zIndex: number;
}

const makeSlot = (i: number, distX: number, distY: number, total: number): Slot => ({
  x: i * distX,
  y: -i * distY,
  z: -i * distX * 1.5,
  zIndex: total - i,
});

const placeNow = (el: HTMLElement, slot: Slot, skew: number) =>
  gsap.set(el, {
    x: slot.x,
    y: slot.y,
    z: slot.z,
    xPercent: -50,
    yPercent: -50,
    skewY: skew,
    transformOrigin: 'center center',
    zIndex: slot.zIndex,
    force3D: true,
  });

/* ── CardSwap (public) ─────────────────────────────────────────────── */

const CardSwap: React.FC<CardSwapProps> = ({
  width = 500,
  height = 400,
  cardDistance = 60,
  verticalDistance = 70,
  delay = 2000,
  pauseOnHover = false,
  onCardClick,
  onActiveChange,
  skewAmount = 6,
  easing = 'elastic',
  children,
}) => {
  const config =
    easing === 'elastic'
      ? {
          ease: 'elastic.out(0.6,0.9)' as const,
          durDrop: 2,
          durMove: 2,
          durReturn: 2,
          promoteOverlap: 0.9,
          returnDelay: 0.05,
        }
      : {
          ease: 'power1.inOut' as const,
          durDrop: 0.8,
          durMove: 0.8,
          durReturn: 0.8,
          promoteOverlap: 0.45,
          returnDelay: 0.2,
        };

  const childArr = useMemo(
    () => Children.toArray(children) as ReactElement<CardProps>[],
    [children],
  );

  const refs = useMemo<CardRef[]>(
    () => childArr.map(() => React.createRef<HTMLDivElement>()),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [childArr.length],
  );

  const order = useRef<number[]>(Array.from({ length: childArr.length }, (_, i) => i));
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const intervalRef = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const total = refs.length;
    refs.forEach((r, i) => {
      if (r.current) placeNow(r.current, makeSlot(i, cardDistance, verticalDistance, total), skewAmount);
    });

    const isVisibleRef = { current: true };
    const isHoveredRef = { current: false };

    const swap = () => {
      if (order.current.length < 2) return;

      const [front, ...rest] = order.current;
      const elFront = refs[front].current;
      if (!elFront) return;

      const tl = gsap.timeline();
      tlRef.current = tl;

      tl.to(elFront, { y: '+=500', duration: config.durDrop, ease: config.ease });

      tl.addLabel('promote', `-=${config.durDrop * config.promoteOverlap}`);
      tl.call(() => { onActiveChange?.(rest[0]); }, undefined, 'promote');
      rest.forEach((idx, i) => {
        const el = refs[idx].current;
        if (!el) return;
        const slot = makeSlot(i, cardDistance, verticalDistance, total);
        tl.set(el, { zIndex: slot.zIndex }, 'promote');
        tl.to(
          el,
          { x: slot.x, y: slot.y, z: slot.z, duration: config.durMove, ease: config.ease },
          `promote+=${i * 0.15}`,
        );
      });

      const backSlot = makeSlot(total - 1, cardDistance, verticalDistance, total);
      tl.addLabel('return', `promote+=${config.durMove * config.returnDelay}`);
      tl.call(
        () => { gsap.set(elFront, { zIndex: backSlot.zIndex }); },
        undefined,
        'return',
      );
      tl.to(
        elFront,
        { x: backSlot.x, y: backSlot.y, z: backSlot.z, duration: config.durReturn, ease: config.ease },
        'return',
      );

      tl.call(() => {
        order.current = [...rest, front];
      });
    };

    const startLoop = () => {
      clearInterval(intervalRef.current);
      intervalRef.current = window.setInterval(swap, delay);
    };

    const stopLoop = () => {
      tlRef.current?.pause();
      clearInterval(intervalRef.current);
    };

    const resumeLoop = () => {
      tlRef.current?.play();
      startLoop();
    };

    swap();
    startLoop();

    // Pause animations when the section scrolls out of view.
    const node = containerRef.current;
    let observer: IntersectionObserver | null = null;
    if (node) {
      observer = new IntersectionObserver(
        ([entry]) => {
          isVisibleRef.current = entry.isIntersecting;
          if (entry.isIntersecting && !isHoveredRef.current) {
            resumeLoop();
          } else if (!entry.isIntersecting) {
            stopLoop();
          }
        },
        { threshold: 0.05 },
      );
      observer.observe(node);
    }

    if (pauseOnHover && node) {
      const onEnter = () => {
        isHoveredRef.current = true;
        stopLoop();
      };
      const onLeave = () => {
        isHoveredRef.current = false;
        if (isVisibleRef.current) resumeLoop();
      };
      node.addEventListener('mouseenter', onEnter);
      node.addEventListener('mouseleave', onLeave);
      return () => {
        node.removeEventListener('mouseenter', onEnter);
        node.removeEventListener('mouseleave', onLeave);
        observer?.disconnect();
        clearInterval(intervalRef.current);
      };
    }
    return () => {
      observer?.disconnect();
      clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cardDistance, verticalDistance, delay, pauseOnHover, skewAmount, easing]);

  const rendered = childArr.map((child, i) => {
    if (!isValidElement<CardProps>(child)) return child;
    const props: CardProps & { key: number } = {
      key: i,
      style: { width, height, ...(child.props.style ?? {}) },
      onClick: (e: React.MouseEvent<HTMLDivElement>) => {
        child.props.onClick?.(e);
        onCardClick?.(i);
      },
    };
    return cloneElement(child, { ...props, ref: refs[i] } as unknown as CardProps);
  });

  return (
    <div
      ref={containerRef}
      className="absolute bottom-0 right-0 origin-bottom-right overflow-visible
                 translate-x-[5%] translate-y-[20%]
                 max-[768px]:scale-75 max-[768px]:translate-x-[25%] max-[768px]:translate-y-[25%]
                 max-[480px]:scale-[0.55] max-[480px]:translate-x-[25%] max-[480px]:translate-y-[25%]"
      style={{ width, height, perspective: 900 }}
    >
      {rendered}
    </div>
  );
};

export default CardSwap;
