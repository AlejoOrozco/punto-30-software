import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import videoSrc from '../assets/punto30video.mp4';
import logoSrc from '../assets/punto30icon.webp';
import { ExplosionLabels } from './ExplosionLabels.tsx';

gsap.registerPlugin(ScrollTrigger);

type ScrollyVideoInstance = {
  setTargetTimePercent: (n: number, opts?: { jump?: boolean }) => void;
  destroy?: () => void;
  frames?: unknown[];
};

type ScrollyVideoCtor = new (opts: Record<string, unknown>) => ScrollyVideoInstance;

export default function VideoScroll() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const endGradientRef = useRef<HTMLDivElement>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [scrubProgress, setScrubProgress] = useState(0);
  const [heroAlpha, setHeroAlpha] = useState(1);

  const scrubRafRef = useRef(0);
  const heroAlphaRafRef = useRef(0);

  const queueScrubUpdate = (p: number) => {
    if (scrubRafRef.current) return;
    scrubRafRef.current = requestAnimationFrame(() => {
      scrubRafRef.current = 0;
      setScrubProgress(p);
    });
  };

  const queueHeroAlphaUpdate = (a: number) => {
    if (heroAlphaRafRef.current) return;
    heroAlphaRafRef.current = requestAnimationFrame(() => {
      heroAlphaRafRef.current = 0;
      setHeroAlpha(a);
    });
  };

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const container = canvasRef.current;
    const sticky = stickyRef.current;
    if (!wrapper || !container) return;

    const videoReadyRef = { current: false };
    const hasScrollStartedRef = { current: false };
    const secondFramePercentRef = { current: 0.001 };
    // Tracks whether a programmatic scroll snap is in progress (prevents re-triggering).
    const isSnappingRef = { current: false };
    // true when user has been snapped to the end (frame 2), false when at start (frame 1).
    const atEndRef = { current: false };

    let snapTimeoutId = 0;

    const snapTo = (targetY: number) => {
      isSnappingRef.current = true;
      window.clearTimeout(snapTimeoutId);
      window.scrollTo({ top: targetY, behavior: 'smooth' });
      // Release the lock after the smooth-scroll animation settles (~800 ms).
      snapTimeoutId = window.setTimeout(() => {
        isSnappingRef.current = false;
      }, 900);
    };

    const onFirstUserScroll = () => {
      if (!hasScrollStartedRef.current) hasScrollStartedRef.current = true;
      window.removeEventListener('scroll', onFirstUserScroll);
    };

    if (window.scrollY > 0) {
      hasScrollStartedRef.current = true;
    } else {
      window.addEventListener('scroll', onFirstUserScroll, { passive: true });
    }

    if (sticky) {
      gsap.set(sticky, { opacity: 0 });
      gsap.to(sticky, { opacity: 1, duration: 0.8, ease: 'power2.out' });
    }
    if (heroRef.current) gsap.set(heroRef.current, { opacity: 0 });

    let scrollyVideo: ScrollyVideoInstance | null = null;
    let trigger: ScrollTrigger | null = null;
    let cancelled = false;
    let readyCheck: number | null = null;

    const init = async () => {
      const mod = await import('scrolly-video/dist/ScrollyVideo.js');
      const CtorUnknown = (mod as { default?: unknown }).default ?? mod;
      if (typeof CtorUnknown !== 'function') {
        throw new Error('ScrollyVideo constructor not found');
      }
      const Ctor = CtorUnknown as ScrollyVideoCtor;

      const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
      const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(ua);

      scrollyVideo = new Ctor({
        scrollyVideoContainer: container,
        src: videoSrc,
        trackScroll: false,
        cover: true,
        sticky: false,
        full: false,
        frameThreshold: 0,
        transitionSpeed: 8,
        useWebCodecs: !isMobile,
      });

      readyCheck = window.setInterval(() => {
        if (cancelled) {
          if (readyCheck) window.clearInterval(readyCheck);
          return;
        }
        if (container.querySelector('canvas')) {
          setIsLoading(false);
          videoReadyRef.current = true;

          const frames = scrollyVideo?.frames;
          if (Array.isArray(frames) && frames.length > 1) {
            secondFramePercentRef.current = 1 / frames.length;
          }

          const initialPercent = hasScrollStartedRef.current ? secondFramePercentRef.current : 0;
          // Use default smooth animation (no jump:true) to avoid canvas freeze on rapid seeks.
          scrollyVideo?.setTargetTimePercent(initialPercent);

          if (heroRef.current) {
            gsap.to(heroRef.current, { opacity: 1, duration: 0.8, ease: 'power2.out' });
          }

          if (readyCheck) window.clearInterval(readyCheck);
          readyCheck = null;
        }
      }, 100);

      const setAlpha = (value: number) => {
        if (heroRef.current) {
          heroRef.current.style.opacity = String(value);
        }
        queueHeroAlphaUpdate(value);
      };

      trigger = ScrollTrigger.create({
        trigger: wrapper,
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: (self) => {
          if (!videoReadyRef.current || !scrollyVideo) return;

          const p = self.progress;
          queueScrubUpdate(p);

          const step = secondFramePercentRef.current || 0.001;
          const earlyZone = Math.max(step * 8, 0.045);

          let mappedProgress: number;
          if (!hasScrollStartedRef.current) {
            mappedProgress = 0;
          } else if (p < earlyZone) {
            mappedProgress = self.direction === -1 ? 0 : Math.max(step, p);
          } else {
            mappedProgress = p;
          }

          // No { jump: true } — letting scrolly-video's internal rAF animate toward the target
          // prevents rapid frame-jumping that can freeze the canvas decoder.
          scrollyVideo.setTargetTimePercent(mappedProgress);

          if (endGradientRef.current) {
            const endFade = gsap.utils.clamp(0, 1, (p - 0.92) / 0.08);
            endGradientRef.current.style.opacity = String(endFade);
          }

          // --- Bilateral snap logic ---
          // Forward snap: first tiny downward scroll → jump to end (frame 2).
          if (
            !isSnappingRef.current &&
            !atEndRef.current &&
            self.direction === 1 &&
            p > 0.02 &&
            p < 0.9
          ) {
            atEndRef.current = true;
            // Immediately crossfade: hero out, frame-2 in.
            setAlpha(0);
            const endY =
              wrapper.getBoundingClientRect().top +
              window.scrollY +
              wrapper.offsetHeight -
              window.innerHeight;
            snapTo(endY);
          }

          // Reverse snap: upward scroll from near the end → jump back to start (frame 1).
          if (
            !isSnappingRef.current &&
            atEndRef.current &&
            self.direction === -1 &&
            p > 0.88
          ) {
            atEndRef.current = false;
            // Immediately crossfade: frame-2 out, hero in.
            setAlpha(1);
            const startY = wrapper.getBoundingClientRect().top + window.scrollY;
            snapTo(startY);
          }

          // During a snap the alpha is already set to its target; skip scroll-based calc.
          if (!isSnappingRef.current) {
            const FADE_START = 0.03;
            const FADE_END = 0.20;
            const frame2Opacity = gsap.utils.clamp(0, 1, (p - FADE_START) / (FADE_END - FADE_START));
            setAlpha(1 - frame2Opacity);
          }
        },
      });
    };

    init().catch(console.error);

    return () => {
      cancelled = true;
      window.clearTimeout(snapTimeoutId);
      if (readyCheck) window.clearInterval(readyCheck);
      if (scrubRafRef.current) cancelAnimationFrame(scrubRafRef.current);
      if (heroAlphaRafRef.current) cancelAnimationFrame(heroAlphaRafRef.current);
      window.removeEventListener('scroll', onFirstUserScroll);
      trigger?.kill();
      scrollyVideo?.destroy?.();
    };
  }, []);

  const videoDimOpacity = scrubProgress < 0.78 ? 0.26 : 0.14;

  return (
    <div ref={wrapperRef} className="relative h-[500vh]">
      <div ref={stickyRef} className="sticky top-0 relative h-screen w-full overflow-hidden bg-black">
        {/* Mobile: scale 0.5, desktop: 0.8 */}
        <div className="absolute inset-0 origin-center scale-[0.5] md:scale-[0.8]">
          <div ref={canvasRef} className="absolute inset-0" />
        </div>

        {/* Subtle dim over bright frames for label readability */}
        <div
          className="absolute inset-0 z-[16] pointer-events-none bg-black"
          style={{ opacity: videoDimOpacity }}
        />

        <ExplosionLabels
          progress={scrubProgress}
          heroAlpha={heroAlpha}
          frame2Alpha={1 - heroAlpha}
        />

        <div
          ref={endGradientRef}
          className="absolute inset-0 z-[18] pointer-events-none"
          style={{
            opacity: 0,
            background: 'linear-gradient(to bottom, rgba(0,0,0,0) 55%, rgba(0,0,0,0.95) 100%)',
          }}
        />

        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center">
            <div className="h-10 w-10 rounded-full border-2 border-white/20 border-t-white animate-spin" />
          </div>
        )}

        {/* SECTION 1 — Hero (video ~0%) */}
        <div
          ref={heroRef}
          className="absolute inset-0 z-30 flex flex-col items-center justify-center px-6 pointer-events-none
                     transition-opacity duration-1000 ease-out"
        >
          <div className="pointer-events-auto flex max-w-3xl flex-col items-center text-center">
            <img
              src={logoSrc}
              alt="Logo Táctiles Punto 30"
              className="mb-5 h-14 w-14 rounded-xl object-cover md:mb-6 md:h-16 md:w-16"
            />
            <h1
              className="text-4xl font-extrabold tracking-[-0.04em] sm:text-5xl md:text-7xl"
              style={{ fontWeight: 800 }}
            >
              <span
                className="bg-gradient-to-b from-white/95 via-white/85 to-white/0 bg-clip-text text-transparent
                           drop-shadow-[0_0_26px_rgba(46,204,113,0.28)]"
              >
                Táctiles Punto 30
              </span>
            </h1>
            <p className="mt-5 max-w-md text-base font-light leading-relaxed text-[#A1A1A1] md:text-lg">
              Reparación de todo tipo dispositivos móviles.
            </p>
            <a
              href="https://wa.me/573125820019"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-neon-moving mt-10 inline-flex rounded-full bg-white px-8 py-3 text-sm font-semibold text-black
                         transition hover:bg-white/95"
            >
              Haz una reserva
            </a>
            <p className="mt-4 text-xs font-medium tracking-wide text-white/60 md:text-sm">
              Desliza hacia abajo
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
