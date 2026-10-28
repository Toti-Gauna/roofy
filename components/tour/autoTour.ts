'use client';

import { gsap } from '@/components/motion/gsap';
import { prefersReducedMotion } from '@/components/motion/useReducedMotion';

/**
 * The automatic tour of the home (decision of Ignacio, 28/10/2026): «Ver qué ofrecemos» starts it and the page scrolls
 * itself through what Eclipse offers, holding on each stop long enough to read. As soon as the visitor takes over —
 * wheel, touch, a key, a click on the page or dragging the scrollbar — it pauses and a floating «Seguir con el tour
 * automático» (AutoTourButton) hands control back.
 *
 * Copied from Eclipse-Web (components/tour/autoTour.ts, 76767ea). What changed: the stops are not a fixed list of
 * sections but every `[data-tour-stop]` of the page, in page order (each section of lotes B3–B5 adds its own), and a
 * stop closer than half a screen to the previous one is skipped (`pickStops`). roofy's top row is not fixed, so a stop
 * lands with a little air above it instead of under a header. No analytics.
 *
 * The scrolling is a GSAP tween of window.scrollTo (never a scroll-hijack: any input stops it at once). Stops are
 * functions, re-read every frame, so a section that changes height while the tour runs never leaves it off target.
 * Reduced motion: no tour; the caller's link jumps to the section.
 */
export type TourState = 'idle' | 'running' | 'paused';

/** How long each stop is held (s), and the pace of a hop (px per second, clamped to MIN–MAX s). */
const HOLD = 2.6;
const HOLD_LAST = 1.8;
const PACE = 1400;
const HOP_MIN = 0.8;
const HOP_MAX = 2;
/** Air above what a stop shows (px). */
const AIR = 24;
/** A stop closer than this part of the screen to the previous one is skipped (it is already on screen). */
const MIN_GAP = 0.5;

let state: TourState = 'idle';
let tween: gsap.core.Tween | null = null;
let holdTimer = 0;
let lastSet = 0;
const listeners = new Set<() => void>();

export const getTourState = (): TourState => state;
export const subscribeTour = (cb: () => void) => {
  listeners.add(cb);
  return () => listeners.delete(cb);
};
const setState = (s: TourState) => {
  if (state === s) return;
  state = s;
  listeners.forEach((cb) => cb());
};

/**
 * Which stops to keep, by index: the first one, then each one at least `minGap` × the screen below the last one kept.
 * Pure (positions in px, page order).
 */
export function pickStops(positions: readonly number[], viewportHeight: number, minGap = MIN_GAP): number[] {
  const kept: number[] = [];
  let last = -Infinity;
  positions.forEach((y, i) => {
    if (y - last >= viewportHeight * minGap) {
      kept.push(i);
      last = y;
    }
  });
  return kept;
}

const topOf = (el: Element) => el.getBoundingClientRect().top + window.scrollY;
/** The furthest the page can scroll: a stop below it lands here (else the browser clamps the scroll and the tour would read it as the visitor's). */
const maxY = () => Math.max(0, document.documentElement.scrollHeight - window.innerHeight);

/** Every stop of the tour, as a function that returns its scroll position now. */
function stops(): (() => number)[] {
  const all = [...document.querySelectorAll('[data-tour-stop]')].map((el) => () => Math.min(maxY(), Math.max(0, topOf(el) - AIR)));
  return pickStops(
    all.map((f) => f()),
    window.innerHeight,
  ).map((i) => all[i]);
}

const INPUT_EVENTS: (keyof WindowEventMap)[] = ['wheel', 'touchstart', 'touchmove', 'pointerdown', 'keydown'];
const NAV_KEYS = new Set(['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', ' ', 'Spacebar']);

function onInput(e: Event) {
  if (state !== 'running') return;
  const target = e.target as Element | null;
  if (target?.closest?.('[data-tour-ui]')) return;
  if (e.type === 'keydown' && !NAV_KEYS.has((e as KeyboardEvent).key)) return;
  pause();
}
function onScroll() {
  // A scroll the tour did not make (the scrollbar, momentum, a focus jump): hand control over.
  if (state === 'running' && Math.abs(window.scrollY - lastSet) > 48) pause();
}

function listen(on: boolean) {
  for (const type of INPUT_EVENTS) (on ? window.addEventListener : window.removeEventListener).call(window, type, onInput, { capture: true, passive: true });
  (on ? window.addEventListener : window.removeEventListener).call(window, 'scroll', onScroll, { passive: true });
}

function clear() {
  tween?.kill();
  tween = null;
  window.clearTimeout(holdTimer);
}

function go(i: number, list: (() => number)[]) {
  if (state !== 'running') return;
  if (i >= list.length) return stop();
  const from = window.scrollY;
  const dist = Math.abs(list[i]() - from);
  lastSet = from;
  const p = { v: 0 };
  tween = gsap.to(p, {
    v: 1,
    duration: dist < 4 ? 0.01 : Math.min(HOP_MAX, Math.max(HOP_MIN, dist / PACE)),
    ease: 'power2.inOut',
    onUpdate: () => {
      const y = from + (list[i]() - from) * p.v;
      lastSet = y;
      window.scrollTo(0, y);
    },
    onComplete: () => {
      // Land exactly on the stop even if something above changed height during the hop.
      lastSet = list[i]();
      window.scrollTo(0, lastSet);
      holdTimer = window.setTimeout(() => go(i + 1, list), (i === list.length - 1 ? HOLD_LAST : HOLD) * 1000);
    },
  });
}

/** Starts the tour from the first stop. With reduced motion (or nothing to tour) it returns false: the caller's link jumps. */
export function startTour(): boolean {
  if (prefersReducedMotion()) return false;
  const list = stops();
  if (!list.length) return false;
  clear();
  listen(false);
  setState('running');
  listen(true);
  go(0, list);
  return true;
}

export function pause() {
  if (state !== 'running') return;
  clear();
  listen(false);
  setState('paused');
}

/** Continues from the next stop below where the visitor is now. */
export function resumeTour() {
  if (state !== 'paused') return;
  const list = stops();
  const y = window.scrollY;
  let i = list.findIndex((f) => f() > y + 60);
  if (i < 0) i = list.length;
  clear();
  setState('running');
  listen(true);
  go(i, list);
}

/** Ends the tour (the last stop, or «Terminar el tour»). */
export function stop() {
  clear();
  listen(false);
  setState('idle');
}
