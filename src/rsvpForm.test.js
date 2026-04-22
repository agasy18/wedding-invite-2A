import { describe, it, expect } from 'vitest';
import { buildRsvpBody, GOOGLE_FORM } from './rsvpForm.js';

describe('buildRsvpBody', () => {
  it('includes name, attending=yes, and guest count', () => {
    const body = buildRsvpBody({ name: 'Աղասի', attending: 'yes', guests: 2 });
    const p = new URLSearchParams(body);
    expect(p.get(GOOGLE_FORM.entryIds.name)).toBe('Աղասի');
    expect(p.get(GOOGLE_FORM.entryIds.attending)).toBe('Այո, կլինեմ');
    expect(p.get(GOOGLE_FORM.entryIds.guests)).toBe('2');
  });

  it('sends the decline option text when attending=no', () => {
    const body = buildRsvpBody({ name: 'Աննա', attending: 'no' });
    const p = new URLSearchParams(body);
    expect(p.get(GOOGLE_FORM.entryIds.attending)).toBe('Ցավոք, չեմ կարող');
  });

  it('does not include guest count on decline', () => {
    const body = buildRsvpBody({ name: 'Աննա', attending: 'no', guests: 3 });
    const p = new URLSearchParams(body);
    expect(p.get(GOOGLE_FORM.entryIds.guests)).toBe(null);
  });

  it('omits name if empty', () => {
    const body = buildRsvpBody({ name: '', attending: 'yes', guests: 1 });
    const p = new URLSearchParams(body);
    expect(p.has(GOOGLE_FORM.entryIds.name)).toBe(false);
  });

  it('URL-encodes Armenian text correctly', () => {
    const body = buildRsvpBody({ name: 'Աղասի', attending: 'yes', guests: 1 });
    // URLSearchParams serializes spaces as '+' and non-ASCII as %XX.
    expect(body).toMatch(/^[A-Za-z0-9.%+=&_-]+$/);
    // Round-trips back via URLSearchParams → must still say Աղասի + Այո, կլինեմ.
    const p = new URLSearchParams(body);
    expect(p.get(GOOGLE_FORM.entryIds.name)).toBe('Աղասի');
    expect(p.get(GOOGLE_FORM.entryIds.attending)).toBe('Այո, կլինեմ');
  });

  it('supports multi-token names (couples)', () => {
    const body = buildRsvpBody({ name: 'Աննա և Աստղիկ', attending: 'yes', guests: 2 });
    const p = new URLSearchParams(body);
    expect(p.get(GOOGLE_FORM.entryIds.name)).toBe('Աննա և Աստղիկ');
  });
});

describe('GOOGLE_FORM config', () => {
  it('has the four required entry IDs', () => {
    expect(GOOGLE_FORM.entryIds.name).toMatch(/^entry\.\d+$/);
    expect(GOOGLE_FORM.entryIds.attending).toMatch(/^entry\.\d+$/);
    expect(GOOGLE_FORM.entryIds.guests).toMatch(/^entry\.\d+$/);
  });

  it('has both attending option strings', () => {
    expect(GOOGLE_FORM.attendingOptions.yes).toBeTruthy();
    expect(GOOGLE_FORM.attendingOptions.no).toBeTruthy();
    expect(GOOGLE_FORM.attendingOptions.yes).not.toBe(GOOGLE_FORM.attendingOptions.no);
  });

  it('form ID matches the expected Google Forms pattern', () => {
    expect(GOOGLE_FORM.formId).toMatch(/^1FAIpQLS[A-Za-z0-9_-]+$/);
  });
});
