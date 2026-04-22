// Tiny passphrase gate for the builder page.
//
// This is obfuscation, not real security: everything runs in the browser, so
// anyone who reads the source can find the hashes. Use it as a speed bump
// to keep casual visitors out of the guest-link generator, nothing more.
//
// To change the passphrases, SHA-256 the new strings and drop the hex digests
// into PASSPHRASE_HASHES below. Example:
//   $ node -e "console.log(require('crypto').createHash('sha256').update('NEW').digest('hex'))"

const PASSPHRASE_HASHES = new Set([
  '10e40219bb267f76f3a98237b7459463053e3c40bd54fed0b5b0d5a6282fed36',
  'be754f636177f6bef6ce57d976cff3e45bc882503bf1dfde5a0851b3eae64ceb',
]);

// We store the passphrase's SHA-256 hash under this key (not the plaintext,
// not a plain "1" flag). That way:
//   - If someone flips/guesses the localStorage value, it must be a valid
//     hash to pass the gate — harder than setting "1".
//   - If someone reads the storage, they see a hash, not the passphrase;
//     they can't reuse it on another device to find the original.
const AUTH_KEY = 'aa_builder_auth';

async function sha256Hex(text) {
  const bytes = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function checkPassphrase(text) {
  const hex = await sha256Hex((text ?? '').trim());
  return PASSPHRASE_HASHES.has(hex);
}

export function isUnlocked() {
  try {
    const stored = localStorage.getItem(AUTH_KEY);
    return stored != null && PASSPHRASE_HASHES.has(stored);
  } catch {
    return false;
  }
}

export async function markUnlocked(passphrase) {
  try {
    localStorage.setItem(AUTH_KEY, await sha256Hex((passphrase ?? '').trim()));
  } catch { /* ignore */ }
}

export function clearUnlocked() {
  try { localStorage.removeItem(AUTH_KEY); } catch { /* ignore */ }
}
