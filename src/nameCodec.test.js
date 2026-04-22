import { describe, it, expect } from 'vitest';
import {
  encodeName,
  decodeName,
  isDictionaryHit,
  isPluralGuest,
  pronoun,
  readGuestNameFromUrl,
  NAME_TO_ID,
  ID_TO_NAME,
  ALL_NAMES,
} from './nameCodec.js';

describe('encodeName / decodeName — single token', () => {
  it('encodes dictionary hits to short IDs', () => {
    expect(encodeName('Աղասի')).toBe('m71');
    expect(encodeName('Աննա')).toBe('f88');
    expect(encodeName('Արամ')).toBe('m1');
  });

  it('round-trips dictionary names', () => {
    for (const name of ['Աղասի', 'Աննա', 'Արամ', 'Գոհար', 'Տիգրան']) {
      expect(decodeName(encodeName(name))).toBe(name);
    }
  });

  it('falls back to base64url for unknown names', () => {
    const enc = encodeName('Sarah');
    expect(enc.startsWith('b.')).toBe(true);
    expect(decodeName(enc)).toBe('Sarah');
  });

  it('round-trips non-ASCII names via base64url', () => {
    for (const name of ['Սարա', 'Արեգ', '王伟', 'Ashot', 'Αλέξανδρος']) {
      expect(decodeName(encodeName(name))).toBe(name);
    }
  });

  it('trims surrounding whitespace', () => {
    expect(encodeName('  Աղասի  ')).toBe('m71');
    expect(decodeName(encodeName('  Աննա '))).toBe('Աննա');
  });

  it('treats empty / whitespace-only names as empty', () => {
    expect(encodeName('')).toBe('');
    expect(encodeName('   ')).toBe('');
    expect(encodeName(null)).toBe('');
    expect(encodeName(undefined)).toBe('');
  });

  it('multi-word single-person names go through base64 (no separator)', () => {
    const name = 'Աղասի Աղասյան';
    const enc = encodeName(name);
    expect(enc.startsWith('b.')).toBe(true);
    expect(decodeName(enc)).toBe(name);
  });

  it('decodes unknown token strings as themselves (forward-compat)', () => {
    expect(decodeName('zzz')).toBe('zzz');
  });

  it('handles malformed base64 gracefully', () => {
    expect(decodeName('b.!!!')).toBe('');
  });
});

describe('encodeName — multi-token (couples, comma lists)', () => {
  it('encodes two dict names joined with և', () => {
    expect(encodeName('Աննա և Աստղիկ')).toBe('m.f88..1f7');
  });

  it('encodes two dict names joined with ու', () => {
    expect(encodeName('Արամ ու Գոհար')).toBe('m.m1..2f9');
  });

  it('encodes comma-separated names (with or without trailing space)', () => {
    expect(encodeName('Արամ, Գոհար')).toBe('m.m1..3f9');
    expect(encodeName('Արամ,Գոհար')).toBe('m.m1..3f9');
  });

  it('encodes three comma-separated names', () => {
    expect(encodeName('Արամ, Գոհար, Անի')).toBe('m.m1..3f9..3f1');
  });

  it('round-trips multi-token names back to normalized form', () => {
    const cases = [
      ['Աննա և Աստղիկ',       'Աննա և Աստղիկ'],
      ['Արամ ու Գոհար',       'Արամ ու Գոհար'],
      ['Արամ, Գոհար',         'Արամ, Գոհար'],
      ['Արամ,Գոհար',          'Արամ, Գոհար'],   // normalized
      ['Արամ , Գոհար',        'Արամ, Գոհար'],   // normalized
      ['Արամ, Գոհար, Անի',    'Արամ, Գոհար, Անի'],
    ];
    for (const [input, expected] of cases) {
      expect(decodeName(encodeName(input))).toBe(expected);
    }
  });

  it('mixes dictionary hits with base64 fallbacks per token', () => {
    expect(encodeName('Աննա և Sarah')).toBe('m.f88..1b.U2FyYWg');
    expect(decodeName(encodeName('Աննա և Sarah'))).toBe('Աննա և Sarah');
  });

  it('handles base64 tokens in all positions', () => {
    expect(decodeName(encodeName('Sarah, Tim, Արամ'))).toBe('Sarah, Tim, Արամ');
  });

  it('single-name input does NOT get the m. prefix', () => {
    expect(encodeName('Աղասի')).toBe('m71');
    expect(encodeName('Sarah')).not.toMatch(/^m\./);
  });
});

describe('isDictionaryHit', () => {
  it('returns true for names in the dictionary', () => {
    expect(isDictionaryHit('Աղասի')).toBe(true);
    expect(isDictionaryHit('Աննա')).toBe(true);
  });

  it('returns false for unknown names', () => {
    expect(isDictionaryHit('Sarah')).toBe(false);
    expect(isDictionaryHit('')).toBe(false);
    expect(isDictionaryHit('   ')).toBe(false);
  });

  it('trims whitespace before lookup', () => {
    expect(isDictionaryHit('  Աղասի ')).toBe(true);
  });

  it('is case-sensitive (Armenian)', () => {
    // Lowercase form of the name isn't in the dictionary — intentional.
    expect(isDictionaryHit('աղասի')).toBe(false);
  });
});

