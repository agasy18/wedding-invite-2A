// Google Form submission helper.
//
// The invite posts RSVPs directly to a pre-created Google Form. Responses
// land in the form's linked Google Sheet. No backend.
//
// How to find these values: open the form editor → ⋮ → "Get pre-filled link",
// fill each field with a placeholder, copy the resulting URL. Each
// `entry.NNNNN=VALUE` pair reveals the entry ID for that field.

export const GOOGLE_FORM = {
  formId: '1FAIpQLSch0x2iAf_NDJf35WoI6UISJFAzrHK4zgFn-3mWSiC5N-FhGQ',
  entryIds: {
    name: 'entry.1082400168',
    attending: 'entry.1218955300',
    guests: 'entry.1749638704',
  },
  // These strings must match the option labels in the Google Form exactly.
  attendingOptions: {
    yes: 'Այո, կլինեմ',
    no: 'Ցավոք, չեմ կարող',
  },
};

function formResponseUrl(formId) {
  return `https://docs.google.com/forms/d/e/${formId}/formResponse`;
}

// Build the URL-encoded body Google Forms expects. Exported for testability.
export function buildRsvpBody({ name, attending, guests }) {
  const p = new URLSearchParams();
  if (name) p.set(GOOGLE_FORM.entryIds.name, name);
  p.set(GOOGLE_FORM.entryIds.attending, GOOGLE_FORM.attendingOptions[attending]);
  if (attending === 'yes' && guests != null) {
    p.set(GOOGLE_FORM.entryIds.guests, String(guests));
  }
  return p.toString();
}

// Submit an RSVP. `attending` is 'yes' or 'no'. Returns a promise that
// resolves on success and rejects on network failure.
//
// Uses `no-cors` so the browser sends the request but can't read Google's
// response (Google Forms doesn't set CORS headers for the formResponse
// endpoint). As long as the request reaches Google, the row lands in the
// sheet — we trust the POST and call it a success on resolve.
export async function submitRsvp({ name, attending, guests }) {
  const body = buildRsvpBody({ name, attending, guests });
  await fetch(formResponseUrl(GOOGLE_FORM.formId), {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
}
