import { useState, useEffect, useMemo } from 'react';
import { createRoot } from 'react-dom/client';

import { FloralDefs, Rose, Cosmos, ArmDivider } from './florals.jsx';
import {
  encodeName, isDictionaryHit, ALL_NAMES,
} from './nameCodec.js';

const STORAGE_KEY = 'aa_guests_v1';

const App = () => {
  const [name, setName] = useState('');
  const [saved, setSaved] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
    catch { return []; }
  });
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
  }, [saved]);

  // The invite lives one level up from /builder.html. Strip "builder.html"
  // (or "builder") to get the directory, so generated URLs point at the invite
  // index regardless of whether Vite serves the path with or without the .html.
  const baseUrl = useMemo(() => {
    const loc = window.location;
    const dir = loc.pathname.replace(/\/?builder(?:\.html)?$/, '/');
    return loc.origin + dir;
  }, []);

  const fullUrl = (n) => {
    const t = n.trim();
    if (!t) return baseUrl;
    return `${baseUrl}?n=${encodeName(t)}`;
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2200);
  };

  const copy = async (text, markCopied) => {
    try {
      await navigator.clipboard.writeText(text);
      if (markCopied) {
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      }
      showToast('Հղումը պատճենված է');
    } catch {
      showToast('Չհաջողվեց պատճենել');
    }
  };

  const add = () => {
    const n = name.trim();
    if (!n) return;
    if (saved.includes(n)) { showToast('Արդեն ավելացված է'); setName(''); return; }
    setSaved([n, ...saved]);
    setName('');
    showToast(`«${n}» ավելացված է`);
  };

  const remove = (n) => {
    setSaved(saved.filter(s => s !== n));
  };

  const share = (n) => {
    const url = fullUrl(n);
    const text = `Սիրելի ${n}, սիրով հրավիրում ենք Ձեզ մեր հարսանյաց արարողությանը: ${url}`;
    if (navigator.share) {
      navigator.share({ title: 'Աղասի & Աննա', text, url }).catch(() => {});
    } else {
      copy(text, false);
    }
  };

  const trimmedName = name.trim();
  const hit = isDictionaryHit(name);

  return (
    <div className="builder-wrap">
      <FloralDefs />

      <header className="builder-header">
        <div className="builder-eyebrow">Աղասի &amp; Աննա · 06.09.2026</div>
        <h1 className="builder-title">Հրավիրատոմսերի գեներատոր</h1>
        <div className="builder-divider"><ArmDivider width={140} /></div>
        <p className="builder-sub">Generate a personal link for each guest</p>
      </header>

      <div className="builder-card">
        <div className="builder-flower bf-tl"><Rose size={100} color="var(--c-blush)" /></div>
        <div className="builder-flower bf-br"><Cosmos size={80} color="var(--c-coral)" /></div>

        <div className="builder-form">
          <label className="field-label">Հյուրի անուն · Guest name</label>
          <input
            className="name-input"
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') add(); }}
            placeholder="Արմեն Հակոբյան"
            list="arm-names"
            autoFocus
          />
          <datalist id="arm-names">
            {ALL_NAMES.map(n => <option key={n} value={n} />)}
          </datalist>

          {trimmedName && (
            <div className={`codec-hint ${hit ? 'hit' : 'fallback'}`}>
              {hit ? '✓ Բառարանից — կարճ հղում' : '∿ Base64 կոդավորում — ավելի երկար հղում'}
            </div>
          )}

          <label className="field-label" style={{ marginTop: 24 }}>Անհատական հղում</label>
          <div className="url-preview">
            <code>
              {baseUrl}?n=<span className="hl">{trimmedName ? encodeName(name) : '…'}</span>
            </code>
            <button className={`copy-btn ${copied ? 'copied' : ''}`}
              onClick={() => copy(fullUrl(name), true)}
              disabled={!trimmedName}
              style={{ opacity: trimmedName ? 1 : 0.5, cursor: trimmedName ? 'pointer' : 'not-allowed' }}>
              {copied ? '✓ Պատճենված' : 'Պատճենել'}
            </button>
          </div>

          <div className="actions">
            <button className="btn-open"
              onClick={() => window.open(fullUrl(name), '_blank')}
              disabled={!trimmedName}
              style={{ opacity: trimmedName ? 1 : 0.5, cursor: trimmedName ? 'pointer' : 'not-allowed' }}>
              Բացել նախադիտումը
            </button>
            <button className="btn-share" onClick={add} disabled={!trimmedName}
              style={{ opacity: trimmedName ? 1 : 0.5, cursor: trimmedName ? 'pointer' : 'not-allowed' }}>
              + Ավելացնել ցուցակին
            </button>
          </div>
        </div>
      </div>

      <section className="saved-section">
        <div className="saved-header">
          <h3>Ցուցակ · Saved guests</h3>
          <span className="saved-count">{saved.length} հյուր</span>
        </div>

        {saved.length === 0 ? (
          <div className="empty-state">Դեռ ոչ ոք չկա — ավելացրեք հյուր ցուցակին:</div>
        ) : (
          <ul className="saved-list">
            {saved.map(n => (
              <li key={n} className="saved-item">
                <div className="saved-name">{n}</div>
                <div className="saved-actions">
                  <button onClick={() => copy(fullUrl(n), false)}>Պատճ.</button>
                  <button onClick={() => share(n)}>Ուղարկել</button>
                  <button onClick={() => window.open(fullUrl(n), '_blank')}>Բացել</button>
                  <button className="del" onClick={() => remove(n)}>✕</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <a className="back-link" href={baseUrl}>← Վերադառնալ հրավիրատոմս</a>

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
};

createRoot(document.getElementById('root')).render(<App />);
