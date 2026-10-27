import type { FilmCtx } from './film';

/**
 * The film's choreography, from Kinetic Studio's Handy films (golpes.js, Finger.ts, the "lupa"): word slams on panels
 * that sweep the frame, headlines that slam in on the beat, cards that leave the device big, a finger that taps.
 * Only transform and opacity (and clip-path for reveals); absolute times; states set with `gsap.set`, never `from`.
 */

/** A scene is visible from `a` to `b` (its DOM stays mounted; visibility switches on the timeline). */
export function span(c: FilmCtx, sel: string, a: number, b: number) {
  const el = c.one(sel);
  c.tl.set(el, { visibility: 'visible' }, a).set(el, { visibility: 'hidden' }, b);
}

export interface Slam {
  /** The panel's selector inside the golpe scene. */
  panel: string;
  at: number;
  from: 'left' | 'right' | 'bottom' | 'top' | 'none';
  /** Lower half only: the previous word goes up to the top half. */
  half?: boolean;
}

/**
 * Word slams (Kinetic `ha-golpe`): each word owns a panel that sweeps in and lands on its beat; the word punches
 * from big to its size, then bumps half a beat later. `exit`: the last 0.3 s throw the scene at the camera.
 */
export function golpe(c: FilmCtx, scene: string, slams: Slam[], { exit, end }: { exit?: boolean; end: number }) {
  const { tl, sfx, L } = c;
  const root = c.one(scene);
  const sweep = 0.16;
  slams.forEach((s, i) => {
    const panel = c.one(`${scene} ${s.panel}`);
    const word = panel.querySelector<HTMLElement>('.tr-word')!;
    const off = { left: { xPercent: -100 }, right: { xPercent: 100 }, bottom: { yPercent: 100 }, top: { yPercent: -100 }, none: {} }[s.from];
    tl.set(panel, { ...off, autoAlpha: s.from === 'none' ? 1 : 1 }, 0);
    tl.set(word, { scale: s.from === 'none' ? 1.08 : 1.4, autoAlpha: s.from === 'none' ? 1 : 0 }, 0);
    if (s.from !== 'none') {
      tl.to(panel, { xPercent: 0, yPercent: 0, duration: sweep, ease: 'power3.out' }, s.at - sweep);
      sfx('whoosh', s.at - sweep, 0.35, 0.18);
    }
    tl.to(word, { autoAlpha: 1, duration: 0.08 }, s.at).to(word, { scale: 1, duration: 0.42, ease: 'expo.out' }, s.at);
    tl.to(word, { scale: 1.035, duration: 0.07, ease: 'power2.out' }, s.at + 0.5).to(word, { scale: 1, duration: 0.25, ease: 'power2.out' }, s.at + 0.57);
    sfx('clap', s.at, 0.32);
    if (i === 0) sfx('boom', s.at, 0.5);
    // The word before a lower-half panel moves to the top half, so both read together.
    if (s.half && i > 0) {
      const prev = c.one(`${scene} ${slams[i - 1].panel} .tr-word`);
      tl.to(prev, { y: -L.H / 4, duration: 0.3, ease: 'expo.out' }, s.at - sweep);
    }
  });
  if (exit) {
    // Opacity, not autoAlpha: the scene's visibility belongs to `span`, and a reset here would show it again.
    tl.to(root, { scale: 3.2, opacity: 0, duration: 0.3, ease: 'power4.in', transformOrigin: '50% 60%' }, end - 0.3);
    tl.set(root, { scale: 1, opacity: 1 }, end);
  }
}

/** A white flash (a cut on a hit). */
export function flash(c: FilmCtx, at: number, peak = 0.9) {
  const f = c.one('.tr-flash');
  c.tl.set(f, { opacity: peak }, at).to(f, { opacity: 0, duration: 0.45, ease: 'power2.out' }, at);
}

/** The chapter tag (cobalt pill) enters from the left on its beat and leaves at `out`. */
export function tag(c: FilmCtx, sel: string, at: number, out: number) {
  const el = c.one(sel);
  c.tl.set(el, { autoAlpha: 0, x: -40 }, 0);
  c.tl.to(el, { autoAlpha: 1, x: 0, duration: 0.5, ease: 'expo.out' }, at);
  c.tl.to(el, { autoAlpha: 0, x: -30, duration: 0.2, ease: 'power2.in' }, out - 0.2);
}

