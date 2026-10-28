'use client';

import { useRef } from 'react';
import { useIsClient } from '@/components/motion/useIsClient';
import { useReducedMotion } from '@/components/motion/useReducedMotion';
import { Eclipse } from './Eclipse';
import { Starfield } from './Starfield';
import { Dial } from './Dial';
import { useStarParallax } from './useStarParallax';
import { useHeroMotion } from './useHeroMotion';

/**
 * Full-bleed visual layer of the hero (behind the copy, decorative). Adapted from Eclipse-Web
 * (components/hero/HeroStage.tsx, 5cdb887) without the WebGL corona (`ogl` is not a dependency here:
 * the CSS corona is the whole eclipse) and without the rubro dial controller.
 *
 * Layers, back to front: warm sky (scroll) · stars (mouse parallax) · bloom (scroll) · eclipse · dial.
 * Nothing moves on its own: at rest it is a still picture that costs no frames. Reduced motion: still.
 * Wrappers keep every motion on its own element:
 *   [data-hero-eclipse-motion] parallax x/y + scroll scale
 *   [data-eclipse-moon-scroll] scroll moon offset
 */
export function HeroStage() {
  const reduced = useReducedMotion();
  const isClient = useIsClient();
  const motion = isClient && !reduced;
  const stage = useRef<HTMLDivElement>(null);

  useStarParallax(stage, motion);
  useHeroMotion(stage, motion);

  return (
    <div ref={stage} aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {motion ? <div data-hero-sky className="hero-sky absolute inset-0" /> : null}
      <Starfield />
      <div className="hero-eclipse-anchor">
        <div data-hero-eclipse-motion className="relative">
          {motion ? <div data-hero-bloom className="hero-bloom" /> : null}
          <div className="relative">
            <Eclipse className="[--eclipse-size:var(--hero-eclipse-size)]" />
            <Dial />
          </div>
        </div>
      </div>
    </div>
  );
}
