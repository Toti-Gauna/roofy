'use client';

import { useRef } from 'react';
import { useGSAP } from '@/components/motion/gsap';
import { observeEnter } from '@/components/motion/observeEnter';
import { prefersReducedMotion } from '@/components/motion/useReducedMotion';
import type { ProductId } from '@/lib/products';
import { ProductArt } from './ProductArt';
import { plateLife } from './artIdle';
import './plate.css';

/**
 * A product's plate in its frame (`.ticks`): drawn once when it reaches the reading line (artEntrance: the scan crosses
 * it, its groups come in, the amber point lights last), then its small story loops while it is on screen (artIdle:
 * Roofy's visitor walks up to the door, the lead travels to the card). Like Eclipse-Web's plates (76767ea).
 * The initial state is set before the first paint (useGSAP is a layout effect), so the plate never flashes finished
 * and then hides. Reduced motion: nothing, the plate is simply there.
 */
export function Plate({ id, className = '' }: { id: ProductId; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      const frame = ref.current;
      if (!frame || prefersReducedMotion()) return;
      const life = plateLife(frame, { duration: 1.3 });
      const cancel = observeEnter(frame, 'top 92%', () => void life.entrance.play());
      return () => {
        cancel();
        life.dispose();
      };
    },
    { scope: ref },
  );
  return (
    <div ref={ref} className={`pd-art ticks ${className}`}>
      <ProductArt id={id} />
      <span aria-hidden className="pd-scan" data-art-scan />
    </div>
  );
}
