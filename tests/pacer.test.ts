import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createPacer } from '@/components/demos/kit/pacer';
import { PACE, type PaceItem } from '@/components/demos/kit/pace';

const bot = (id: string, length = 60): PaceItem => ({ id, from: 'bot', length, typeable: true });
const user = (id: string): PaceItem => ({ id, from: 'user', length: 8, typeable: true });

describe('the pacer (real time)', () => {
  let t = 0;
  beforeEach(() => {
    vi.useFakeTimers();
    t = 0;
  });
  afterEach(() => vi.useRealTimers());
  const advance = (ms: number) => {
    t += ms;
    vi.advanceTimersByTime(ms);
  };

  it('a conversation shown for the first time appears whole', () => {
    const p = createPacer(() => t);
    p.sync([bot('hi'), user('r'), bot('pay')], false, false);
    expect(p.getSnapshot().done.size).toBe(3);
    expect(p.getSnapshot().busy).toBe(false);
  });

  it('while someone watches, a new answer thinks, writes and lands; listeners hear each step', () => {
    const p = createPacer(() => t);
    p.sync([bot('hi')], false, false);
    const heard = vi.fn();
    p.subscribe(heard);
    p.sync([bot('hi'), user('r'), bot('answer', 90)], false, false);
    expect(p.getSnapshot().thinking).toBe('answer');
    expect(p.getSnapshot().done.has('r')).toBe(true);
    advance(PACE.thinkMax + 10);
    expect(p.getSnapshot().thinking).toBeNull();
    expect(p.getSnapshot().writing?.id).toBe('answer');
    advance(5000);
    expect(p.getSnapshot().done.has('answer')).toBe(true);
    expect(p.getSnapshot().busy).toBe(false);
    expect(heard.mock.calls.length).toBeGreaterThan(3);
  });

  it('what happened while nobody watched is history: it shows at once', () => {
    const p = createPacer(() => t);
    const off = p.subscribe(() => {});
    p.sync([bot('hi')], false, false);
    off();
    p.sync([bot('hi'), user('r'), bot('answer')], false, false);
    expect(p.getSnapshot().done.has('answer')).toBe(true);
    expect(p.getSnapshot().thinking).toBeNull();
  });

  it('a tap shows the answer being written', () => {
    const p = createPacer(() => t);
    p.sync([], false, false);
    p.subscribe(() => {});
    p.sync([bot('long', 300)], false, false);
    advance(PACE.thinkMax + 10);
    expect(p.getSnapshot().writing?.id).toBe('long');
    p.skip();
    expect(p.getSnapshot().done.has('long')).toBe(true);
  });

  it('with reduced motion the answer waits, then appears whole (never written)', () => {
    const p = createPacer(() => t);
    p.sync([], false, true);
    p.subscribe(() => {});
    p.sync([bot('a', 200)], false, true);
    expect(p.getSnapshot().thinking).toBe('a');
    advance(PACE.thinkMax + 10);
    expect(p.getSnapshot().writing).toBeNull();
    expect(p.getSnapshot().done.has('a')).toBe(true);
  });

  it('an answer the story already showed being typed does not think again', () => {
    const p = createPacer(() => t);
    p.sync([user('ask')], false, false);
    p.subscribe(() => {});
    p.sync([user('ask')], true, false);
    p.sync([user('ask'), bot('hi')], false, false);
    expect(p.getSnapshot().thinking).toBeNull();
    expect(p.getSnapshot().writing?.id).toBe('hi');
  });
});
