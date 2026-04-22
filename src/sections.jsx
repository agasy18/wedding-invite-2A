// Seven sections of the Aghasi & Anna invitation.

import { useState, useEffect, useRef, useMemo } from 'react';
import {
  Rose, Daisy, Cosmos, Cluster, Petal, ArmDivider, Wreath, FloralPin,
} from './components/florals.jsx';
import { pronoun } from './lib/nameCodec.js';
import { submitRsvp } from './lib/rsvpForm.js';
import { VideoPlayer } from './components/VideoPlayer.jsx';
import { AgendaBackdrop } from './components/AgendaBackdrop.jsx';
import { buildOccupancy, findEmptyRects, rectToCell } from './lib/gridFillers.js';
import { Reveal } from './components/Reveal.jsx';
import { ScrollCue } from './components/ScrollCue.jsx';

// --- Section 1: Hero --------------------------------------------------------

export const HeroSection = ({ guestName }) => {
  return (
    <section className="section hero" data-screen-label="01 Invitation">
      {/* drifting petals behind wreath */}
      <div className="hero-petals" aria-hidden>
        {Array.from({ length: 14 }).map((_, i) => {
          const colors = ['var(--c-blush)','var(--c-butter)','var(--c-peri)','var(--c-coral)','var(--c-ivory)'];
          return (
            <div key={i} className="drift" style={{
              left: `${(i * 7.3) % 100}%`,
              animationDelay: `${-i * 1.4}s`,
              animationDuration: `${16 + (i % 5) * 3}s`,
            }}>
              <Petal size={14 + (i % 4) * 4} color={colors[i % colors.length]} />
            </div>
          );
        })}
      </div>

      <div className="hero-inner">
        <div className="hero-wreath" aria-hidden>
          <Wreath width={760} height={760} />
        </div>

        <div className="hero-center">
          <Reveal delay={200}>
            <div className="eyebrow">
              <ArmDivider width={120} />
              <span>Սիրելի <span className="guest">{guestName || '{ անուն }'}</span></span>
              <ArmDivider width={120} />
            </div>
          </Reveal>

          <Reveal delay={450}>
            <p className="hero-invite">
              Սիրով հրավիրում ենք {pronoun(guestName, 'you')}<br/>մեր հարսանյաց արարողությանը
            </p>
          </Reveal>

          <Reveal delay={700}>
            <h1 className="hero-names">
              <span className="n-first">Աղասի</span>
              <span className="n-amp">և</span>
              <span className="n-second">Աննա</span>
            </h1>
          </Reveal>

          <Reveal delay={950}>
            <div className="hero-date">
              <span>06</span>
              <span className="dot">·</span>
              <span>09</span>
              <span className="dot">·</span>
              <span>2026</span>
            </div>
            <div className="hero-date-sub">Կիրակի · Հայաստան</div>
          </Reveal>
        </div>
      </div>

      <ScrollCue nextId="video" />
    </section>
  );
};

// --- Section 2: Countdown ---------------------------------------------------

export const CountdownSection = () => {
  const target = useMemo(() => new Date('2026-09-06T15:30:00+04:00').getTime(), []);
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const diff = Math.max(0, target - now);
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  const secs = Math.floor((diff % 60000) / 1000);

  const Unit = ({ value, label }) => (
    <div className="cd-unit">
      <div className="cd-num">
        <TickNumber value={value} />
      </div>
      <div className="cd-label">{label}</div>
    </div>
  );

  return (
    <section className="section countdown" data-screen-label="02 Countdown">
      <div className="decor-corner tl"><Rose size={110} color="var(--c-blush)" /></div>
      <div className="decor-corner br"><Cosmos size={90} color="var(--c-peri)" /></div>

      <Reveal><div className="section-kicker"><ArmDivider width={80} /></div></Reveal>
      <Reveal delay={120}><h2 className="section-title">Մնաց</h2></Reveal>
      <Reveal delay={240}>
        <div className="countdown-grid">
          <Unit value={days} label="օր" />
          <Divider />
          <Unit value={hours} label="ժամ" />
          <Divider />
          <Unit value={mins} label="րոպե" />
          <Divider />
          <Unit value={secs} label="վրկ" />
        </div>
      </Reveal>
      <Reveal delay={380}>
        <p className="countdown-foot">մինչև մեր մեծ օրը</p>
      </Reveal>
      <ScrollCue nextId="schedule" />
    </section>
  );
};

