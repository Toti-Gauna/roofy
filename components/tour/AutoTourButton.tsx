'use client';

import { useSyncExternalStore, type ReactNode } from 'react';
import { Play, X } from 'lucide-react';
import { getTourState, resumeTour, startTour, stop, subscribeTour } from './autoTour';
import './auto-tour.css';

/**
 * «Seguir con el tour automático»: floats at the bottom centre whenever the visitor has taken over a running tour.
 * Pressing it hands the scroll back to the tour; the small × ends it. It leaves the tab order while hidden.
 * Copied from Eclipse-Web (components/tour/AutoTourButton.tsx, 76767ea); the copy comes in as props (the home has no
 * client messages provider).
 */
export function AutoTourButton({ text }: { text: { resume: string; stop: string } }) {
  const state = useSyncExternalStore(subscribeTour, getTourState, () => 'idle' as const);
  const shown = state === 'paused';
  return (
    <div className="atb" data-tour-ui data-shown={shown || undefined} inert={!shown}>
      <button type="button" className="atb-main" onClick={resumeTour}>
        <Play aria-hidden className="size-4" strokeWidth={1.6} />
        {text.resume}
      </button>
      <button type="button" className="atb-close" onClick={stop} aria-label={text.stop}>
        <X aria-hidden className="size-4" strokeWidth={1.6} />
      </button>
    </div>
  );
}

/**
 * The link that starts the tour: a real link to the section (`href`, `#id`), so without JS or with reduced motion it
 * simply jumps there; with motion it starts the tour instead and moves focus to the section without scrolling (the
 * section is `tabIndex={-1}`). Modifier clicks (new tab…) are left alone.
 */
export function TourStartLink({ href, className, children }: { href: string; className?: string; children: ReactNode }) {
  return (
    <a
      href={href}
      data-tour-start
      className={className}
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
        if (!startTour()) return;
        e.preventDefault();
        // What the native jump would do: keyboard and screen-reader users go on from the section, not from the hero.
        document.getElementById(href.slice(1))?.focus({ preventScroll: true });
      }}
    >
      {children}
    </a>
  );
}

