/**
 * Fictional data for "Lumen Propiedades — Demo" (vertical "inmobiliarias"): an agency that
 * sells and rents homes. People, zones and copy are message keys (namespace `demoRealEstate`)
 * so each locale names them; street addresses are invented. Prices are in USD, as homes are
 * listed in the region (all fictional).
 * Time: minutes from midnight on days of the week of Monday 5 October 2026 (day 0).
 * The story starts on Thursday 8 (day 3) at 23:40, with the office closed.
 */
import type { DemoTheme, Tone } from '../kit';

/**
 * The agency's name and its key number (the reading shown on "Hoy"). In Eclipse-Web they come from
 * `content/verticals.json`; roofy keeps them here so the demo does not need the sales catalog.
 */
export const LUMEN = { business: 'Lumen Propiedades', keyNumber: 100, keySuffix: '%' } as const;

/** Palette: stone · ink · cobalt · sand. Editorial and architectural: serif, hairlines, square corners. */
export const LUMEN_THEME: DemoTheme = {
  mode: 'light',
  bg: '#ECE8E1',
  surface: '#F6F4EF',
  sunken: '#E4DFD6',
  ink: '#141414',
  muted: '#57534B',
  line: 'rgb(20 20 20 / 0.13)',
  accent: '#2448C8',
  accentInk: '#FFFFFF',
  accentText: '#2448C8',
  accent2: '#D9CBB3',
  accent2Ink: '#141414',
  accent2Text: '#6B5733',
  ok: '#2E6B3E',
  warn: '#8A5A12',
  bad: '#A3352C',
  info: '#2C5A7A',
  radius: '0',
  display: { family: 'serif', weight: 400, tracking: '-0.015em' },
};

/* ------------------------------------------------------------------ */
/* Calendar                                                             */
/* ------------------------------------------------------------------ */
/** Monday 5 October 2026 (UTC). */
export const WEEK_START = Date.UTC(2026, 9, 5);
export const TODAY = 3;
export const dayDate = (day: number) => new Date(WEEK_START + day * 86_400_000);

/* ------------------------------------------------------------------ */
/* Listings                                                             */
/* ------------------------------------------------------------------ */
export type ListingId = 'olmos' | 'ceibo' | 'ribera' | 'colinas' | 'loft' | 'parque';
export type Kind = 'apartment' | 'duplex' | 'house' | 'loft' | 'ph';
export type ZoneId = 'arboleda' | 'ribera' | 'colinas' | 'centro' | 'parque';
export type Feature = 'balcony' | 'credit' | 'garage' | 'terrace' | 'garden' | 'pool' | 'river' | 'light' | 'patio';
/** Architectural composition used as the listing's "photo" (see facade.tsx). */
export type FacadeKind = 'tower' | 'midrise' | 'duplex' | 'house' | 'loft' | 'ph';
export type Scene = 'day' | 'dusk' | 'night';

export interface Listing {
  id: ListingId;
  kind: Kind;
  zone: ZoneId;
  /** Invented street address (not translated). */
  street: string;
  /** Rooms counted the Río de la Plata way (living included) and bedrooms. */
  rooms: number;
  beds: number;
  baths: number;
  area: number;
  /** Sale price, USD. */
  price: number;
  /** Monthly building fees, USD. */
  fees: number;
  features: Feature[];
  /** Inquiries and visits this week (before the story). */
  inquiries: number;
  visits: number;
  facade: FacadeKind;
  scene: Scene;
  /** Days on the market. */
  days: number;
  /** Building age in years (0 = new) and the main façade's orientation. */
  age: number;
  facing: 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SO' | 'O' | 'NO';
}

