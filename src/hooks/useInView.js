import { useState, useEffect, useRef } from 'react';

// Fires `inView` once the element crosses the given visibility threshold.
// One-shot: `inView` latches to true and never flips back, which is what the
// reveal animations want (don't un-animate when you scroll past).
export const useInView = (threshold = 0.2) => {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setInView(true); },
      { threshold }
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
};
