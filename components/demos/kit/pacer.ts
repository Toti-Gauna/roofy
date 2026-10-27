import { EMPTY_SCHEDULE, paceAt, schedule, skipWriting, type PaceItem, type PaceView, type Schedule } from './pace';

/**
 * The real-time driver of a paced conversation (lote 3.5b): keeps its schedule (pace.ts), answers what
 * shows now and wakes itself when that changes (every 50 ms only while text is being written). No React:
 * `usePacedChat` subscribes to it; a demo can share one per conversation (`PaceScopeProvider`).
 */
const clock = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());
/** Writing redraws at this rate (only the bubble being written changes). */
const WRITE_FRAME_MS = 50;

export interface Pacer {
  subscribe(listener: () => void): () => void;
  getSnapshot(): PaceView;
  sync(items: readonly PaceItem[], typing: boolean, reduced: boolean): void;
  skip(): void;
  dispose(): void;
}

export function createPacer(now: () => number = clock): Pacer {
  let sched: Schedule = EMPTY_SCHEDULE;
  let started = false;
  let sawTyping = false;
  let reducedNow = false;
  let snap: PaceView = paceAt(EMPTY_SCHEDULE, 0);
  let timer: ReturnType<typeof setTimeout> | undefined;
  const listeners = new Set<() => void>();

  const refresh = () => {
    if (timer !== undefined) clearTimeout(timer);
    timer = undefined;
    const t = now();
    snap = paceAt(sched, t);
    listeners.forEach((l) => l());
    if (snap.nextAt === null) return;
    const writingText = snap.writing?.typeable && !reducedNow;
    const wait = writingText ? Math.min(WRITE_FRAME_MS, snap.nextAt - t) : snap.nextAt - t;
    timer = setTimeout(refresh, Math.max(16, wait));
  };

  return {
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    getSnapshot: () => snap,
    sync(items, typing, reduced) {
      reducedNow = reduced;
      // Nobody was showing this conversation (the visitor was elsewhere while the story went on): what
      // happened meanwhile is history, it shows at once. A view that replaces another in the same commit
      // (the collapsed chat → the full one) still counts as watching: its listener leaves after this runs.
      const unseen = !started || listeners.size === 0;
      const next = schedule(sched, items, now(), { initial: unseen, alreadyTyped: sawTyping, reduced });
      started = true;
      // The story's "typing" covers the next answer only; once it lands, later ones think on their own.
      if (next !== sched) sawTyping = typing;
      else if (typing) sawTyping = true;
      if (next === sched) return;
      sched = next;
      refresh();
    },
    skip() {
      const next = skipWriting(sched, now());
      if (next === sched) return;
      sched = next;
      refresh();
    },
    dispose() {
      if (timer !== undefined) clearTimeout(timer);
      timer = undefined;
      listeners.clear();
    },
  };
}

