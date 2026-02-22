'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Animate children of a container as they scroll into view.
 * Each child with [data-animate] gets staggered reveal.
 */
export function useScrollReveal<T extends HTMLElement = HTMLDivElement>(options?: {
  stagger?: number;
  y?: number;
  duration?: number;
  delay?: number;
  start?: string;
  markers?: boolean;
}) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const targets = el.querySelectorAll('[data-animate]');
    if (targets.length === 0) return;

    gsap.set(targets, { opacity: 0, y: options?.y ?? 40 });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: el,
        start: options?.start ?? 'top 85%',
        once: true,
        markers: options?.markers ?? false,
      },
    });

    tl.to(targets, {
      opacity: 1,
      y: 0,
      duration: options?.duration ?? 0.8,
      stagger: options?.stagger ?? 0.12,
      ease: 'power3.out',
      delay: options?.delay ?? 0,
    });

    return () => {
      tl.kill();
      ScrollTrigger.getAll().forEach(st => st.kill());
    };
  }, []);

  return ref;
}

/**
 * Animate a single element on scroll.
 */
export function useScrollFade<T extends HTMLElement = HTMLDivElement>(options?: {
  y?: number;
  x?: number;
  scale?: number;
  duration?: number;
  delay?: number;
  start?: string;
}) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    gsap.set(el, {
      opacity: 0,
      y: options?.y ?? 30,
      x: options?.x ?? 0,
      scale: options?.scale ?? 1,
    });

    const anim = gsap.to(el, {
      opacity: 1,
      y: 0,
      x: 0,
      scale: 1,
      duration: options?.duration ?? 0.9,
      delay: options?.delay ?? 0,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: el,
        start: options?.start ?? 'top 85%',
        once: true,
      },
    });

    return () => {
      anim.kill();
    };
  }, []);

  return ref;
}

/**
 * Counter animation - animates a number from 0 to target.
 */
export function useCountUp(
  target: number,
  options?: { duration?: number; delay?: number; start?: string }
) {
  const ref = useRef<HTMLDivElement>(null);
  const objRef = useRef({ value: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const anim = gsap.to(objRef.current, {
      value: target,
      duration: options?.duration ?? 2,
      delay: options?.delay ?? 0,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: el,
        start: options?.start ?? 'top 85%',
        once: true,
      },
      onUpdate: () => {
        el.textContent = Math.floor(objRef.current.value).toLocaleString('en-US');
      },
    });

    return () => {
      anim.kill();
    };
  }, [target]);

  return ref;
}

/**
 * Magnetic hover effect for buttons/cards.
 */
export function useMagnetic<T extends HTMLElement = HTMLDivElement>(strength = 0.3) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const handleMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      gsap.to(el, { x: x * strength, y: y * strength, duration: 0.3, ease: 'power2.out' });
    };

    const handleLeave = () => {
      gsap.to(el, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.3)' });
    };

    el.addEventListener('mousemove', handleMove);
    el.addEventListener('mouseleave', handleLeave);

    return () => {
      el.removeEventListener('mousemove', handleMove);
      el.removeEventListener('mouseleave', handleLeave);
    };
  }, [strength]);

  return ref;
}

/**
 * Parallax scroll effect.
 */
export function useParallax<T extends HTMLElement = HTMLDivElement>(speed = 0.5) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    gsap.to(el, {
      y: () => speed * 100,
      ease: 'none',
      scrollTrigger: {
        trigger: el,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      },
    });
  }, [speed]);

  return ref;
}

export { gsap, ScrollTrigger };
