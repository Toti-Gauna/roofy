import type { Sfx } from './kinetic/score';
import type { Ratio } from './timeline';

/**
 * A film (the Kinetic Studio way): its DOM is rendered once, every scene stacked and hidden, and one paused GSAP
 * timeline moves it in absolute times. `seek(t)` shows any frame; the driver steps it frame by frame.
 */
export interface Layout {
  W: number;
  H: number;
  vertical: boolean;
  /** Chapter tag and headline block. */
  tag: { x: number; y: number };
  heads: { x: number; y: number; w: number; h: number };
  /** Where the headline block sits while big cards fill the frame. */
  headsUp: number;
  browser: { x: number; y: number; s: number };
  phone: { x: number; y: number; s: number };
  /** Where a single big card lands (the lupa). */
  lupa: { x: number; y: number };
  /** Three big cards in a row (16:9) or staggered (9:16). */
  row: { x: number; y: number }[];
}

export const LAYOUTS: Record<Ratio, Layout> = {
  '16x9': {
    W: 1920,
    H: 1080,
    vertical: false,
    tag: { x: 120, y: 330 },
    heads: { x: 120, y: 410, w: 640, h: 360 },
    headsUp: -250,
    browser: { x: 800, y: 170, s: 1 },
    phone: { x: 1240, y: 80, s: 1 },
    lupa: { x: 110, y: 680 },
    row: [
      { x: 230, y: 470 },
      { x: 750, y: 470 },
      { x: 1270, y: 470 },
    ],
  },
  '9x16': {
    W: 1080,
    H: 1920,
    vertical: true,
    // Centred on the frame's middle band: the platforms' own UI covers the top and the bottom.
    tag: { x: 80, y: 400 },
    heads: { x: 80, y: 480, w: 920, h: 240 },
    headsUp: 0,
    browser: { x: 20, y: 780, s: 0.96 },
    phone: { x: 321, y: 740, s: 1.04 },
    lupa: { x: 80, y: 1300 },
    row: [
      { x: 70, y: 900 },
      { x: 590, y: 900 },
      { x: 330, y: 1270 },
    ],
  },
};

export interface FilmCtx {
  tl: gsap.core.Timeline;
  root: HTMLElement;
  /** Selector scoped to the film. */
  q: (sel: string) => HTMLElement[];
  one: (sel: string) => HTMLElement;
  sfx: Sfx;
  L: Layout;
}
