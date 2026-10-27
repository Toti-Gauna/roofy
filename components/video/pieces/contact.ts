import { CHAT_SLOTS, CLOCK_START, ASKED, listingById } from '@/components/demos/real-estate/data';
import type { Piece, Step, Take } from '../piece';

/**
 * P1 · Contact — «Ninguna consulta se pierde» (biblia v2 §5, lote V1, the pilot). 36.4 s, phase 1/6.
 * Shows only what Contact includes: the site, the CRM, the guided chat (buttons, no AI, no WhatsApp: D20)
 * and the brand setup. No follow-ups (Growth), no prices, no quotas.
 *
 * Each shot is a take of the real demo: its beats are played off camera (negative `at`) until the moment
 * the shot films. Times were measured with `--probe` (docs/video-factory.md): from «Simular» on beat 2,
 * Carolina answers «Con crédito» after 0.5 s and the budget after 4.0 s (her card turns «Calificado»);
 * from «Simular» on beat 3 the visit lands after 3.0 s.
 */

const visit = CHAT_SLOTS.fri;

/** The same steps for both ratios; the 16:9 films the desktop, the 9:16 the phone app. */
const both = (desktop: Omit<Take, 'steps'>, phone: Omit<Take, 'steps'>, steps: Step[], phoneOnly: Step[] = []): Record<'16x9' | '9x16', Take> => ({
  '16x9': { ...desktop, steps },
  '9x16': { ...phone, steps: [...steps, ...phoneOnly] },
});
/** The phone app at a fixed zoom (its text stays readable in 9:16); the shot picks what part shows. */
const phoneView = { view: 'app', frame: '.re-view', zoom: 1.6, align: { y: 0 }, push: 0.03 } as const;
/** The desktop's working area (below the top bar, beside the sidebar). */
const desk = { view: 'laptop', frame: '.demo-content', push: 0.03 } as const;

export const contact: Piece = {
  id: 'contact',
  plan: 'contact',
  lens: 'contact',
  version: 1,
  total: 35_000,
  tolerance: 5_000,
  longShots: ['chat', 'inbox', 'pipeline'],
  shots: [
    {
      // 23:40, the office is closed: the screen is dark until the light uncovers it.
      id: 'closed',
      kind: 'ui',
      start: 0,
      end: 4_000,
      headline: true,
      captionAt: 300,
      dark: { at: 1_500 },
      readout: (x) => `${x.day(CLOCK_START.day)} · ${x.fmt.time(CLOCK_START.min)}`,
      takes: both({ view: 'laptop', push: 0.03 }, phoneView, [{ at: -600, nav: 'today' }]),
    },
    {
      // Carolina's phone: she writes on the site; the guided chat asks and she answers with a button.
      id: 'chat',
      kind: 'ui',
      start: 4_000,
      end: 12_000,
      caption: true,
      captionAt: 400,
      takes: both({ view: 'buyer', frame: '.demo-chat', pad: 10, push: 0.02 }, { view: 'buyer', frame: '.demo-chat', zoom: 1.6, align: { y: 1 }, push: 0.02 }, [
        { at: -1_300, play: true },
        { at: 5_200, play: true },
        { at: 5_550, ring: '.demo-chat-chip', text: 'chat.replies.credit' },
        { at: 5_700, sound: 'select' },
      ]),
    },
    {
      // The CRM: the same conversation, and her file completes as she answers the budget.
      id: 'inbox',
      kind: 'ui',
      start: 12_000,
      end: 18_000,
      caption: true,
      captionAt: 300,
      takes: both(desk, phoneView, [
        { at: -13_000, play: true },
        { at: -7_000, finish: true },
        { at: -2_400, nav: 'inbox' },
        { at: -1_800, play: true },
        { at: 2_200, sound: 'select' },
      ]),
    },
    {
      // The pipeline: the same answer moves her card from «Nuevo» to «Calificado».
      id: 'pipeline',
      kind: 'ui',
      start: 18_000,
      end: 24_000,
      caption: true,
      captionAt: 300,
      takes: both(desk, { ...phoneView, frame: '[data-flip="carolina"]', align: { y: 0.3 } }, [
        { at: -14_000, play: true },
        { at: -9_000, finish: true },
        { at: -2_200, play: true },
        { at: -1_700, nav: 'pipeline' },
      ]),
    },
    {
      // The visit lands in Friday's agenda.
      id: 'visit',
      kind: 'ui',
      start: 24_000,
      end: 29_000,
      readout: (x) => `${x.day(visit.day)} · ${x.fmt.time(visit.start)}\n${listingById(ASKED).street}`,
      takes: both(desk, { ...phoneView, align: { y: 1 } }, [
        { at: -20_000, play: true },
        { at: -15_000, finish: true },
        { at: -14_500, play: true },
        { at: -7_000, finish: true },
        { at: -1_500, play: true },
        // The phone app's beat focus opens the chat; the agenda is where this shot happens.
        { at: -1_100, nav: 'visits' },
        { at: 1_500, sound: 'success' },
      ], [{ at: -600, scroll: 'bottom' }]),
    },
    {
      // The brand setup: the site and a listing take Lumen's brand (an edge passes).
      id: 'brand',
      kind: 'ui',
      start: 29_000,
      end: 33_000,
      caption: true,
      captionAt: 200,
      takes: both({ view: 'laptop', frame: '.re-applied', pad: 16, push: 0.02 }, { ...phoneView, frame: '.re-applied' }, [
        { at: -1_200, nav: 'brand' },
        { at: -800, click: '.re-applied .re-segment button', text: 'brand.before' },
        { at: 700, click: '.re-applied .re-segment button', text: 'brand.after', tap: true, sound: 'select' },
      ]),
    },
    // Phase 1/6, the plan's name and what it includes. The price is in the HTML next to the video.
    { id: 'close', kind: 'close', start: 33_000, end: 36_400 },
  ],
};
