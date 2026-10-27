import { Fragment, isValidElement, type ReactNode } from 'react';

/**
 * Timing of the premium interaction standard (D34, guía de motion §12). Pure and deterministic:
 * the same message always gets the same delays, so two views of one story (desktop + phone) stay in
 * step, while consecutive messages differ ("never identical twice in a row") and every wait has a
 * ceiling.
 *
 * - Thinking: 1.2–2.5 s, longer for longer answers.
 * - Writing: 30–45 characters per second; a tap shows the whole answer.
 * - Loading: up to 600 ms of skeleton.
 * - Optimistic action: the change shows at once; its confirmation stays 3–4 s.
 * - Success glint: 600–900 ms, once.
 */
export const PACE = {
  thinkMin: 1200,
  thinkMax: 2500,
  /** Two consecutive thinking times differ at least this much. */
  thinkStep: 160,
  cpsMin: 30,
  cpsMax: 45,
  /** A note (system line) after a message: a short beat, no thinking. */
  noteMs: 350,
  /** A non-text answer (a card on its own) is uncovered in this time. */
  revealMs: 520,
  loadMax: 600,
  /** The confirmation lands this long after the optimistic change (400–700 ms). */
  confirmDelay: 450,
  confirmMs: 3600,
  glintMs: 760,
} as const;

