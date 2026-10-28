'use client';

import { useEffect, type RefObject } from 'react';
import { gsap, ScrollTrigger, useGSAP } from '@/components/motion/gsap';
import { DISC_RADIUS, MOON_DIR, SCROLL_MOON } from './geometry';

/**
 * The hero's scroll timeline. Copied from Eclipse-Web (components/hero/useHeroMotion.ts, 5cdb887) without
 * what roofy does not have: the loader's entrance (roofy has no loader: the hero is a still picture at
 * first paint and nothing hides the H1) and the WebGL corona's motion bus.
 *
 * Where the hero is pinned (if it fits the screen; the section then gets [data-pinned]): wide, tall screens
 * driven by a mouse or trackpad. Touch screens are never pinned (a pin fights momentum scrolling and the
 * browser toolbars there): the same timeline is scrubbed while the hero scrolls away. Reduced motion: nothing
 * (the caller passes `enabled: false`). Scrubbed, the moon slides diagonally toward third contact, the bloom
 * and the warm sky come up, the eclipse grows a little and the copy drifts up (a drift, never a fade-out).
 */
const HERO_PIN_QUERY = '(min-width: 768px) and (min-height: 600px) and (hover: hover) and (pointer: fine)';

export function useHeroMotion(stageRef: RefObject<HTMLElement | null>, enabled: boolean) {
  // Every trigger is measured again once the web fonts are in and whenever the hero's height changes.
  useEffect(() => {
    const section = stageRef.current?.closest<HTMLElement>('[data-hero]');
    if (!section) return;
    let raf = 0;
    let disposed = false;
    const refresh = () => {
      if (raf || disposed) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        ScrollTrigger.refresh(true);
      });
    };
    document.fonts?.ready.then(refresh);
    let height = section.offsetHeight;
    const ro = new ResizeObserver(() => {
      const next = section.offsetHeight;
      if (Math.abs(next - height) < 1) return;
      height = next;
      refresh();
    });
    ro.observe(section);
    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [stageRef]);

  useGSAP(
    () => {
      const stage = stageRef.current;
      const section = stage?.closest<HTMLElement>('[data-hero]');
      if (!enabled || !stage || !section) return;

      const mm = gsap.matchMedia();
      mm.add({ pinnable: HERO_PIN_QUERY, motion: '(prefers-reduced-motion: no-preference)' }, (ctx) => {
        const conditions = ctx.conditions as { pinnable: boolean; motion: boolean };
        if (!conditions.motion) return;
        // Only pin what fits the screen, so the pinned stretch never hides the CTA.
        const pin = conditions.pinnable && section.offsetHeight <= window.innerHeight + 2;
        section.toggleAttribute('data-pinned', pin);
        const q = <T extends Element>(root: Element, sel: string) => root.querySelector<T>(sel);
        const moonPct = SCROLL_MOON * DISC_RADIUS * 100; // % of the eclipse square

        const tl = gsap.timeline({ defaults: { ease: 'none', duration: 1 } });
        tl.fromTo(
          q(stage, '[data-eclipse-moon-scroll]'),
          { xPercent: 0, yPercent: 0 },
          { xPercent: MOON_DIR.x * moonPct, yPercent: MOON_DIR.y * moonPct, ease: 'power1.inOut' },
          0,
        )
          .fromTo(q(stage, '[data-hero-bloom]'), { autoAlpha: 0, scale: 0.7 }, { autoAlpha: 1, scale: 1.12 }, 0)
          .fromTo(q(stage, '[data-hero-sky]'), { autoAlpha: 0 }, { autoAlpha: 1 }, 0)
          .fromTo(q(stage, '[data-hero-eclipse-motion]'), { scale: 1 }, { scale: pin ? 1.08 : 1.05 }, 0)
          .fromTo(q(section, '[data-hero-copy-inner]'), { y: 0 }, { y: pin ? -56 : -24, ease: 'power1.in' }, 0);

        const spacer = section.parentElement?.matches('[data-hero-pin-spacer]') ? section.parentElement : undefined;
        ScrollTrigger.create({
          trigger: section,
          start: 'top top',
          end: pin ? '+=100%' : 'bottom top',
          pin: pin ? section : false,
          pinSpacer: pin ? spacer : undefined,
          anticipatePin: pin ? 1 : 0,
          scrub: pin ? 0.6 : 0.3,
          refreshPriority: 1,
          animation: tl,
        });
        return () => section.removeAttribute('data-pinned');
      });

      const raf = requestAnimationFrame(() => ScrollTrigger.refresh());
      return () => {
        cancelAnimationFrame(raf);
        mm.revert();
      };
    },
    { dependencies: [enabled], revertOnUpdate: true },
  );
}