/** A headline slams in on its beat (words rise in cascade) and leaves just before the next one. */
export function head(c: FilmCtx, sel: string, at: number, out: number) {
  const el = c.one(sel);
  const words = Array.from(el.children) as HTMLElement[];
  c.tl.set(el, { autoAlpha: 0 }, 0);
  c.tl.set(words, { y: 70, autoAlpha: 0 }, 0);
  c.tl.set(el, { autoAlpha: 1 }, at);
  c.tl.to(words, { y: 0, autoAlpha: 1, duration: 0.5, ease: 'expo.out', stagger: 0.05 }, at);
  c.tl.to(el, { autoAlpha: 0, y: -40, duration: 0.18, ease: 'power2.in' }, out - 0.18);
}

/** Center of `el` in stage coordinates (the stage is rendered 1:1). */
export function center(c: FilmCtx, el: Element) {
  const r = el.getBoundingClientRect();
  const s = c.root.getBoundingClientRect();
  return { x: r.left - s.left + r.width / 2, y: r.top - s.top + r.height / 2 };
}
export function box(c: FilmCtx, el: Element) {
  const r = el.getBoundingClientRect();
  const s = c.root.getBoundingClientRect();
  return { x: r.left - s.left, y: r.top - s.top, w: r.width, h: r.height };
}

/**
 * The lupa: a big card leaves the device. It starts small over `fromEl` (or at a point) and lands at `to`
 * (stage px, top-left) with a ding; it leaves at `out`.
 */
export function lupa(c: FilmCtx, card: HTMLElement, from: { x: number; y: number }, to: { x: number; y: number }, at: number, out: number, { rot = 0 }: { rot?: number } = {}) {
  const { tl, sfx } = c;
  const w = card.offsetWidth;
  const h = card.offsetHeight;
  tl.set(card, { x: from.x - w / 2, y: from.y - h / 2, scale: 0.35, autoAlpha: 0, rotation: 0 }, 0);
  tl.set(card, { autoAlpha: 1 }, at);
  tl.to(card, { x: to.x, y: to.y, scale: 1, rotation: rot, duration: 0.6, ease: 'expo.out' }, at);
  sfx('bell', at + 0.05, 1568, 0.06, 0.6);
  tl.to(card, { autoAlpha: 0, scale: 0.92, duration: 0.2, ease: 'power2.in' }, out - 0.2);
}

/**
 * The finger: comes in, travels to `p` and presses (ripple, tap sound) at `press`. `chain`: it is already on screen
 * (the previous tap), so it travels from there instead of entering again.
 */
export function tap(c: FilmCtx, p: { x: number; y: number }, enter: number, press: number, { chain = false }: { chain?: boolean } = {}) {
  const f = c.one('.tr-finger');
  const dot = f.querySelector('.tr-finger-dot')!;
  const ripple = f.querySelector('.tr-finger-ripple')!;
  const { tl, sfx } = c;
  if (!chain) {
    tl.set(f, { x: p.x + 160, y: p.y + 220, autoAlpha: 0 }, enter);
    tl.to(f, { autoAlpha: 1, duration: 0.15 }, enter);
  }
  tl.to(f, { x: p.x, y: p.y, duration: press - enter - 0.06, ease: 'power3.inOut' }, enter);
  tl.to(dot, { scale: 0.82, duration: 0.08, ease: 'power2.out' }, press - 0.06).to(dot, { scale: 1, duration: 0.2, ease: 'power2.out' }, press + 0.04);
  tl.set(ripple, { scale: 0.6, autoAlpha: 0.9 }, press).to(ripple, { scale: 1.9, autoAlpha: 0, duration: 0.45, ease: 'expo.out' }, press);
  sfx('tick', press, 0.12);
  return press;
}
export function fingerOut(c: FilmCtx, at: number) {
  c.tl.to(c.one('.tr-finger'), { autoAlpha: 0, y: '+=120', duration: 0.25, ease: 'power2.in' }, at);
}
