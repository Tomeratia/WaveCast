import { useEffect, useRef } from 'react';
import Hls from 'hls.js';

interface HlsPlayerProps {
  src: string;
  className?: string;
}

export function HlsPlayer({ src, className = '' }: HlsPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (Hls.isSupported()) {
      const hls = new Hls({ liveSyncDurationCount: 3 });
      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => {});
      });
      return () => hls.destroy();
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Safari native HLS
      video.src = src;
      video.play().catch(() => {});
    }
  }, [src]);

  return (
    <video
      ref={videoRef}
      className={`w-full h-full object-cover ${className}`}
      muted
      playsInline
      autoPlay
    />
  );
}
