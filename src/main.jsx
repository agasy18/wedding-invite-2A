import { useState, useEffect, useMemo } from 'react';
import { createRoot } from 'react-dom/client';

import { FloralDefs } from './florals.jsx';
import {
  HeroSection, CountdownSection, ScheduleSection, VenuesSection,
  GallerySection, VideoSection, RsvpSection,
} from './sections.jsx';
import { readGuestNameFromUrl, readGuestCountFromUrl } from './nameCodec.js';

const NavDots = ({ sections, active, onGo }) => (
  <nav className="nav-dots" aria-label="sections">
    {sections.map((s, i) => (
      <button key={s.id}
        className={`nav-dot ${i === active ? 'active' : ''}`}
        onClick={() => onGo(i)}
        aria-label={s.label} />
    ))}
  </nav>
);

const sectionDefs = [
  { id: 'hero', label: 'Հրավեր' },
  { id: 'video', label: 'Տեսահոլովակ' },
  { id: 'countdown', label: 'Մնաց' },
  { id: 'schedule', label: 'Օրակարգ' },
  { id: 'gallery', label: 'Պահեր' },
  { id: 'rsvp', label: 'Հաստատում' },
];

const App = () => {
  const [active, setActive] = useState(0);

  const guestName = useMemo(() => readGuestNameFromUrl(), []);
  const defaultGuests = useMemo(() => readGuestCountFromUrl(), []);

  useEffect(() => {
    document.documentElement.dataset.density = 'whisper';
  }, []);

  useEffect(() => {
    const els = sectionDefs.map(s => document.getElementById(s.id)).filter(Boolean);
    if (els.length === 0) return;
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const idx = els.indexOf(e.target);
          if (idx >= 0) setActive(idx);
        }
      });
    }, { threshold: 0.5 });
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const goTo = (i) => {
    const el = document.getElementById(sectionDefs[i].id);
    if (el) window.scrollTo({ top: el.offsetTop, behavior: 'smooth' });
  };

  return (
    <div className="app">
      <FloralDefs />

      <div id="hero"><HeroSection guestName={guestName} /></div>
      <div id="video"><VideoSection /></div>
      <div id="countdown"><CountdownSection /></div>
      <div id="schedule"><ScheduleSection /></div>
      <div id="gallery"><GallerySection /></div>
      <div id="rsvp"><RsvpSection guestName={guestName} defaultGuests={defaultGuests} /></div>

      <NavDots sections={sectionDefs} active={active} onGo={goTo} />
    </div>
  );
};

createRoot(document.getElementById('root')).render(<App />);
