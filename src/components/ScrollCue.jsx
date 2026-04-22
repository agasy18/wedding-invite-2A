// Scroll hint pinned to the bottom of a section. Clicking smooth-scrolls to
// the section with `id={nextId}`. Used at the bottom of every section
// except the final RSVP (nothing after that to scroll to).
export const ScrollCue = ({ nextId, label = 'թերթել' }) => {
  const onGo = () => {
    if (!nextId) return;
    const el = document.getElementById(nextId);
    if (el) window.scrollTo({ top: el.offsetTop, behavior: 'smooth' });
  };
  return (
    <button
      type="button"
      className="scroll-cue"
      onClick={onGo}
      aria-label={nextId ? 'Գնալ հաջորդ բաժին' : undefined}
    >
      <span>{label}</span>
      <div className="scroll-line" aria-hidden />
    </button>
  );
};
