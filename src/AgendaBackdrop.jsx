// Ken-Burns cross-fade slideshow behind the agenda section.
//
// The container sits absolutely behind the section content; a warm gradient
// scrim on top keeps text comfortably readable. Images rotate on a timer;
// when the user leaves the section it pauses (no wasted battery).

import { useState, useEffect, useRef, useMemo } from 'react';

const BASE = import.meta.env.BASE_URL;

const IMAGES = [
  { src: 'agenda-bg/01-wedding-golden-hour.jpg', alt: 'Ոսկեվազ, մայրամուտի հարսանիքի տեսարան' },
  { src: 'agenda-bg/02-winery-courtyard.jpg',    alt: 'Ոսկեվազի գինու գործարանի բակ' },
  { src: 'agenda-bg/03-hovhannavank.jpg',        alt: 'Հովհաննավանք' },
  { src: 'agenda-bg/04-winery-ararat.jpg',       alt: 'Ոսկեվազ Արարատի ֆոնին' },
  { src: 'agenda-bg/05-karas-cellar.jpg',        alt: 'Ոսկեվազի հնագույն կարասներ' },
  { src: 'agenda-bg/06-winery-snow.jpg',         alt: 'Ոսկեվազ ձյան տակ' },
];

const INTERVAL = 7000; // ms between cross-fades
const REDUCED = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

export const AgendaBackdrop = () => {
  const [index, setIndex] = useState(0);
  const ref = useRef(null);
  const [active, setActive] = useState(true); // rotate only while section in view

  // Pause rotation when the agenda slide isn't on screen.
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(
      ([e]) => setActive(e.isIntersecting),
      { threshold: 0.2 }
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  // Advance the index on a timer. Respects reduced-motion by running at half
  // speed (no motion, just slow slide changes).
  useEffect(() => {
    if (!active) return;
    const delay = REDUCED() ? INTERVAL * 2 : INTERVAL;
    const id = setInterval(() => {
      setIndex(i => (i + 1) % IMAGES.length);
    }, delay);
    return () => clearInterval(id);
  }, [active]);

  // Preload the next image so the cross-fade doesn't flash blank.
  useEffect(() => {
    const next = new Image();
    next.src = BASE + IMAGES[(index + 1) % IMAGES.length].src;
  }, [index]);

  const pans = useMemo(() => IMAGES.map((_, i) => {
    // Deterministic pan per slot so it doesn't flicker every render.
    const seed = i * 1.618;
    const x = (Math.sin(seed) * 6).toFixed(1);        // -6..6%
    const y = (Math.cos(seed * 1.3) * 5).toFixed(1);  // -5..5%
    return { x, y };
  }), []);

  return (
    <div className="agenda-bg" ref={ref} aria-hidden>
      {IMAGES.map((img, i) => {
        const isActive = i === index;
        const { x, y } = pans[i];
        return (
          <div
            key={img.src}
            className={`agenda-bg-slide ${isActive ? 'active' : ''}`}
            style={{
              backgroundImage: `url(${BASE}${img.src})`,
              // Each slide slow-zooms while visible. Base scale 1.08 so the
              // pan never reveals empty edges.
              '--pan-x': `${x}%`,
              '--pan-y': `${y}%`,
            }}
          />
        );
      })}
      <div className="agenda-bg-scrim" />
    </div>
  );
};
