// File: src/hooks/useIntersection.js
import { useEffect, useRef, useState } from 'react';

export default function useIntersection({
  enabled = true,
  root = null,
  rootMargin = '0px 0px 240px',
  threshold = 0,
} = {}) {
  const targetRef = useRef(null);
  const [isIntersecting, setIsIntersecting] = useState(false);
  useEffect(() => {
    const target = targetRef.current;
    if (!enabled || !target || !('IntersectionObserver' in window))
      return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => setIsIntersecting(entry.isIntersecting),
      { root, rootMargin, threshold },
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [enabled, root, rootMargin, threshold]);
  return { targetRef, isIntersecting };
}
