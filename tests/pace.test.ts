import { createElement, Fragment } from 'react';
import { describe, expect, it } from 'vitest';
import {
  EMPTY_SCHEDULE,
  PACE,
  paceAt,
  schedule,
  skipWriting,
  splitTypeable,
  thinkMs,
  typeCps,
  typedChars,
  type PaceItem,
} from '@/components/demos/kit/pace';

const bot = (id: string, length = 80, typeable = true): PaceItem => ({ id, from: 'bot', length, typeable });
const user = (id: string): PaceItem => ({ id, from: 'user', length: 10, typeable: true });
const note = (id: string): PaceItem => ({ id, from: 'note', length: 30, typeable: true });

describe('thinking time (D34: 1.2–2.5 s, never the same twice in a row)', () => {
  it('stays between 1.2 and 2.5 s for any length', () => {
    for (const len of [0, 1, 40, 120, 400, 5000]) {
      for (const id of ['hi', 'pay', 'budget', 'slots', 'booked', 'x1', 'x2']) {
        const ms = thinkMs(id, len);
        expect(ms).toBeGreaterThanOrEqual(PACE.thinkMin);
        expect(ms).toBeLessThanOrEqual(PACE.thinkMax);
      }
    }
  });

  it('a longer answer thinks longer (same message)', () => {
    expect(thinkMs('m', 200)).toBeGreaterThan(thinkMs('m', 10));
  });

  it('is the same for the same message (two views stay in step)', () => {
    expect(thinkMs('hi', 90)).toBe(thinkMs('hi', 90));
  });

  it('moves away from the previous one when it would repeat it', () => {
    for (let i = 0; i < 200; i++) {
      const prev = thinkMs(`p${i}`, i);
      const ms = thinkMs(`n${i}`, (i * 7) % 300, prev);
      expect(Math.abs(ms - prev)).toBeGreaterThanOrEqual(PACE.thinkStep);
      expect(ms).toBeGreaterThanOrEqual(PACE.thinkMin);
      expect(ms).toBeLessThanOrEqual(PACE.thinkMax);
    }
  });
});

describe('writing speed (30–45 characters per second)', () => {
  it('stays in range and is stable per message', () => {
    for (const id of ['a', 'b', 'c', 'hi', 'booked', 'z9']) {
      expect(typeCps(id)).toBeGreaterThanOrEqual(PACE.cpsMin);
      expect(typeCps(id)).toBeLessThanOrEqual(PACE.cpsMax);
      expect(typeCps(id)).toBe(typeCps(id));
    }
  });

  it('shows nothing before it starts and everything at the end', () => {
    expect(typedChars('a', 100, 0)).toBe(0);
    expect(typedChars('a', 100, 60_000)).toBe(100);
  });
});

describe('the delivery schedule', () => {
  it('a chat that mounts shows its history at once (it never replays it)', () => {
    const s = schedule(EMPTY_SCHEDULE, [bot('hi'), user('r'), bot('pay')], 1000, { initial: true });
    const v = paceAt(s, 1000);
    expect([...v.done]).toEqual(['hi', 'r', 'pay']);
    expect(v.busy).toBe(false);
  });

  it('a new answer thinks, then writes, then lands', () => {
    let s = schedule(EMPTY_SCHEDULE, [bot('hi')], 0, { initial: true });
    s = schedule(s, [bot('hi'), user('pick'), bot('answer', 90)], 1000);
    const picked = paceAt(s, 1000);
    expect(picked.done.has('pick')).toBe(true);
    expect(picked.thinking).toBe('answer');
    const e = s.entries.find((x) => x.id === 'answer')!;
    expect(e.writeAt - e.thinkAt).toBeGreaterThanOrEqual(PACE.thinkMin);
    const mid = paceAt(s, e.writeAt + 500);
    expect(mid.thinking).toBeNull();
    expect(mid.writing?.id).toBe('answer');
    expect(mid.writing!.chars).toBeGreaterThan(0);
    expect(mid.writing!.chars).toBeLessThan(90);
    expect(paceAt(s, e.endAt).done.has('answer')).toBe(true);
    expect(paceAt(s, e.endAt).busy).toBe(false);
  });

  it('one waiting state at a time: a second answer waits for the first to land', () => {
    let s = schedule(EMPTY_SCHEDULE, [], 0, { initial: true });
    s = schedule(s, [bot('a', 60), bot('b', 60), note('n')], 0);
    const [a, b, n] = s.entries;
    expect(b.thinkAt).toBe(a.endAt);
    expect(n.thinkAt).toBe(b.endAt);
    expect(n.writeAt - n.thinkAt).toBe(PACE.noteMs);
    expect(paceAt(s, b.thinkAt + 1).thinking).toBe('b');
    expect(paceAt(s, n.thinkAt + 1).thinking).toBeNull();
  });

  it('an answer the story already typed does not think again', () => {
    let s = schedule(EMPTY_SCHEDULE, [], 0, { initial: true });
    s = schedule(s, [bot('hi', 60)], 500, { alreadyTyped: true });
    expect(s.entries[0].writeAt).toBe(500);
  });

  it('reduced motion keeps the wait but the answer appears whole', () => {
    let s = schedule(EMPTY_SCHEDULE, [], 0, { initial: true });
    s = schedule(s, [bot('a', 120)], 0, { reduced: true });
    const e = s.entries[0];
    expect(e.writeAt).toBeGreaterThanOrEqual(PACE.thinkMin);
    expect(e.endAt).toBe(e.writeAt);
  });

  it('a card on its own is uncovered, not written', () => {
    let s = schedule(EMPTY_SCHEDULE, [], 0, { initial: true });
    s = schedule(s, [bot('card', 60, false)], 0);
    const e = s.entries[0];
    expect(e.endAt - e.writeAt).toBe(PACE.revealMs);
    expect(paceAt(s, e.writeAt + 10).writing?.chars).toBe(0);
  });

  it('a tap shows the whole answer and pulls what follows earlier', () => {
    let s = schedule(EMPTY_SCHEDULE, [], 0, { initial: true });
    s = schedule(s, [bot('a', 200), bot('b', 50)], 0);
    const a = s.entries[0];
    const t = a.writeAt + 300;
    const skipped = skipWriting(s, t);
    expect(paceAt(skipped, t).done.has('a')).toBe(true);
    expect(skipped.entries[1].thinkAt).toBe(t);
    // Thinking can't be skipped.
    expect(skipWriting(s, a.thinkAt + 10)).toBe(s);
  });

  it('a story restart delivers what is there at once', () => {
    let s = schedule(EMPTY_SCHEDULE, [bot('a'), bot('b')], 0, { initial: true });
    s = schedule(s, [bot('x')], 5000);
    expect(paceAt(s, 5000).done.has('x')).toBe(true);
  });
});

describe('what is written character by character', () => {
  it('a string, or the text that opens a fragment (the rest appears at the end)', () => {
    expect(splitTypeable('Hola')).toEqual({ text: 'Hola', tail: [] });
    const tag = createElement('span', { key: 't' }, 'IA · 4 s');
    const split = splitTypeable(createElement(Fragment, null, 'Hola, ', 'Carolina.', tag));
    expect(split?.text).toBe('Hola, Carolina.');
    expect(split?.tail).toHaveLength(1);
  });

  it('a card is not text', () => {
    expect(splitTypeable(createElement('div', null, 'x'))).toBeNull();
    expect(splitTypeable(null)).toBeNull();
  });
});
