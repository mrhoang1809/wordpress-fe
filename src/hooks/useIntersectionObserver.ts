import { useState, useEffect, useRef } from "react";

export interface UseIntersectionObserverOptions {
  root?: Element | null;
  rootMargin?: string;
  threshold?: number | number[];
}

export interface UseIntersectionObserverReturn {
  observed: boolean;
  intersectionObserver: IntersectionObserver | null;
  targetRef: React.RefObject<HTMLDivElement | null>;
}

export function useIntersectionObserver(
  target: React.RefObject<HTMLDivElement | null> | HTMLDivElement | null,
  options: UseIntersectionObserverOptions = {},
): UseIntersectionObserverReturn {
  const [observed, setObserved] = useState(false);
  const targetRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let currentTarget: HTMLDivElement | null = null;

    if (target && "current" in target) {
      currentTarget = target.current;
    } else if (target) {
      currentTarget = target as HTMLDivElement;
    }

    if (!currentTarget) return;

    targetRef.current = currentTarget;

    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setObserved(true);
      }
    }, options);

    obs.observe(currentTarget);

    return () => {
      if (currentTarget) {
        obs.unobserve(currentTarget);
      }
    };
  }, [target, options.rootMargin, options.threshold]);

  return { observed, intersectionObserver: null, targetRef };
}