describe('isPluralGuest', () => {
  it('detects plural via "և" with spaces', () => {
    expect(isPluralGuest('Աննա և Աստղիկ')).toBe(true);
  });

  it('detects plural via "ու" with spaces', () => {
    expect(isPluralGuest('Արամ ու Գոհար')).toBe(true);
  });

  it('detects plural via comma', () => {
    expect(isPluralGuest('Արամ, Գոհար')).toBe(true);
    expect(isPluralGuest('Արամ,Գոհար')).toBe(true);
  });

  it('returns false for a single name', () => {
    expect(isPluralGuest('Աղասի')).toBe(false);
    expect(isPluralGuest('Աննա')).toBe(false);
  });

  it('returns false for a name + surname (no connector)', () => {
    expect(isPluralGuest('Աղասի Աղասյան')).toBe(false);
  });

  it('returns false when և/ու appear as substrings inside a word', () => {
    // "Հովհաննավանք" contains "ու" but not surrounded by spaces
    expect(isPluralGuest('Հովհաննավանք')).toBe(false);
    // A name ending in "ու" with no following space
    expect(isPluralGuest('Արցախու')).toBe(false);
  });

  it('returns false for empty / nullish', () => {
    expect(isPluralGuest('')).toBe(false);
    expect(isPluralGuest('   ')).toBe(false);
    expect(isPluralGuest(null)).toBe(false);
    expect(isPluralGuest(undefined)).toBe(false);
  });
});

describe('pronoun', () => {
  it('picks singular form for a single name', () => {
    expect(pronoun('Աղասի', 'you')).toBe('քեզ');
    expect(pronoun('Աղասի', 'your')).toBe('քո');
    expect(pronoun('Աղասի', 'youBe')).toBe('կլինես');
    expect(pronoun('Աղասի', 'confirm')).toBe('Հաստատիր');
  });

  it('picks plural form for a couple/list', () => {
    expect(pronoun('Աննա և Աստղիկ', 'you')).toBe('Ձեզ');
    expect(pronoun('Արամ, Գոհար', 'your')).toBe('Ձեր');
    expect(pronoun('Արամ ու Գոհար', 'youBe')).toBe('կլինեք');
    expect(pronoun('Արամ, Գոհար, Անի', 'confirm')).toBe('Հաստատեք');
  });

  it('defaults unknown keys to empty string', () => {
    expect(pronoun('Աղասի', 'noSuchKey')).toBe('');
  });

  it('treats empty name as singular', () => {
    expect(pronoun('', 'you')).toBe('քեզ');
  });
});

describe('readGuestNameFromUrl', () => {
  it('reads ?n= and decodes it', () => {
    expect(readGuestNameFromUrl('?n=m71')).toBe('Աղասի');
    expect(readGuestNameFromUrl('?n=f88')).toBe('Աննա');
  });

  it('reads ?n= with multi-token encoding', () => {
    expect(readGuestNameFromUrl('?n=m.f88..1f7')).toBe('Աննա և Աստղիկ');
  });

  it('falls back to ?name= (legacy raw) when ?n= is absent', () => {
    expect(readGuestNameFromUrl('?name=Sarah')).toBe('Sarah');
    expect(readGuestNameFromUrl('?name=%D4%B1%D5%B2%D5%A1%D5%BD%D5%AB')).toBe('Աղասի');
  });

  it('prefers ?n= over ?name= when both are set', () => {
    expect(readGuestNameFromUrl('?n=m71&name=Sarah')).toBe('Աղասի');
  });

  it('returns empty string when neither param is set', () => {
    expect(readGuestNameFromUrl('')).toBe('');
    expect(readGuestNameFromUrl('?foo=bar')).toBe('');
  });
});

describe('dictionary invariants', () => {
  it('every ID is unique (NAME_TO_ID is injective)', () => {
    const ids = Object.values(NAME_TO_ID);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('ID_TO_NAME is the inverse of NAME_TO_ID', () => {
    for (const [name, id] of Object.entries(NAME_TO_ID)) {
      expect(ID_TO_NAME[id]).toBe(name);
    }
  });

  it('IDs follow the [fm]<digits> shape', () => {
    for (const id of Object.values(NAME_TO_ID)) {
      expect(id).toMatch(/^[fm]\d+$/);
    }
  });

  it('ALL_NAMES contains every dictionary name exactly once', () => {
    expect(new Set(ALL_NAMES).size).toBe(ALL_NAMES.length);
    expect(ALL_NAMES.length).toBe(Object.keys(NAME_TO_ID).length);
  });

  it('IDs are not dots and cannot collide with separator codes', () => {
    // The multi-token encoder joins tokens with "..<1|2|3>". If any dict ID
    // contained ".." or started with "1"/"2"/"3" as the full ID, decoding
    // would break.
    for (const id of Object.values(NAME_TO_ID)) {
      expect(id).not.toMatch(/\.\./);
    }
  });
});