const L = (l: Listing) => l;
export const LISTINGS: Listing[] = [
  L({ id: 'olmos', kind: 'apartment', zone: 'arboleda', street: 'Olmos 1420', rooms: 3, beds: 2, baths: 1, area: 78, price: 168_000, fees: 95, features: ['balcony', 'credit', 'light'], inquiries: 11, visits: 4, facade: 'tower', scene: 'day', days: 12, age: 8, facing: 'N' }),
  L({ id: 'ceibo', kind: 'apartment', zone: 'arboleda', street: 'Ceibo 655', rooms: 3, beds: 2, baths: 1, area: 71, price: 146_000, fees: 70, features: ['credit', 'balcony'], inquiries: 7, visits: 3, facade: 'midrise', scene: 'dusk', days: 26, age: 22, facing: 'NE' }),
  L({ id: 'ribera', kind: 'duplex', zone: 'ribera', street: 'Paseo del Río 210', rooms: 4, beds: 3, baths: 2, area: 132, price: 248_000, fees: 140, features: ['terrace', 'river', 'garage'], inquiries: 9, visits: 3, facade: 'duplex', scene: 'dusk', days: 18, age: 4, facing: 'E' }),
  L({ id: 'colinas', kind: 'house', zone: 'colinas', street: 'Los Aromos 88', rooms: 5, beds: 3, baths: 3, area: 210, price: 320_000, fees: 0, features: ['garden', 'pool', 'garage'], inquiries: 6, visits: 2, facade: 'house', scene: 'day', days: 41, age: 15, facing: 'NO' }),
  L({ id: 'parque', kind: 'ph', zone: 'parque', street: 'Laprida 1735', rooms: 3, beds: 2, baths: 1, area: 84, price: 158_000, fees: 0, features: ['patio', 'credit'], inquiries: 8, visits: 2, facade: 'ph', scene: 'day', days: 9, age: 60, facing: 'O' }),
  L({ id: 'loft', kind: 'loft', zone: 'centro', street: 'Mitre 402', rooms: 2, beds: 1, baths: 1, area: 58, price: 112_000, fees: 60, features: ['light', 'credit'], inquiries: 5, visits: 1, facade: 'loft', scene: 'night', days: 33, age: 0, facing: 'S' }),
];
export const listingById = (id: ListingId) => LISTINGS.find((l) => l.id === id)!;

/** The listing the buyer asks about, and the cheaper one the agent offers when the budget is lower. */
export const ASKED: ListingId = 'olmos';
export const ALTERNATIVE: ListingId = 'ceibo';
/** Listings sent when the buyer asks for similar options after the visit. */
export const SIMILAR: ListingId[] = ['parque', 'ceibo'];

/** The public site. Fictional `.demo` domain. */
export const SITE_URL = 'lumenpropiedades.demo';
export const listingPath = (id: ListingId) => `${SITE_URL}/propiedad/${listingById(id).street.toLowerCase().replace(/\s+/g, '-')}`;

/* ------------------------------------------------------------------ */
/* People and leads                                                     */
/* ------------------------------------------------------------------ */
export type AdvisorId = 'julia' | 'marcos';
export const ADVISORS: { id: AdvisorId; initials: string; color: string; ink: string }[] = [
  { id: 'julia', initials: 'JR', color: '#2448C8', ink: '#FFFFFF' },
  { id: 'marcos', initials: 'MV', color: '#141414', ink: '#ECE8E1' },
];

export type Source = 'web' | 'whatsapp' | 'portal' | 'sign';
export const SOURCES: Source[] = ['web', 'whatsapp', 'portal', 'sign'];
export type Stage = 'new' | 'qualified' | 'visit' | 'reserve';
export const STAGES: Stage[] = ['new', 'qualified', 'visit', 'reserve'];
export const STAGE_TONE: Record<Stage, Tone> = { new: 'neutral', qualified: 'accent2', visit: 'accent', reserve: 'ink' };

export type PersonId = 'carolina' | 'valeria' | 'andres' | 'lucia' | 'diego' | 'tomas' | 'pablo' | 'sofia' | 'martin';
export type PayId = 'cash' | 'credit' | 'sell';
export type BudgetId = 'low' | 'mid' | 'high';

export interface BaseLead {
  id: Exclude<PersonId, 'carolina'>;
  source: Source;
  stage: Stage;
  listing: ListingId;
  budget: BudgetId;
  pay: PayId;
  score: number;
  /** When they first wrote: day + minutes. */
  day: number;
  min: number;
  /** Seconds to the first answer. */
  responseSec: number;
}

