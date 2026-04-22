// Google Form submission helper.
//
// The invite posts RSVPs directly to a pre-created Google Form. Responses
// land in the form's linked Google Sheet. No backend.
//
// How to find these values: open the form editor → ⋮ → "Get pre-filled link",
// fill each field with a placeholder, copy the resulting URL. Each
// `entry.NNNNN=VALUE` pair reveals the entry ID for that field.

export const GOOGLE_FORM = {
  formId: '1FAIpQLScuXtK4i7NHGJNkOQzm4u0DU5P4Z4tUBoJ0jDC6DphuLA4wWQ',
  entryIds: {
    name: 'entry.1595630117',
    attending: 'entry.1213503628',
    guests: 'entry.1304673951',
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
