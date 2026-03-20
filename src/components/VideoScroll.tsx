import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import videoSrcMobile from '../assets/punto30video.mp4';
import videoSrcMobileSafe from '../assets/punto30video-mobile-safe.mp4';
import videoSrcDesktop from '../assets/punto30video-desktop.mp4';
import logoSrc from '../assets/punto30icon.webp';
import { ExplosionLabels } from './ExplosionLabels.tsx';

gsap.registerPlugin(ScrollTrigger);

/** Mobile Safari only: extra spacing between seeks so decode can keep up. Desktop keeps full rAF rate. */
const SAFARI_MOBILE_MIN_SEEK_INTERVAL_MS = 48;

type ScrollyVideoInstance = {
  setTargetTimePercent: (n: number, opts?: { jump?: boolean; transitionSpeed?: number }) => void;
  destroy?: () => void;
  frames?: unknown[];
};

type ScrollyVideoCtor = new (opts: Record<string, unknown>) => ScrollyVideoInstance;

export default function VideoScroll() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const endGradientRef = useRef<HTMLDivElement>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [scrubProgress, setScrubProgress] = useState(0);
  const [heroAlpha, setHeroAlpha] = useState(1);
  const [isMobileView, setIsMobileView] = useState(false);

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
    const video = videoRef.current;
    const sticky = stickyRef.current;
    if (!wrapper || !container || !video) return;

    const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
    const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(ua);
    const isSafari =
      /Safari/i.test(ua) && !/Chrome|CriOS|Chromium|Android/i.test(ua);
    const safariMobileSeekThrottle = isSafari && isMobile;
    setIsMobileView(isMobile);

    /** False until `loadedmetadata` + valid duration — scroll can run, but we don't drive currentTime. */
    const videoMetadataReadyRef = { current: false };
    const hasScrollStartedRef = { current: false };
    const isSnappingRef = { current: false };
    const atEndRef = { current: false };

    /** Desktop scrolly-video instance (canvas/WebCodecs) */
    let scrollyVideo: ScrollyVideoInstance | null = null;
    const scrollyReadyRef = { current: false };
    let scrollyReadyCheck: number | null = null;

    let snapRafId = 0;
    const snapEase = gsap.parseEase('power2.inOut');

    /** Latest scroll-mapped percent [0,1] for the video timeline. */
    const pendingPercentRef = { current: 0 };
    let seekRafId = 0;
    let lastSeekAppliedMs = 0;
    // Desktop: coalesce scrolly seeks to rAF (avoid flooding).
    let desktopScrubRaf = 0;
    let pendingDesktopProgress: number | null = null;

    const snapTo = (targetY: number) => {
      isSnappingRef.current = true;
      if (snapRafId) cancelAnimationFrame(snapRafId);

      const startY = window.scrollY;
      const dy = targetY - startY;
      if (Math.abs(dy) < 3) {
        isSnappingRef.current = false;
        ScrollTrigger.update();
        return;
      }

      const durationMs = 1250;
      const t0 = performance.now();

      const loop = () => {
        if (cancelled) {
          snapRafId = 0;
          return;
        }
        const rawT = Math.min(1, (performance.now() - t0) / durationMs);
        const easedT = snapEase(rawT);
        window.scrollTo(0, startY + dy * easedT);
        ScrollTrigger.update();

        if (rawT < 1) {
          snapRafId = requestAnimationFrame(loop);
        } else {
          snapRafId = 0;
          isSnappingRef.current = false;
          ScrollTrigger.update();
        }
      };

      snapRafId = requestAnimationFrame(loop);
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

    let trigger: ScrollTrigger | null = null;
    let cancelled = false;

    // --- Mobile <video> setup (mount) ---
    video.loop = false;
    video.preload = 'auto';
    video.style.transform = 'translateZ(0)';
    // Desktop uses canvas; keep video out of the way (but still present for mobile).
    video.style.display = isMobile ? 'block' : 'none';

    const initDesktopScrolly = async () => {
      if (isMobile) return;
      const mod = await import('scrolly-video/dist/ScrollyVideo.js');
      const CtorUnknown = (mod as { default?: unknown }).default ?? mod;
      if (typeof CtorUnknown !== 'function') throw new Error('ScrollyVideo constructor not found');
      const Ctor = CtorUnknown as ScrollyVideoCtor;

      scrollyVideo = new Ctor({
        scrollyVideoContainer: container,
        src: videoSrcDesktop,
        trackScroll: false,
        cover: true,
        sticky: false,
        full: false,
        frameThreshold: 0,
        transitionSpeed: 8,
        useWebCodecs: true,
      });

      scrollyReadyCheck = window.setInterval(() => {
        if (cancelled) {
          if (scrollyReadyCheck) window.clearInterval(scrollyReadyCheck);
          scrollyReadyCheck = null;
          return;
        }
        const hasCanvas = Boolean(container.querySelector('canvas'));
        if (hasCanvas) {
          scrollyReadyRef.current = true;
          setIsLoading(false);
          if (heroRef.current) {
            gsap.to(heroRef.current, { opacity: 1, duration: 0.8, ease: 'power2.out' });
          }
          if (scrollyReadyCheck) window.clearInterval(scrollyReadyCheck);
          scrollyReadyCheck = null;
          ScrollTrigger.refresh();
          queueMicrotask(() => ScrollTrigger.update());
        }
      }, 100);
    };

    const applyVideoSeekFromPending = () => {
      seekRafId = 0;
      if (cancelled || !videoMetadataReadyRef.current) return;

      if (video.seeking) {
        seekRafId = requestAnimationFrame(applyVideoSeekFromPending);
        return;
      }

      const duration = video.duration;
      if (!Number.isFinite(duration) || duration <= 0.11) return;

      const calculatedTime = pendingPercentRef.current * duration;
      const cappedTime = Math.min(duration - 0.1, Math.max(0, calculatedTime));

      if (safariMobileSeekThrottle) {
        const now = performance.now();
        if (now - lastSeekAppliedMs < SAFARI_MOBILE_MIN_SEEK_INTERVAL_MS) {
          seekRafId = requestAnimationFrame(applyVideoSeekFromPending);
          return;
        }
      }

      if (Math.abs(video.currentTime - cappedTime) < 0.001) return;

      lastSeekAppliedMs = performance.now();
      video.currentTime = cappedTime;
    };

    const scheduleVideoSeek = () => {
      if (seekRafId) return;
      seekRafId = requestAnimationFrame(applyVideoSeekFromPending);
    };

    const onLoadedMetadata = () => {
      const d = video.duration;
      if (!Number.isFinite(d) || d <= 0.11) return;
      videoMetadataReadyRef.current = true;
      video.loop = false;
      // Strict end cap on first paint (same rule as scroll-driven seeks).
      video.currentTime = Math.min(d - 0.1, 0);
      setIsLoading(false);

      if (heroRef.current) {
        gsap.to(heroRef.current, { opacity: 1, duration: 0.8, ease: 'power2.out' });
      }

      ScrollTrigger.refresh();
      queueMicrotask(() => ScrollTrigger.update());
    };

    video.addEventListener('loadedmetadata', onLoadedMetadata);
    initDesktopScrolly().catch(console.error);

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
        const p = self.progress;
        queueScrubUpdate(p);

        const mappedProgress = !hasScrollStartedRef.current ? 0 : p;

        if (
          !isSnappingRef.current &&
          !atEndRef.current &&
          self.direction === 1 &&
          p > 0.02 &&
          p < 0.9
        ) {
          atEndRef.current = true;
          setAlpha(0);
          const endY =
            wrapper.getBoundingClientRect().top +
            window.scrollY +
            wrapper.offsetHeight -
            window.innerHeight;
          snapTo(endY);
        }

        if (
          !isSnappingRef.current &&
          atEndRef.current &&
          self.direction === -1 &&
          p > 0.88
        ) {
          atEndRef.current = false;
          setAlpha(1);
          const startY = wrapper.getBoundingClientRect().top + window.scrollY;
          snapTo(startY);
        }

        if (!isSnappingRef.current) {
          const FADE_START = 0.03;
          const FADE_END = 0.2;
          const frame2Opacity = gsap.utils.clamp(0, 1, (p - FADE_START) / (FADE_END - FADE_START));
          setAlpha(1 - frame2Opacity);
        }

        if (endGradientRef.current) {
          const endFade = gsap.utils.clamp(0, 1, (p - 0.92) / 0.08);
          endGradientRef.current.style.opacity = String(endFade);
        }

        // Drive the appropriate renderer.
        if (isMobile) {
          if (!videoMetadataReadyRef.current) return;
          pendingPercentRef.current = Math.max(0, Math.min(1, mappedProgress));
          scheduleVideoSeek();
          return;
        }

        if (!scrollyVideo || !scrollyReadyRef.current) return;
        pendingDesktopProgress = Math.max(0, Math.min(1, mappedProgress));
        if (!desktopScrubRaf) {
          desktopScrubRaf = requestAnimationFrame(() => {
            desktopScrubRaf = 0;
            if (pendingDesktopProgress !== null && scrollyVideo) {
              scrollyVideo.setTargetTimePercent(pendingDesktopProgress);
            }
            pendingDesktopProgress = null;
          });
        }
      },
    });

    return () => {
      cancelled = true;
      if (seekRafId) cancelAnimationFrame(seekRafId);
      if (snapRafId) cancelAnimationFrame(snapRafId);
      if (desktopScrubRaf) cancelAnimationFrame(desktopScrubRaf);
      if (scrollyReadyCheck) window.clearInterval(scrollyReadyCheck);
      if (scrubRafRef.current) cancelAnimationFrame(scrubRafRef.current);
      if (heroAlphaRafRef.current) cancelAnimationFrame(heroAlphaRafRef.current);
      video.removeEventListener('loadedmetadata', onLoadedMetadata);
      window.removeEventListener('scroll', onFirstUserScroll);
      trigger?.kill();
      scrollyVideo?.destroy?.();
    };
  }, []);

  const videoDimOpacity = scrubProgress < 0.78 ? 0.26 : 0.14;

  return (
    <div ref={wrapperRef} className="relative h-[500vh]">
      <div ref={stickyRef} className="sticky top-0 relative h-screen w-full overflow-hidden bg-black">
        <div
          className={`absolute inset-0 origin-center ${
            isMobileView ? 'scale-[1.7]' : 'scale-[1.5]'
          } md:scale-[0.8]`}
        >
          <div ref={canvasRef} className="absolute inset-0">
            <video
              ref={videoRef}
              className={`absolute inset-0 h-full w-full ${
                isMobileView ? 'object-contain' : 'object-cover'
              }`}
              muted
              playsInline
              preload="auto"
              loop={false}
              suppressHydrationWarning
            >
              {/* Mobile compatibility: prefer safe baseline H.264 encode first. */}
              <source src={videoSrcMobileSafe} type="video/mp4" />
              <source src={videoSrcMobile} type="video/mp4" />
            </video>
          </div>
        </div>

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