const Divider = () => <div className="cd-divider" aria-hidden><Daisy size={22} /></div>;

// Flip-ticker for numbers
const TickNumber = ({ value }) => {
  const str = String(value).padStart(2, '0');
  return (
    <span className="tick-row">
      {str.split('').map((ch, i) => (
        <TickDigit key={i} digit={ch} />
      ))}
    </span>
  );
};

const TickDigit = ({ digit }) => {
  const [prev, setPrev] = useState(digit);
  const [curr, setCurr] = useState(digit);
  const [anim, setAnim] = useState(false);
  useEffect(() => {
    if (digit !== curr) {
      setPrev(curr);
      setCurr(digit);
      setAnim(true);
      const id = setTimeout(() => setAnim(false), 520);
      return () => clearTimeout(id);
    }
  }, [digit]); // eslint-disable-line
  return (
    <span className="tick-digit">
      {anim ? (
        <>
          <span className="tick-face from">{prev}</span>
          <span className="tick-face to">{curr}</span>
        </>
      ) : (
        <span className="tick-face">{curr}</span>
      )}
    </span>
  );
};

// --- Section 3: Schedule ----------------------------------------------------

export const ScheduleSection = () => {
  const items = [
    {
      time: '15:30',
      title: 'Պսակադրություն',
      venue: 'Հովհաննավանք',
      addr: 'Օհանավան, Արագածոտնի մարզ',
      mapLinks: [
        { label: 'Google Maps', url: 'https://maps.app.goo.gl/oXYfuaTVpYhbXRYE8' },
        { label: 'Yandex Maps', url: 'https://yandex.com/maps/-/CPC-ASzc' },
      ],
      flower: <Rose size={72} color="var(--c-blush)" />,
    },
    {
      time: '18:00',
      title: 'Հարսանյաց հանդիսություն',
      venue: 'Ոսկեվազի Գինու Գործարան',
      addr: 'Ոսկեվազ, Արագածոտնի մարզ',
      mapLinks: [
        { label: 'Google Maps', url: 'https://maps.app.goo.gl/UnzKpZSZVogbC2kv9' },
        { label: 'Yandex Maps', url: 'https://yandex.com/maps/-/CPC-E01X' },
      ],
      flower: <Cosmos size={64} color="var(--c-coral)" />,
    },
  ];
  return (
    <section className="section schedule" data-screen-label="03 Schedule">
      <AgendaBackdrop />
      <div className="schedule-card">
        <Reveal><div className="section-kicker"><ArmDivider width={80} /></div></Reveal>
        <Reveal delay={100}>
          <h2 className="section-title">Օրակարգ</h2>
          <p className="section-sub">06 Սեպտեմբերի 2026</p>
        </Reveal>

        <div className="story-rail">
          <div className="story-line" />
          {items.map((it, i) => (
            <Reveal key={i} delay={280 + i * 220} className="story-step" as="div">
              <div className="story-medallion" aria-hidden>{it.flower}</div>
              <div className="story-step-body">
                <div className="story-time">{it.time}</div>
                <div className="story-title-line">{it.title}</div>
                {it.venue && <div className="story-venue">{it.venue}</div>}
                {it.addr && <div className="story-addr">{it.addr}</div>}
                {it.mapLinks && it.mapLinks.length > 0 && (
                  <div className="story-cta-row">
                    {it.mapLinks.map(m => (
                      <a key={m.url} className="story-cta" href={m.url} target="_blank" rel="noopener">
                        <FloralPin size={14} /> {m.label}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
      <ScrollCue nextId="gallery" />
    </section>
  );
};

// --- Section 4: Gallery -----------------------------------------------------

// DOM glue for the gallery's dynamic floral fillers. Measures each photo
// tile's pixel rect, hands the numbers to gridFillers (pure, unit-tested),
// and re-runs on resize. Returns the filler rectangles in cell coordinates.
const useGridFillers = (gridRef, photoCount) => {
  const [rects, setRects] = useState([]);
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;

    const measure = () => {
      const cs = getComputedStyle(grid);
      const colTracks = cs.gridTemplateColumns.split(/\s+/).map(parseFloat).filter(n => !isNaN(n));
      const cols = colTracks.length;
      if (cols < 2) { setRects([]); return; }
      const colStride = colTracks[0];
      const gapX = parseFloat(cs.columnGap || cs.gap || '0') || 0;
      const gapY = parseFloat(cs.rowGap || cs.gap || '0') || 0;

      // Row height from gridTemplateRows (resolved track list). An earlier
      // version derived this from the delta between the first two distinct
      // tile tops, which broke under grid-auto-flow: dense — a 3-row-tall
      // hero tile could push the second unique top 2 rows down, doubling
      // the inferred stride and collapsing every tile to rowSpan=1.
      const rowTracks = cs.gridTemplateRows.split(/\s+/).map(parseFloat).filter(n => !isNaN(n));
      const rowHeight = rowTracks[0] || parseFloat(cs.gridAutoRows) || 120;
      const rowStride = rowHeight + gapY;
      if (rowStride <= 0) { setRects([]); return; }

      const gridRect = grid.getBoundingClientRect();
      const tiles = Array.from(grid.querySelectorAll('.gm-item'));
      if (tiles.length === 0) { setRects([]); return; }

      const placed = tiles.map(t => {
        const r = t.getBoundingClientRect();
        return rectToCell(
          { x: r.left - gridRect.left, y: r.top - gridRect.top, width: r.width, height: r.height },
          { colStride, rowStride, gapX, gapY }
        );
      });
      setRects(findEmptyRects(buildOccupancy(placed, cols)));
    };

    const raf = requestAnimationFrame(measure);
    const ro = new ResizeObserver(measure);
    ro.observe(grid);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, [gridRef, photoCount]);
  return rects;
};

export const GallerySection = () => {
  const photos = [
    { n: '08', span: 'span-hero' },   // ring — full-width anchor/opener
    { n: '02', span: 'span-tall' },
    { n: '03', span: 'span-tall' },
    { n: '04', span: 'span-1' },
    { n: '05', span: 'span-wide' },
    { n: '06', span: 'span-1' },
    { n: '07', span: 'span-tall' },
    { n: '01', span: 'span-tall' },   // embrace — finale
  ];
  const base = import.meta.env.BASE_URL;
  const gridRef = useRef(null);
  const fillerRects = useGridFillers(gridRef, photos.length);

  const [preview, setPreview] = useState(null); // index of photo shown in lightbox

  useEffect(() => {
    if (preview == null) return;
    const onKey = (e) => { if (e.key === 'Escape') setPreview(null); };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [preview]);

  const go = (delta) => {
    setPreview((i) => {
      if (i == null) return i;
      return (i + delta + photos.length) % photos.length;
    });
  };

  return (
    <section className="section gallery" data-screen-label="05 Gallery">
      <Reveal><div className="section-kicker"><ArmDivider width={80} /></div></Reveal>
      <Reveal delay={100}><h2 className="section-title">Մեր պահերը</h2></Reveal>

      <div className="gallery-mosaic" ref={gridRef}>
        {photos.map((p, i) => (
          <Reveal key={p.n} delay={100 + (i % 4) * 60} className={`gm-item ${p.span}`} as="button">
            <img
              className="gm-img"
              src={`${base}gallery/${p.n}.jpg`}
              alt=""
              loading={i < 4 ? 'eager' : 'lazy'}
              decoding="async"
              onClick={() => setPreview(i)}
            />
          </Reveal>
        ))}
        {/* Dynamic floral fillers. Positions and sizes are measured from the
            laid-out grid (see useGridFillers) so each rectangle exactly covers
            an empty region. The motif rotates through a small pool for visual
            variety. */}
        {fillerRects.map((r, i) => {
          const MOTIFS = [Rose, Daisy, Cosmos, Cluster, Petal];
          const Motif = MOTIFS[i % MOTIFS.length];
          return (
            <div
              key={`f-${r.col}-${r.row}`}
              className="gm-filler"
              aria-hidden
              style={{
                gridColumn: `${r.col + 1} / span ${r.colSpan}`,
                gridRow: `${r.row + 1} / span ${r.rowSpan}`,
              }}
            >
              <Motif size={64} />
            </div>
          );
        })}
      </div>

      {preview != null && (
        <div className="gm-lightbox" role="dialog" aria-modal="true" onClick={() => setPreview(null)}>
          <button className="gm-close" aria-label="Փակել" onClick={(e) => { e.stopPropagation(); setPreview(null); }}>×</button>
          <button className="gm-nav gm-prev" aria-label="Նախորդը" onClick={(e) => { e.stopPropagation(); go(-1); }}>‹</button>
          <img
            className="gm-lightbox-img"
            src={`${base}gallery/${photos[preview].n}.jpg`}
            alt=""
            onClick={(e) => e.stopPropagation()}
          />
          <button className="gm-nav gm-next" aria-label="Հաջորդը" onClick={(e) => { e.stopPropagation(); go(1); }}>›</button>
        </div>
      )}
      <ScrollCue nextId="rsvp" />
    </section>
  );
};

// --- Section 6: Video -------------------------------------------------------

export const VideoSection = ({ guestName }) => {
  const you = pronoun(guestName, 'you');
  return (
    <section className="section video" data-screen-label="06 Video">
      <Reveal className="video-frame" as="div">
        <div className="video-flower tl" aria-hidden><Rose size={90} color="var(--c-blush)" /></div>
        <div className="video-flower br" aria-hidden><Cosmos size={70} color="var(--c-coral)" /></div>
        <VideoPlayer />
      </Reveal>

      <Reveal delay={220}>
        <p className="video-caption">Հատուկ {you} համար</p>
      </Reveal>
      <ScrollCue nextId="countdown" />
    </section>
  );
};

// --- Section 7: RSVP --------------------------------------------------------

export const RsvpSection = ({ guestName, defaultGuests = 1 }) => {
  // idle | form | decline | submitting | sent | declined | error
  const [state, setState] = useState('idle');
  const [guests, setGuests] = useState(defaultGuests);
  const [burst, setBurst] = useState(false);
  const [lastAttempt, setLastAttempt] = useState(null); // { attending, guests } for retry
  const [error, setError] = useState('');

  const send = async ({ attending, guests: g }) => {
    setLastAttempt({ attending, guests: g });
    setError('');
    setState('submitting');
    try {
      await submitRsvp({
        name: guestName || '',
        attending,
        guests: g,
      });
      if (attending === 'yes') {
        setBurst(true);
        setTimeout(() => setBurst(false), 4500);
        setState('sent');
      } else {
        setState('declined');
      }
    } catch (e) {
      setError(e?.message || 'Network error');
      setState('error');
    }
  };

  const retry = () => {
    if (lastAttempt) send(lastAttempt);
  };

  const you = pronoun(guestName, 'you');
  const your = pronoun(guestName, 'your');
  const youBe = pronoun(guestName, 'youBe');
  const confirmVerb = pronoun(guestName, 'confirm');

  const showForm = state === 'idle' || state === 'form' || state === 'decline'
    || state === 'submitting' || state === 'error';

  return (
    <section className="section rsvp" data-screen-label="07 RSVP">
      <Reveal><div className="section-kicker"><ArmDivider width={80} /></div></Reveal>
      <Reveal delay={100}><h2 className="section-title">{confirmVerb} {your} մասնակցությունը</h2></Reveal>

      <div className="rsvp-card">
        <div className="rsvp-flower tl" aria-hidden><Cluster size={80} color="var(--c-peri)" /></div>
        <div className="rsvp-flower br" aria-hidden><Rose size={100} color="var(--c-blush)" /></div>

        {showForm && (
          <>
            <div className="rsvp-greeting">
              Սիրելի <em>{guestName || '{ անուն }'}</em>,
            </div>

            {(state === 'idle' || state === 'error') && (
              <>
                <p className="rsvp-body">
                  {your} ներկայությունը մեծագույն նվերն է մեզ համար։
                </p>
                <button className="btn-primary" onClick={() => setState('form')}>
                  Հաստատել մասնակցությունը
                </button>
                <button className="btn-ghost" onClick={() => setState('decline')}>
                  Չեմ կարող ներկա գտնվել
                </button>
              </>
            )}

            {state === 'form' && (
              <div className="rsvp-form">
                <label className="rsvp-label">Քանի՞ հոգի եք լինելու</label>
                <div className="stepper">
                  <button onClick={() => setGuests(Math.max(1, guests - 1))}>−</button>
                  <span className="stepper-val">{guests}</span>
                  <button onClick={() => setGuests(Math.min(6, guests + 1))}>+</button>
                </div>
                <button className="btn-primary" onClick={() => send({ attending: 'yes', guests })}>
                  Ուղարկել հաստատումը
                </button>
              </div>
            )}

            {state === 'decline' && (
              <div className="rsvp-form">
                <p className="rsvp-body">Կցանկանայի՞ք տեղեկացնել, որ չեք կարող ներկա գտնվել։</p>
                <button className="btn-primary" onClick={() => send({ attending: 'no' })}>
                  Ուղարկել
                </button>
                <button className="btn-ghost" onClick={() => setState('idle')}>
                  Վերադառնալ
                </button>
              </div>
            )}

            {state === 'submitting' && (
              <div className="rsvp-form">
                <p className="rsvp-body">Ուղարկում ենք…</p>
              </div>
            )}

            {state === 'error' && (
              <div className="rsvp-form" style={{ marginTop: 12 }}>
                <p className="rsvp-body" style={{ color: 'var(--c-wine)' }}>
                  Ինչ-որ բան չստացվեց։ Խնդրում ենք փորձել կրկին։
                </p>
                {lastAttempt && (
                  <button className="btn-primary" onClick={retry}>Փորձել կրկին</button>
                )}
              </div>
            )}
          </>
        )}

        {state === 'sent' && (
          <div className="rsvp-sent">
            <div className="rsvp-heart" aria-hidden>
              <Rose size={120} color="var(--c-blush)" />
            </div>
            <h3>Շնորհակալություն 🤍</h3>
            <p>{your} պատասխանը ստացված է։<br/>Ուրախ ենք, որ {youBe} մեզ հետ՝ <em>{guests}</em> հոգով։</p>
            <p className="rsvp-sign">— Աղասի և Աննա</p>
          </div>
        )}

        {state === 'declined' && (
          <div className="rsvp-sent">
            <h3>Շնորհակալություն 🤍</h3>
            <p>Շնորհակալություն տեղեկացնելու համար։<br/>Մտովի մեզ հետ կլինեք։</p>
            <p className="rsvp-sign">— Աղասի և Աննա</p>
          </div>
        )}
      </div>

      {burst && <Confetti />}

      <footer className="rsvp-footer">
        <ArmDivider width={160} />
        <div className="footer-names">Աղասի և Աննա</div>
        <div className="footer-date">06 · 09 · 2026</div>
      </footer>
    </section>
  );
};

const Confetti = () => {
  const pieces = Array.from({ length: 60 }).map((_, i) => ({
    left: Math.random() * 100,
    delay: Math.random() * 0.6,
    dur: 2.6 + Math.random() * 2,
    rot: Math.random() * 360,
    drift: (Math.random() - 0.5) * 180,
    size: 14 + Math.random() * 18,
    color: ['var(--c-blush)','var(--c-butter)','var(--c-peri)','var(--c-coral)','var(--c-ivory)','var(--c-sage)'][i % 6],
    kind: i % 3,
  }));
  return (
    <div className="confetti" aria-hidden>
      {pieces.map((p, i) => (
        <div key={i} className="confetti-piece" style={{
          left: `${p.left}%`,
          animationDelay: `${p.delay}s`,
          animationDuration: `${p.dur}s`,
          '--drift': `${p.drift}px`,
          '--rot': `${p.rot}deg`,
        }}>
          {p.kind === 0 && <Petal size={p.size} color={p.color} />}
          {p.kind === 1 && <Daisy size={p.size} petal={p.color} />}
          {p.kind === 2 && <Petal size={p.size} color={p.color} style={{ transform: 'rotate(45deg)' }} />}
        </div>
      ))}
    </div>
  );
};
