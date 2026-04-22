// Invite video sources. Browsers pick the first <source> they can decode,
// so order matters: smaller/modern first (HEVC), universal fallback last
// (H.264). Add an AV1 <source> at the top later if you want — most phones
// can't decode AV1 yet so there's no rush.
//
// To swap to a CDN, replace these paths with absolute URLs. The rest of the
// site is oblivious.

export const VIDEO_SOURCES = [
  { src: import.meta.env.BASE_URL + 'video/invite.hevc.mp4', type: 'video/mp4; codecs="hvc1"' },
  { src: import.meta.env.BASE_URL + 'video/invite.h264.mp4', type: 'video/mp4; codecs="avc1.640028"' },
];

export const VIDEO_POSTER = import.meta.env.BASE_URL + 'video/invite.poster.jpg';
