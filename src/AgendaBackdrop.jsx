// Ken-Burns cross-fade slideshow behind the agenda section.
//
// The container sits absolutely behind the section content; a warm gradient
// scrim on top keeps text comfortably readable. Images rotate on a timer;
// when the user leaves the section it pauses (no wasted battery).

import { useState, useEffect, useRef } from 'react';

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

  return (
    <div className="agenda-bg" ref={ref} aria-hidden>
      {IMAGES.map((img, i) => (
        <div
          key={img.src}
          className={`agenda-bg-slide ${i === index ? 'active' : ''}`}
          style={{ backgroundImage: `url(${BASE}${img.src})` }}
        />
      ))}
      <div className="agenda-bg-scrim" />
    </div>
  );
};