const lead = (l: BaseLead) => l;
/** The pipeline at 23:40 (before the story). */
export const BASE_LEADS: BaseLead[] = [
  lead({ id: 'valeria', source: 'portal', stage: 'new', listing: 'ribera', budget: 'high', pay: 'sell', score: 41, day: 3, min: 21 * 60 + 5, responseSec: 7 }),
  lead({ id: 'andres', source: 'whatsapp', stage: 'new', listing: 'loft', budget: 'low', pay: 'credit', score: 38, day: 3, min: 22 * 60 + 15, responseSec: 5 }),
  lead({ id: 'lucia', source: 'web', stage: 'qualified', listing: 'parque', budget: 'mid', pay: 'credit', score: 72, day: 3, min: 13 * 60 + 40, responseSec: 4 }),
  lead({ id: 'diego', source: 'sign', stage: 'qualified', listing: 'colinas', budget: 'high', pay: 'cash', score: 77, day: 2, min: 18 * 60 + 2, responseSec: 9 }),
  lead({ id: 'tomas', source: 'web', stage: 'visit', listing: 'colinas', budget: 'high', pay: 'sell', score: 88, day: 2, min: 8 * 60 + 12, responseSec: 6 }),
  lead({ id: 'pablo', source: 'portal', stage: 'visit', listing: 'ceibo', budget: 'low', pay: 'credit', score: 81, day: 1, min: 23 * 60 + 18, responseSec: 5 }),
  lead({ id: 'sofia', source: 'whatsapp', stage: 'visit', listing: 'parque', budget: 'mid', pay: 'cash', score: 84, day: 1, min: 10 * 60 + 30, responseSec: 3 }),
  lead({ id: 'martin', source: 'web', stage: 'reserve', listing: 'ribera', budget: 'high', pay: 'cash', score: 95, day: 0, min: 19 * 60 + 40, responseSec: 6 }),
];

/* ------------------------------------------------------------------ */
/* CRM: owners, contact details, roles and tasks (lote 3.6, Contact)    */
/* ------------------------------------------------------------------ */
/** Who owns each contact (an advisor sees their own). Carolina's 23:40 inquiry goes to Julia, like her visit. */
export const LEAD_ADVISOR: Record<PersonId, AdvisorId> = {
  carolina: 'julia',
  valeria: 'julia',
  andres: 'marcos',
  lucia: 'marcos',
  diego: 'julia',
  tomas: 'julia',
  pablo: 'marcos',
  sofia: 'marcos',
  martin: 'julia',
};
/** The visitor's own lead (their site chat) is assigned like Marcos's visits. */
export const OWN_ADVISOR: AdvisorId = 'marcos';

/** Fictional phone numbers (the 5550 range, never a real line). Emails use the `.demo` domain. */
export const CONTACT_PHONE: Record<PersonId | 'you', string> = {
  carolina: '+54 9 11 5550-0142',
  valeria: '+54 9 11 5550-0187',
  andres: '+54 9 11 5550-0119',
  lucia: '+54 9 11 5550-0163',
  diego: '+54 9 11 5550-0128',
  tomas: '+54 9 11 5550-0175',
  pablo: '+54 9 11 5550-0131',
  sofia: '+54 9 11 5550-0156',
  martin: '+54 9 11 5550-0194',
  you: '+54 9 11 5550-0100',
};

/** Basic roles (Contact): the owner administers; an advisor works their own contacts. */
export type Role = 'admin' | 'advisor';
export const ROLE_OF: Record<AdvisorId, Role> = { julia: 'admin', marcos: 'advisor' };
export type Permission = 'seeAll' | 'reassign' | 'listings' | 'site' | 'users' | 'export';
export const PERMISSIONS: Permission[] = ['seeAll', 'reassign', 'listings', 'site', 'users', 'export'];
/** true · false · 'own' (only their own contacts). */
export const ROLE_CAN: Record<Role, Record<Permission, boolean | 'own'>> = {
  admin: { seeAll: true, reassign: true, listings: true, site: true, users: true, export: true },
  advisor: { seeAll: 'own', reassign: false, listings: true, site: false, users: false, export: false },
};

