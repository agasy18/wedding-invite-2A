import { useState, useEffect, useMemo, useRef } from 'react';
import { createRoot } from 'react-dom/client';

import { FloralDefs, Rose, Cosmos, ArmDivider } from './components/florals.jsx';
import {
  encodeName, isDictionaryHit, countNameTokens, buildPersonalUrl,
} from './lib/nameCodec.js';
import { checkPassphrase, isUnlocked, markUnlocked } from './lib/builderAuth.js';

const STORAGE_KEY = 'aa_guests_v2';
const LEGACY_STORAGE_KEY = 'aa_guests_v1';

// Saved entries are `{ name, guests }`. Migrate v1 (plain name strings) to v2.
function loadSaved() {
  try {
    const v2 = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    if (Array.isArray(v2)) return v2;
    const v1 = JSON.parse(localStorage.getItem(LEGACY_STORAGE_KEY) || '[]');
    if (Array.isArray(v1)) {
      return v1.map(n => ({ name: n, guests: countNameTokens(n) || 1 }));
    }
  } catch { /* ignore */ }
  return [];
}

const App = () => {
  const [name, setName] = useState('');
  const [guests, setGuests] = useState(1);
  // Whether the user has manually edited the guest count for the CURRENT name.
  // Reset to false whenever the name changes, so re-typing overrides a prior
  // manual override.
  const guestsEditedRef = useRef(false);
  const [saved, setSaved] = useState(loadSaved);
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
  }, [saved]);

  const baseUrl = useMemo(() => {
    const loc = window.location;
    const dir = loc.pathname.replace(/\/?builder(?:\.html)?$/, '/');
    return loc.origin + dir;
  }, []);

  const fullUrl = (n, g) => buildPersonalUrl({ baseUrl, name: n, guests: g });

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

  const onNameChange = (value) => {
    setName(value);
    // Auto-fill guest count unless the user has already touched the field.
    if (!guestsEditedRef.current) {
      setGuests(Math.max(1, countNameTokens(value)));
    }
  };

  // Reset the "user edited" flag when the name field becomes empty — this
  // means a fresh name on the next keystroke will re-auto-fill.
  useEffect(() => {
    if (!name.trim()) guestsEditedRef.current = false;
  }, [name]);

  const onGuestsChange = (value) => {
    const n = parseInt(value, 10);
    if (Number.isFinite(n) && n > 0) {
      setGuests(n);
      guestsEditedRef.current = true;
    } else if (value === '') {
      setGuests(1);
      guestsEditedRef.current = true;
    }
  };

  // Persist a guest to localStorage silently. Used by the Copy button so
  // every copied link automatically lands in the saved list. If the name is
  // already saved, update its guest count in case it changed.
  const saveLocally = (n, g) => {
    const trimmed = n.trim();
    if (!trimmed) return;
    setSaved(prev => {
      const existing = prev.findIndex(s => s.name === trimmed);
      if (existing === -1) return [{ name: trimmed, guests: g }, ...prev];
      if (prev[existing].guests === g) return prev; // no change, skip re-render
      const copy = prev.slice();
      copy[existing] = { name: trimmed, guests: g };
      return copy;
    });
  };

  const remove = (n) => {
    setSaved(saved.filter(s => s.name !== n));
  };

  const share = (entry) => {
    const url = fullUrl(entry.name, entry.guests);
    const text = `Սիրելի ${entry.name}, սիրով հրավիրում ենք Ձեզ մեր հարսանյաց արարողությանը: ${url}`;
    if (navigator.share) {
      navigator.share({ title: 'Աղասի և Աննա', text, url }).catch(() => {});
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
        <div className="builder-eyebrow">Աղասի և Աննա · 06.09.2026</div>
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
            onChange={e => onNameChange(e.target.value)}
            placeholder="Արմեն Հակոբյան"
            autoFocus
          />

          {trimmedName && (
            <div className={`codec-hint ${hit ? 'hit' : 'fallback'}`}>
              {hit ? '✓ Բառարանից — կարճ հղում' : '∿ Base64 կոդավորում — ավելի երկար հղում'}
            </div>
          )}

          <label className="field-label" style={{ marginTop: 24 }}>Հյուրերի քանակ · Guest count</label>
          <input
            className="name-input"
            type="number"
            min="1"
            max="20"
            value={guests}
            onChange={e => onGuestsChange(e.target.value)}
            style={{ width: 120 }}
          />

          <label className="field-label" style={{ marginTop: 24 }}>Անհատական հղում</label>
          <div className="url-preview">
            <code>
              {baseUrl}?n=<span className="hl">{trimmedName ? encodeName(name) : '…'}</span>
              {guests > 1 && <>&amp;g=<span className="hl">{guests}</span></>}
            </code>
            <button className={`copy-btn ${copied ? 'copied' : ''}`}
              onClick={() => {
                saveLocally(name, guests);
                copy(fullUrl(name, guests), true);
              }}
              disabled={!trimmedName}
              style={{ opacity: trimmedName ? 1 : 0.5, cursor: trimmedName ? 'pointer' : 'not-allowed' }}>
              {copied ? '✓ Պատճենված' : 'Պատճենել'}
            </button>
          </div>

          <div className="actions">
            <button className="btn-open"
              onClick={() => window.open(fullUrl(name, guests), '_blank')}
              disabled={!trimmedName}
              style={{ opacity: trimmedName ? 1 : 0.5, cursor: trimmedName ? 'pointer' : 'not-allowed' }}>
              Բացել նախադիտումը
            </button>
            {/* Share opens the OS share sheet on mobile, falls back to copying
                the full invite text on desktop. Either way the guest is added
                to the local list, same as the Copy button does. */}
            <button className="btn-share"
              onClick={() => {
                saveLocally(name, guests);
                share({ name, guests });
              }}
              disabled={!trimmedName}
              style={{ opacity: trimmedName ? 1 : 0.5, cursor: trimmedName ? 'pointer' : 'not-allowed' }}>
              Ուղարկել
            </button>
          </div>
        </div>
      </div>

      <section className="saved-section">
        <div className="saved-header">
          <h3>Ցուցակ · Saved guests</h3>
          <span className="saved-count">
            {saved.reduce((sum, e) => sum + (e.guests || 1), 0)} հյուր · {saved.length} հղում
          </span>
        </div>

        {saved.length === 0 ? (
          <div className="empty-state">Դեռ ոչ ոք չկա — ավելացրեք հյուր ցուցակին:</div>
        ) : (
          <ul className="saved-list">
            {saved.map(entry => (
              <li key={entry.name} className="saved-item">
                <div className="saved-name">
                  {entry.name}
                  {entry.guests > 1 && (
                    <span style={{ marginLeft: 10, fontSize: 13, color: 'var(--c-gold)' }}>
                      ×{entry.guests}
                    </span>
                  )}
                </div>
                <div className="saved-actions">
                  <button onClick={() => copy(fullUrl(entry.name, entry.guests), false)}>Պատճ.</button>
                  <button onClick={() => share(entry)}>Ուղարկել</button>
                  <button onClick={() => window.open(fullUrl(entry.name, entry.guests), '_blank')}>Բացել</button>
                  <button className="del" onClick={() => remove(entry.name)}>✕</button>
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

// --- Lock screen -----------------------------------------------------------

const LockScreen = ({ onUnlock }) => {
  const [value, setValue] = useState('');
  const [error, setError] = useState(false);
  const [checking, setChecking] = useState(false);

  const submit = async (e) => {
    e?.preventDefault();
    if (!value || checking) return;
    setChecking(true);
    const ok = await checkPassphrase(value);
    if (ok) {
      await markUnlocked(value);
      setChecking(false);
      onUnlock();
    } else {
      setChecking(false);
      setError(true);
      setValue('');
    }
  };

  return (
    <div className="builder-wrap">
      <FloralDefs />
      <header className="builder-header">
        <div className="builder-eyebrow">Աղասի և Աննա · 06.09.2026</div>
        <h1 className="builder-title">Մուտք</h1>
        <div className="builder-divider"><ArmDivider width={140} /></div>
        <p className="builder-sub">Enter passphrase to continue</p>
      </header>

      <div className="builder-card">
        <div className="builder-flower bf-tl"><Rose size={100} color="var(--c-blush)" /></div>
        <div className="builder-flower bf-br"><Cosmos size={80} color="var(--c-coral)" /></div>
        <form className="builder-form" onSubmit={submit}>
          <label className="field-label">Գաղտնաբառ · Passphrase</label>
          <input
            className="name-input"
            type="password"
            value={value}
            onChange={e => { setValue(e.target.value); setError(false); }}
            autoFocus
            autoComplete="current-password"
            spellCheck={false}
          />
          {error && (
            <div className="codec-hint fallback" style={{ marginTop: 10 }}>
              ✗ Սխալ գաղտնաբառ
            </div>
          )}
          <div className="actions">
            <button className="btn-share" type="submit" disabled={!value || checking}
              style={{ opacity: value && !checking ? 1 : 0.5, cursor: value && !checking ? 'pointer' : 'not-allowed' }}>
              {checking ? 'Ստուգում…' : 'Մուտք'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Root = () => {
  const [unlocked, setUnlocked] = useState(isUnlocked);
  if (!unlocked) return <LockScreen onUnlock={() => setUnlocked(true)} />;
  return <App />;
};

createRoot(document.getElementById('root')).render(<Root />);
