import { useInView } from '../hooks/useInView.js';

// Fade + slide-in as the element scrolls into view. `delay` is ms applied
// to both opacity and transform transitions, useful for staggering siblings.
export const Reveal = ({ children, delay = 0, as: Tag = 'div', style, className }) => {
  const [ref, inView] = useInView(0.15);
  return (
    <Tag ref={ref} className={className}
      style={{
        ...style,
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(22px)',
        transition: `opacity 1.1s ${delay}ms cubic-bezier(.22,.61,.36,1), transform 1.1s ${delay}ms cubic-bezier(.22,.61,.36,1)`,
      }}>
      {children}
    </Tag>
  );
};