export type TaskKind = 'call' | 'send' | 'confirm' | 'docs';
export const TASK_KINDS: TaskKind[] = ['call', 'send', 'confirm', 'docs'];
export interface BaseTask {
  id: string;
  kind: TaskKind;
  person: PersonId | 'you';
  /** The listing it is about (e.g. the one to send). */
  listing: ListingId;
  day: number;
  min: number;
  advisor: AdvisorId;
}
/** The open tasks at 23:40 (the CRM's to-do list for the next days). */
export const BASE_TASKS: BaseTask[] = [
  { id: 't-valeria', kind: 'call', person: 'valeria', listing: 'ribera', day: 4, min: 570, advisor: 'julia' },
  { id: 't-andres', kind: 'send', person: 'andres', listing: 'loft', day: 4, min: 600, advisor: 'marcos' },
  { id: 't-tomas', kind: 'call', person: 'tomas', listing: 'colinas', day: 4, min: 720, advisor: 'julia' },
  { id: 't-pablo', kind: 'confirm', person: 'pablo', listing: 'ceibo', day: 4, min: 840, advisor: 'marcos' },
  { id: 't-diego', kind: 'docs', person: 'diego', listing: 'colinas', day: 5, min: 600, advisor: 'julia' },
  { id: 't-martin', kind: 'docs', person: 'martin', listing: 'ribera', day: 7, min: 540, advisor: 'julia' },
  { id: 't-lucia', kind: 'confirm', person: 'lucia', listing: 'parque', day: 7, min: 900, advisor: 'marcos' },
];

/* ------------------------------------------------------------------ */
/* Visits (calendar: Fri 9, Sat 10, Mon 12; 10:00 → 20:00)              */
/* ------------------------------------------------------------------ */
/** Days with hand-written visits (the site offers them too); other days are generated (see story.ts). */
export const CAL_DAYS = [4, 5, 7] as const;
/** The agency shows homes Monday to Saturday (Saturdays until 14:00). */
export const isOpenDay = (weekday: number) => weekday < 6;
export const dayEndFor = (weekday: number) => (weekday === 5 ? 840 : 1200);
export const CAL_START = 600;
export const CAL_END = 1200;
export const CAL_STEP = 30;
export const VISIT_MIN = 60;

export type VisitWhat = 'visit' | 'appraisal' | 'openHouse' | 'signing';
export interface BaseVisit {
  id: string;
  day: number;
  start: number;
  end: number;
  what: VisitWhat;
  who?: PersonId;
  listing: ListingId;
  advisor: AdvisorId;
}
/** People who visit on generated days. */
export const VISITORS: PersonId[] = ['valeria', 'andres', 'lucia', 'diego', 'tomas', 'pablo', 'sofia', 'martin'];
export const BASE_VISITS: BaseVisit[] = [
  { id: 'v-tomas', day: 4, start: 630, end: 690, what: 'visit', who: 'tomas', listing: 'colinas', advisor: 'julia' },
  { id: 'v-appraisal', day: 4, start: 780, end: 840, what: 'appraisal', listing: 'loft', advisor: 'marcos' },
  { id: 'v-pablo', day: 4, start: 960, end: 1020, what: 'visit', who: 'pablo', listing: 'ceibo', advisor: 'marcos' },
  { id: 'v-open', day: 5, start: 600, end: 660, what: 'openHouse', listing: 'loft', advisor: 'julia' },
  { id: 'v-sofia', day: 5, start: 720, end: 780, what: 'visit', who: 'sofia', listing: 'parque', advisor: 'marcos' },
  { id: 'v-martin', day: 7, start: 600, end: 660, what: 'signing', who: 'martin', listing: 'ribera', advisor: 'julia' },
  { id: 'v-lucia', day: 7, start: 1050, end: 1110, what: 'visit', who: 'lucia', listing: 'parque', advisor: 'marcos' },
];

/** The two slots the assistant offers in the chat (held for the live conversation). */
export type SlotId = 'fri' | 'sat';
export const CHAT_SLOTS: Record<SlotId, { day: number; start: number }> = {
  fri: { day: 4, start: 1110 },
  sat: { day: 5, start: 660 },
};
/** Times the site's "Book a visit" offers per day (only the free ones show). */
export const SITE_TIMES: Record<number, number[]> = {
  4: [720, 870, 1020],
  5: [810, 900, 960],
  7: [690, 900, 1140],
};

/* ------------------------------------------------------------------ */
/* The week in numbers (before the story)                               */
/* ------------------------------------------------------------------ */
/** Inquiries this week by source; all of them answered in under a minute (the vertical's key number). */
export const WEEK_BY_SOURCE: Record<Source, number> = { web: 18, whatsapp: 15, portal: 10, sign: 4 };
export const WEEK = {
  /** Of the inquiries above, how many arrived with the office closed. */
  afterHours: 19,
  /** Average first answer, seconds. */
  avgSec: 6,
  visits: 14,
  reserves: 2,
  followups: 31,
  followReplyPct: 0.68,
};
/** Inquiries per day this week (Mon → Thu) before the live one. */
export const WEEK_BY_DAY = [11, 13, 9, 14] as const;

