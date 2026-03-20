declare module 'scrolly-video/dist/ScrollyVideo.js' {
  interface ScrollyVideoOptions {
    scrollyVideoContainer: string | HTMLElement;
    src: string;
    trackScroll?: boolean;
    cover?: boolean;
    full?: boolean;
    sticky?: boolean;
    lockScroll?: boolean;
    transitionSpeed?: number;
    frameThreshold?: number;
    useWebCodecs?: boolean;
    onReady?: () => void;
    onChange?: () => void;
    debug?: boolean;
  }

  export default class ScrollyVideo {
    constructor(options: ScrollyVideoOptions);
    setTargetTimePercent(
      percent: number,
      options?: { jump?: boolean; transitionSpeed?: number },
    ): void;
    destroy(): void;
    currentTime: number;
    video: HTMLVideoElement;
    frames?: unknown[];
  }
}

