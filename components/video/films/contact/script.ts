import type { EstateTab } from '@/components/demos/real-estate/data';

/**
 * P1 · Contact — the script (STORYBOARD.md next to this file): when each word is on screen and which area of the
 * product each chapter shows. Pure (no DOM, no React): the film reads it, the subtitles come from it, and
 * tests/video.test.ts checks it (reading times, the beat, everything Contact delivers and nothing it doesn't).
 */
export const CONTACT_DURATION = 58;
/** The price lands here, on an eighth of the score: the closing holds 52–58 s, the brand first, then the price long
 *  enough to read (and its subtitle under 15 characters per second). */
export const PRICE_AT = 55.25;

export const HEADS = ['web1', 'web2', 'web3', 'chat1', 'chat2', 'inbox', 'contacts', 'pipeline', 'visits', 'tasks', 'listings', 'team', 'kit', 'applied', 'profiles', 'library'] as const;
export type HeadId = (typeof HEADS)[number];

/** When each headline is on screen (its chapter beat → the next one). */
export const HEAD_TIMES: Record<HeadId, [number, number]> = {
  web1: [6.1, 8],
  web2: [8.05, 11],
  web3: [11.05, 14],
  chat1: [14.1, 16],
  chat2: [16.05, 18],
  inbox: [20.05, 22],
  contacts: [22.05, 24],
  pipeline: [24.05, 26],
  visits: [26.05, 28],
  tasks: [28.05, 30],
  listings: [30.05, 32],
  team: [32.05, 34],
  kit: [36.1, 39],
  applied: [39.05, 42],
  profiles: [42.05, 45],
  library: [45.05, 48],
};

/** The word slams, each with its beat (the subtitles pair them). */
export const GOLPES: { scene: string; words: { id: string; at: number }[] }[] = [
  { scene: 'gancho', words: [{ id: 'g1', at: 0 }, { id: 'g2', at: 1 }, { id: 'g3', at: 2 }, { id: 'g4', at: 3 }] },
  { scene: 'giro', words: [{ id: 'g5', at: 18 }, { id: 'g6', at: 19 }] },
  { scene: 'marcha', words: [{ id: 'g7', at: 34 }, { id: 'g8', at: 35 }] },
  { scene: 'resumen', words: [{ id: 's1', at: 48 }, { id: 's2', at: 49 }, { id: 's3', at: 50 }, { id: 's4', at: 51 }] },
];

/** What each chapter shows, as the demo's areas: one chapter per deliverable of Contact (guía de motion §0). */
export const COVERS: Record<'web' | 'chat' | 'crm' | 'setup', EstateTab[]> = {
  web: ['site'],
  chat: ['inbox'],
  crm: ['inbox', 'contacts', 'pipeline', 'visits', 'tasks', 'listings', 'team'],
  setup: ['brand'],
};

/** A line on screen and when (s); the subtitles repeat them while there is no voice. */
export interface FilmText {
  at: number;
  end: number;
  text: string;
}

/** The words on screen with their times. */
export function contactTexts(tc: (k: string) => string, tagline: string, brand: string, plan: string, price: string): FilmText[] {
  const out: FilmText[] = [];
  for (const g of GOLPES) {
    // Pairs read together (a question in two floors); the summary goes word by word.
    if (g.scene === 'resumen') g.words.forEach((w, i) => out.push({ at: w.at, end: g.words[i + 1]?.at ?? 52, text: tc(`golpes.${w.id}`) }));
    else for (let i = 0; i < g.words.length; i += 2) out.push({ at: g.words[i].at, end: g.words[i + 2]?.at ?? g.words[i].at + 2, text: `${tc(`golpes.${g.words[i].id}`)} ${tc(`golpes.${g.words[i + 1].id}`)}` });
  }
  for (const h of HEADS) out.push({ at: HEAD_TIMES[h][0], end: HEAD_TIMES[h][1], text: tc(`heads.${h}`) });
  out.push({ at: 52, end: PRICE_AT, text: `${brand} · ${plan} · ${tagline}` });
  out.push({ at: PRICE_AT, end: CONTACT_DURATION, text: price });
  return out.sort((a, b) => a.at - b.at);
}