/* ------------------------------------------------------------------ */
/* The story: five beats the visitor plays (no autoplay)                */
/* ------------------------------------------------------------------ */
/**
 * Story times (ms). Nothing runs on its own: each beat is a segment the visitor plays from the
 * SimBar; the clock stops at the beat's `at`, always on a calm frame (no toast, typing or
 * "just now" halo left). Carolina's answers are scripted at fixed times *inside* the beats
 * (see INQUIRY in story.ts); the visitor can answer for her at rest instead.
 */
export const STORY = {
  /** The buyer opens the site's chat. */
  chatOpen: 600,
  /** Chat time 0: the inquiry is sent (23:40). */
  chatStart: 1200,
  /** Bot on: after the visit is booked, the night skips to just after the visit (beat "followup"). */
  timelapse: 20_000,
  timelapseAfterBooking: 1800,
  /** The WhatsApp follow-up starts this long after the jump. */
  follow: 500,
  /** Buyer's phone: the push becomes the WhatsApp thread. */
  openThread: 1700,
  /** Bot off: the night fast-forwards to 9:00 (beat 2) and the first human answer is at 9:12 (beat 3). */
  off: { from: 6000, to: 9000, human: 13_000 },
} as const;

/** The SimBar's beats (labels: demoRealEstate.sim.<id>, or sim.off.<id> with the assistant off). */
export const BEATS = [
  { id: 'inquiry', at: 5_800 },
  { id: 'qualify', at: 12_800 },
  { id: 'visit', at: 19_500 },
  { id: 'followup', at: 24_500 },
  { id: 'reply', at: 30_500 },
] as const;
export const STORY_END = BEATS[BEATS.length - 1].at;
export type EstateBeatId = (typeof BEATS)[number]['id'];

/* ------------------------------------------------------------------ */
/* Where each beat happens (v3c: a simulation takes every view there)   */
/* ------------------------------------------------------------------ */
/** Sections of the agency's workspace (laptop) and app (phone alone; "site" is the buyer button there). */
export type EstateTab = 'today' | 'inbox' | 'contacts' | 'pipeline' | 'visits' | 'tasks' | 'followups' | 'listings' | 'site' | 'brand' | 'team';
/** Elements a beat brings into view inside its section (see real-estate/focus.ts). */
export type EstateSpot = 'transcript' | 'chat' | 'key' | 'calendar' | 'preview' | 'card';
export interface EstateBeatTarget {
  tab: Exclude<EstateTab, 'site' | 'listings'>;
  spot: EstateSpot;
}
/** What Carolina's phone (next to the laptop) shows when the beat lands: the site with Lumi's chat, or WhatsApp. */
export type BuyerTarget = 'chat' | 'whatsapp';
export interface EstateBeatFocus {
  laptop: EstateBeatTarget;
  /** The agency's app (phone alone): the buyer view closes, the section opens. */
  phone: EstateBeatTarget;
  /** Carolina's phone: a beat drops the visitor's detours (closed chat, back to the site) and the story drives it. */
  buyer: BuyerTarget;
}

const go = (tab: EstateBeatTarget['tab'], spot: EstateSpot): EstateBeatTarget => ({ tab, spot });
const INBOX = go('inbox', 'transcript');
const CHAT = go('inbox', 'chat');

/**
 * Per beat and variant (`on`: the 24/7 assistant answers; `off`: nobody does until the office
 * opens), the screen where the action is legible. Laptop: the conversation while Lumi talks
 * (transcript + lead file), the visit landing in the calendar, the WhatsApp follow-up, and the
 * card reaching Reserve (or lost) in the pipeline; without the assistant, the key number while the
 * night passes unanswered. The phone app is the conversation itself (the WhatsApp thread from the
 * follow-up on), so every step shows in the chat; without the assistant, the key number too.
 */
