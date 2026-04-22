// Custom-chrome video player. Native controls are hidden; we paint our
// own play overlay, progress bar, and mute toggle in the site's palette.

import { useState, useEffect, useRef } from 'react';
import { VIDEO_SOURCES, VIDEO_POSTER } from './videoConfig.js';

function formatTime(sec) {
  if (!Number.isFinite(sec)) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export const VideoPlayer = () => {
  const videoRef = useRef(null);
  const hideTimerRef = useRef(null);
  // Remembers whether the video was playing right before we auto-paused it on
  // scroll-out, so we can resume when the user scrolls back in.
  const wasPlayingRef = useRef(false);
  const [started, setStarted] = useState(false);   // true after first play
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [progress, setProgress] = useState(0);     // 0..1
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [chromeVisible, setChromeVisible] = useState(true);

  // Auto-pause when the video slide scrolls out of view; auto-resume when it
  // comes back — but only if the user had it playing before (never start
  // uninvited).
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          if (wasPlayingRef.current) v.play().catch(() => {});
        } else {
          if (!v.paused) {
            wasPlayingRef.current = true;
            v.pause();
          } else {
            wasPlayingRef.current = false;
          }
        }
      });
    }, { threshold: 0.5 });
    obs.observe(v);
    return () => obs.disconnect();
  }, []);

  // Hide controls 2s after the user stops interacting *while playing*.
  const armHide = () => {
    clearTimeout(hideTimerRef.current);
    setChromeVisible(true);
    if (!playing) return;
    hideTimerRef.current = setTimeout(() => setChromeVisible(false), 2000);
  };

  useEffect(() => {
    armHide();
    return () => clearTimeout(hideTimerRef.current);
  }, [playing]); // eslint-disable-line react-hooks/exhaustive-deps

  const onPlay = () => setPlaying(true);
  const onPause = () => setPlaying(false);
  // With `loop` the native video element seeks back to 0 and keeps playing
  // without firing `ended`. The handler is kept as a safety net in case the
  // user disables looping later.
  const onEnded = () => { setPlaying(false); setStarted(false); };
  const onTimeUpdate = () => {
    const v = videoRef.current;
    if (!v) return;
    setCurrent(v.currentTime);
    setProgress(v.duration ? v.currentTime / v.duration : 0);
  };
  const onLoadedMeta = () => {
    const v = videoRef.current;
    if (v) setDuration(v.duration || 0);
  };

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play().catch(() => {});
      setStarted(true);
    } else {
      v.pause();
    }
  };

  const toggleMute = (e) => {
    e?.stopPropagation();
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  };

  const seek = (e) => {
    e.stopPropagation();
    const v = videoRef.current;
    if (!v || !v.duration) return;
    const bar = e.currentTarget.getBoundingClientRect();
    const x = Math.min(Math.max(0, e.clientX - bar.left), bar.width);
    v.currentTime = (x / bar.width) * v.duration;
  };

  return (
    <div
      className={`vp ${started ? 'vp-started' : ''} ${playing ? 'vp-playing' : 'vp-paused'} ${chromeVisible ? '' : 'vp-chrome-hidden'}`}
      onMouseMove={armHide}
      onClick={togglePlay}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); togglePlay(); }
        if (e.key === 'm') { e.preventDefault(); toggleMute(); }
      }}
    >
      <video
        ref={videoRef}
        className="vp-video"
        playsInline
        preload="auto"
        loop
        poster={VIDEO_POSTER}
        onPlay={onPlay}
        onPause={onPause}
        onEnded={onEnded}
        onTimeUpdate={onTimeUpdate}
        onLoadedMetadata={onLoadedMeta}
      >
        {VIDEO_SOURCES.map(s => (
          <source key={s.src} src={s.src} type={s.type} />
        ))}
      </video>

      {/* Dim overlay on top of the poster — softens the still so our UI reads. */}
      {!started && <div className="vp-poster-dim" aria-hidden />}

      {/* Center play / pause button. Always rendered, faded by CSS when needed. */}
      <button className="vp-play" type="button" aria-label={playing ? 'Pause' : 'Play'} onClick={(e) => { e.stopPropagation(); togglePlay(); }}>
        <svg viewBox="0 0 72 72" width="72" height="72" aria-hidden>
          <circle cx="36" cy="36" r="34" fill="rgba(251,245,236,0.95)" stroke="var(--c-wine)" strokeWidth="1.5" />
          {playing ? (
            <g fill="var(--c-wine)">
              <rect x="26" y="22" width="6" height="28" rx="1.5" />
              <rect x="40" y="22" width="6" height="28" rx="1.5" />
            </g>
          ) : (
            <path d="M 28 20 L 52 36 L 28 52 Z" fill="var(--c-wine)" />
          )}
        </svg>
      </button>

      {/* Bottom chrome — progress + mute. Only visible after first play. */}
      <div className="vp-chrome" onClick={(e) => e.stopPropagation()}>
        <button className="vp-btn" type="button" onClick={toggleMute} aria-label={muted ? 'Unmute' : 'Mute'}>
          <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden>
            <path d="M 4 9 H 8 L 13 5 V 19 L 8 15 H 4 Z" fill="var(--c-ivory)" />
            {muted ? (
              <g stroke="var(--c-ivory)" strokeWidth="2" strokeLinecap="round">
                <line x1="16" y1="9" x2="22" y2="15" />
                <line x1="22" y1="9" x2="16" y2="15" />
              </g>
            ) : (
              <g fill="none" stroke="var(--c-ivory)" strokeWidth="1.8" strokeLinecap="round">
                <path d="M 16 9 Q 19 12 16 15" />
                <path d="M 18 6 Q 23 12 18 18" />
              </g>
            )}
          </svg>
        </button>

        <div className="vp-progress-wrap" onClick={seek}>
          <div className="vp-progress-track" />
          <div className="vp-progress-fill" style={{ width: `${progress * 100}%` }} />
          <div className="vp-progress-thumb" style={{ left: `${progress * 100}%` }} />
        </div>

        <div className="vp-time">
          {formatTime(current)} / {formatTime(duration)}
        </div>
      </div>
    </div>
  );
};