/** Small stable hash (FNV-1a) of a string → 0 … 2^32 − 1. */
export function hash(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

/** 0 … 1 from a string, stable. */
const unit = (s: string) => hash(s) / 0xffffffff;

/**
 * How long the assistant "thinks" before answering `id` (`length`: characters of the answer).
 * Grows with the answer, varies per message and never equals `prev` (the previous thinking time) within
 * `thinkStep`: if it would, it moves away from it, staying inside 1.2–2.5 s.
 */
export function thinkMs(id: string, length: number, prev: number | null = null): number {
  const { thinkMin, thinkMax, thinkStep } = PACE;
  const base = thinkMin + Math.min(1, Math.max(0, length) / 220) * (thinkMax - thinkMin - 400);
  const jitter = (unit(`think:${id}`) - 0.5) * 500;
  let ms = Math.round(Math.min(thinkMax, Math.max(thinkMin, base + jitter)));
  if (prev !== null && Math.abs(ms - prev) < thinkStep) {
    const up = prev + thinkStep;
    const down = prev - thinkStep;
    ms = up <= thinkMax && (ms >= prev || down < thinkMin) ? up : down;
  }
  return ms;
}

/** Writing speed for message `id`: 30–45 characters per second. */
export function typeCps(id: string): number {
  const { cpsMin, cpsMax } = PACE;
  return Math.round(cpsMin + unit(`type:${id}`) * (cpsMax - cpsMin));
}

/** How long writing `length` characters takes for message `id` (ms). */
export const typeMs = (id: string, length: number): number => Math.round((Math.max(0, length) / typeCps(id)) * 1000);

/** Characters shown `elapsed` ms into writing message `id` of `length` characters. */
export function typedChars(id: string, length: number, elapsed: number): number {
  if (elapsed <= 0) return 0;
  return Math.min(length, Math.floor((elapsed / 1000) * typeCps(id)));
}

/**
 * Splits a message into the text that is written character by character and what appears at the end
 * (e.g. an "IA · 4 s" tag after the sentence). A plain string, or a fragment that starts with strings.
 * Null: the message is not text (a card, an icon…), so it is uncovered at once instead of written.
 */
export function splitTypeable(node: ReactNode): { text: string; tail: ReactNode[] } | null {
  if (typeof node === 'string') return node ? { text: node, tail: [] } : null;
  if (typeof node === 'number') return { text: String(node), tail: [] };
  if (!isValidElement(node) || node.type !== Fragment) return null;
  const children = ([] as ReactNode[]).concat((node.props as { children?: ReactNode }).children ?? []);
  let text = '';
  let i = 0;
  for (; i < children.length; i++) {
    const c = children[i];
    if (typeof c === 'string' || typeof c === 'number') text += String(c);
    else if (c === null || c === undefined || c === false) continue;
    else break;
  }
  if (!text) return null;
  return { text, tail: children.slice(i) };
}

/** Length used to size the thinking time of any message (text length, or a nominal one for cards). */
export function messageLength(node: ReactNode): number {
  const split = splitTypeable(node);
  return split ? split.text.length : 60;
}

/* ------------------------------------------------------------------ */
/* Delivery schedule (pure): when each new message thinks, writes, ends  */
/* ------------------------------------------------------------------ */
export interface PaceItem {
  id: string;
  from: 'bot' | 'user' | 'note';
  /** Characters of the answer (sizes thinking and writing). */
  length: number;
  /** Written character by character (text) or uncovered at once (cards…). */
  typeable: boolean;
}

export interface PaceEntry {
  id: string;
  from: PaceItem['from'];
  length: number;
  typeable: boolean;
  /** Wall-clock times (ms): thinking starts, writing starts, the message is complete. */
  thinkAt: number;
  writeAt: number;
  endAt: number;
}

export interface Schedule {
  entries: PaceEntry[];
  /** The last thinking time given (so the next one differs). */
  prevThink: number | null;
}

export const EMPTY_SCHEDULE: Schedule = { entries: [], prevThink: null };

export interface ScheduleOptions {
  /** The story already showed this answer being typed (beats): no extra thinking before it. */
  alreadyTyped?: boolean;
  /** Reduced motion: same waits, but the answer appears whole (no writing). */
  reduced?: boolean;
}

/**
 * Adds the messages of `items` that the schedule doesn't know yet, in order, each after the previous one
 * ends (one waiting state at a time). On the first call (`prev` empty and `initial`), everything already
 * there is delivered at once: a chat that mounts shows its history, it doesn't replay it. If a known
 * message disappeared (the story restarted), the schedule starts over the same way.
 */
export function schedule(prev: Schedule, items: readonly PaceItem[], now: number, options: ScheduleOptions & { initial?: boolean } = {}): Schedule {
  const ids = new Set(items.map((i) => i.id));
  const restarted = prev.entries.some((e) => !ids.has(e.id));
  if (options.initial || restarted) {
    return {
      entries: items.map((i) => ({ id: i.id, from: i.from, length: i.length, typeable: i.typeable, thinkAt: -Infinity, writeAt: -Infinity, endAt: -Infinity })),
      prevThink: restarted ? null : prev.prevThink,
    };
  }
  const known = new Set(prev.entries.map((e) => e.id));
  const fresh = items.filter((i) => !known.has(i.id));
  if (!fresh.length) return prev;
  const entries = [...prev.entries];
  let prevThink = prev.prevThink;
  let cursor = Math.max(now, entries.length ? entries[entries.length - 1].endAt : -Infinity);
  let typedOnce = !!options.alreadyTyped;
  for (const item of fresh) {
    let think = 0;
    let write = 0;
    if (item.from === 'bot') {
      if (!typedOnce) {
        think = thinkMs(item.id, item.length, prevThink);
        prevThink = think;
      }
      typedOnce = false;
      write = options.reduced ? 0 : item.typeable ? typeMs(item.id, item.length) : PACE.revealMs;
    } else if (item.from === 'note') {
      think = PACE.noteMs;
    }
    const thinkAt = cursor;
    const writeAt = thinkAt + think;
    const endAt = writeAt + write;
    entries.push({ id: item.id, from: item.from, length: item.length, typeable: item.typeable, thinkAt, writeAt, endAt });
    cursor = endAt;
  }
  return { entries, prevThink };
}

export interface PaceView {
  /** Messages shown whole. */
  done: Set<string>;
  /** The assistant is thinking before this message (null: nobody is). */
  thinking: string | null;
  /** The message being written and how much of it shows. */
  writing: { id: string; chars: number; length: number; typeable: boolean; progress: number } | null;
  /** Something is still on its way (hide quick replies until it lands). */
  busy: boolean;
  /** When the view changes next (ms, wall clock), or null when everything landed. */
  nextAt: number | null;
}

/** What shows at wall-clock time `now`. Only one waiting state at a time: the first entry not yet complete. */
export function paceAt(s: Schedule, now: number): PaceView {
  const done = new Set<string>();
  for (const e of s.entries) {
    if (e.endAt <= now) {
      done.add(e.id);
      continue;
    }
    if (now < e.writeAt) {
      // A note's short beat is a wait, not "thinking".
      return { done, thinking: e.from === 'bot' ? e.id : null, writing: null, busy: true, nextAt: e.writeAt };
    }
    const span = Math.max(1, e.endAt - e.writeAt);
    const progress = Math.min(1, (now - e.writeAt) / span);
    const chars = e.typeable ? typedChars(e.id, e.length, now - e.writeAt) : 0;
    return { done, thinking: null, writing: { id: e.id, chars, length: e.length, typeable: e.typeable, progress }, busy: true, nextAt: e.endAt };
  }
  return { done, thinking: null, writing: null, busy: false, nextAt: null };
}

/**
 * «Tocá para verlo completo»: the message being written (or uncovered) ends now, and everything queued
 * after it moves earlier by the time saved. Thinking can't be skipped (it is the wait the answer takes).
 */
export function skipWriting(s: Schedule, now: number): Schedule {
  const i = s.entries.findIndex((e) => e.endAt > now);
  if (i < 0) return s;
  const cur = s.entries[i];
  if (now < cur.writeAt) return s;
  const saved = cur.endAt - now;
  return {
    ...s,
    entries: s.entries.map((e, j) => (j < i ? e : j === i ? { ...e, endAt: now } : { ...e, thinkAt: e.thinkAt - saved, writeAt: e.writeAt - saved, endAt: e.endAt - saved })),
  };
}