export const BEAT_FOCUS: Record<EstateBeatId, Record<'on' | 'off', EstateBeatFocus>> = {
  inquiry: {
    on: { laptop: INBOX, phone: CHAT, buyer: 'chat' },
    off: { laptop: INBOX, phone: CHAT, buyer: 'chat' },
  },
  qualify: {
    on: { laptop: INBOX, phone: CHAT, buyer: 'chat' },
    off: { laptop: go('today', 'key'), phone: go('today', 'key'), buyer: 'chat' },
  },
  visit: {
    on: { laptop: go('visits', 'calendar'), phone: CHAT, buyer: 'chat' },
    off: { laptop: INBOX, phone: CHAT, buyer: 'chat' },
  },
  followup: {
    on: { laptop: go('followups', 'preview'), phone: CHAT, buyer: 'whatsapp' },
    off: { laptop: INBOX, phone: CHAT, buyer: 'chat' },
  },
  reply: {
    on: { laptop: go('pipeline', 'card'), phone: CHAT, buyer: 'whatsapp' },
    off: { laptop: go('pipeline', 'card'), phone: CHAT, buyer: 'chat' },
  },
};

/** Story clock start: Thursday 23:40. */
export const CLOCK_START = { day: TODAY, min: 23 * 60 + 40 };
/** Office opening (bot off: first human answer is at 9:12). */
export const OFFICE_OPENS = { day: 4, min: 9 * 60 };
export const HUMAN_REPLY_MIN = 9 * 60 + 12;
/** Seconds the assistant took to answer each of its messages (shown under the bubble). */
export const BOT_SECONDS: Record<string, number> = { hi: 4, pay: 2, budget: 3, fits: 5, alt: 6, slots: 3, booked: 4 };

/* ------------------------------------------------------------------ */
/* Brand setup (lote 3.6: the `setup_brand` deliverables Contact includes) */
/* ------------------------------------------------------------------ */
/** What the setup delivered, in order (copy: brand.items.<id>). */
export const BRAND_DELIVERABLES = ['diagnosis', 'identity', 'site', 'profiles', 'library', 'guide'] as const;
/** Lumen's palette as the brand kit shows it (the demo's own theme colors). */
export const BRAND_SWATCHES = [
  { id: 'stone', hex: LUMEN_THEME.bg },
  { id: 'ink', hex: LUMEN_THEME.ink },
  { id: 'cobalt', hex: LUMEN_THEME.accent },
  { id: 'sand', hex: LUMEN_THEME.accent2 },
] as const;
/** The product's base template before the setup (neutral greys: what any agency gets out of the box). */
export const BRAND_BASE = {
  bg: '#F2F2F2',
  surface: '#FFFFFF',
  ink: '#2A2A2A',
  muted: '#6E6E6E',
  accent: '#4A4A4A',
  accentInk: '#FFFFFF',
  line: 'rgb(0 0 0 / 0.12)',
} as const;
/** The two profiles audited (copy: brand.profile.<id>.<item>.before|after). */
export const PROFILE_ITEMS = ['bio', 'cover', 'highlights', 'cta'] as const;
/** 12 hooks (copy: brand.hook.<id>), each with its theme. */
export const BRAND_HOOKS = [
  { id: 'h1', tag: 'buy' },
  { id: 'h2', tag: 'buy' },
  { id: 'h3', tag: 'sell' },
  { id: 'h4', tag: 'sell' },
  { id: 'h5', tag: 'credit' },
  { id: 'h6', tag: 'credit' },
  { id: 'h7', tag: 'zone' },
  { id: 'h8', tag: 'zone' },
  { id: 'h9', tag: 'visit' },
  { id: 'h10', tag: 'visit' },
  { id: 'h11', tag: 'team' },
  { id: 'h12', tag: 'team' },
] as const;
/** 6 example videos (copy: brand.video.<id>.title|a|b|c): reusable examples, not exclusive ads. */
export const BRAND_VIDEOS: { id: string; listing: ListingId; seconds: number; format: 'vertical' | 'square' }[] = [
  { id: 'v1', listing: 'olmos', seconds: 20, format: 'vertical' },
  { id: 'v2', listing: 'ceibo', seconds: 15, format: 'vertical' },
  { id: 'v3', listing: 'parque', seconds: 25, format: 'square' },
  { id: 'v4', listing: 'colinas', seconds: 30, format: 'vertical' },
  { id: 'v5', listing: 'loft', seconds: 15, format: 'square' },
  { id: 'v6', listing: 'ribera', seconds: 20, format: 'vertical' },
];
/** The operating guide's chapters (copy: brand.chapters.<id>). */
export const GUIDE_CHAPTERS = ['inquiry', 'listing', 'pipeline', 'visits', 'tasks', 'publish'] as const;
