'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react';
import { useTranslations } from 'next-intl';
import { CircleAlert, Undo2, type LucideIcon } from 'lucide-react';
import { useReducedMotion } from '@/components/motion/useReducedMotion';
import { PACE, messageLength, splitTypeable, type PaceItem, type PaceView } from './pace';
import { createPacer, type Pacer } from './pacer';
import type { ChatItem, ChatRun } from './ChatWidget';
import './interaction.css';

/**
 * Premium interaction kit (lote 3.5b, D34 — guía de motion §12). Every state answers something the
 * visitor did; nothing starts by itself. One waiting state at a time; waits vary but have a ceiling;
 * reduced motion keeps the states without pulse or movement; no wait ever blocks leaving, going back or
 * switching areas (all of it is local to the component that shows it).
 *
 * - Chat: `usePacedChat` (thinking → writing → done), `ThinkingBubble`, `WrittenText` (ChatWidget uses them).
 * - `Seal`: «Demostración guionada» / «Llamada simulada» on the assistant and the agent.
 * - `ConfirmProvider` + `useConfirm()` + `<ConfirmToast />`: the optimistic change shows at once and a short
 *   notice confirms it, with «Deshacer» when it can be undone.
 * - `Glint`: the diamond-ring sparkle, once, on an important success.
 * - `Skeleton` + `useSimulatedLoad`: a skeleton with the final shape, up to 600 ms.
 * - `SimError`: a clear message with how to go on (never a technical error).
 * - `EmptyState`: one line that says what to do, with the action at hand.
 */

/* ------------------------------------------------------------------ */
/* Chat pacing                                                          */
/* ------------------------------------------------------------------ */
const toPaceItem = (item: ChatItem): PaceItem => ({
  id: item.id,
  from: item.from,
  length: messageLength(item.text),
  typeable: !!splitTypeable(item.text),
});

/**
 * Where a paced conversation lives. A demo provides its store (any object shared by its views) and each
 * chat names its conversation (`paceKey`): every view and every remount of that conversation then shares
 * one pacer, so the desktop and the phone show the same wait, and a chat that opens right after the
 * visitor answered (the collapsed chat → the full one) still thinks before answering.
 */
const PaceScope = createContext<object | null>(null);
export const PaceScopeProvider = PaceScope.Provider;
const registries = new WeakMap<object, Map<string, Pacer>>();

function sharedPacer(scope: object, key: string): Pacer {
  let reg = registries.get(scope);
  if (!reg) {
    reg = new Map();
    registries.set(scope, reg);
  }
  let pacer = reg.get(key);
  if (!pacer) {
    pacer = createPacer();
    reg.set(key, pacer);
  }
  return pacer;
}

export interface PacedChat {
  /** Is this item shown (whole, or being written)? */
  shows: (item: ChatItem) => boolean;
  /** The item being written and how far (null: none). */
  writing: PaceView['writing'];
  /** The assistant is thinking (paced answer, or the story's own typing). */
  thinking: boolean;
  /** Something is on its way: hold the quick replies. */
  busy: boolean;
  /** «Tocá para verla completa». */
  skip: () => void;
}

/**
 * Paces a chat run in real time (D34): an answer that arrives at once (the visitor tapped a reply, the
 * story clock is stopped) thinks 1.2–2.5 s, then writes at 30–45 characters per second; one answer at a
 * time. What a conversation already had the first time it showed appears at once. With `key` (inside a
 * `PaceScopeProvider`) the pacing is shared by every view of that conversation. `enabled: false` shows the
 * run as it is.
 */
export function usePacedChat(run: ChatRun, enabled = true, key?: string): PacedChat {
  const reduced = useReducedMotion();
  const scope = useContext(PaceScope);
  const [own] = useState(createPacer);
  const pacer = scope && key ? sharedPacer(scope, key) : own;
  const items = useMemo(() => run.items.map(toPaceItem), [run.items]);
  useLayoutEffect(() => {
    if (enabled) pacer.sync(items, run.typing, reduced);
  }, [pacer, items, run.typing, reduced, enabled]);
  // A chat's own pacer ends with it; a shared one outlives any single view.
  useEffect(() => () => own.dispose(), [own]);
  const view = useSyncExternalStore(pacer.subscribe, pacer.getSnapshot, pacer.getSnapshot);

  if (!enabled) return { shows: () => true, writing: null, thinking: run.typing, busy: false, skip: () => {} };
  return {
    shows: (item) => view.done.has(item.id) || view.writing?.id === item.id,
    writing: view.writing,
    thinking: !!view.thinking || (run.typing && !view.busy),
    busy: view.busy,
    skip: pacer.skip,
  };
}

/**
 * «Pensando la respuesta…» with a soft pulse (scale 0.96–1 and opacity, never a bounce) next to the
 * assistant's mark. Reduced motion: «Pensando…», still.
 */
export function ThinkingBubble({ name, className = '' }: { name: string; className?: string }) {
  const t = useTranslations('demoKit.pace');
  const reduced = useReducedMotion();
  return (
    <span className={`demo-think ${className}`} role="status" aria-label={t('thinkingLabel', { name })}>
      <span aria-hidden className="demo-think-orb" />
      <span aria-hidden className="demo-think-text">
        {reduced ? t('thinkingShort') : t('thinking')}
      </span>
    </span>
  );
}

/**
 * A message being written: the text appears character by character (the rest of the message, e.g. its
 * "IA · 4 s" tag, at the end); a card on its own is uncovered instead. The whole bubble is a button:
 * a tap (or Enter) shows the complete answer. Screen readers get the message once it is complete.
 */
export function WrittenText({
  text,
  chars,
  progress,
  typeable,
  onSkip,
}: {
  text: ReactNode;
  chars: number;
  progress: number;
  /** false: uncover `text` (a card…) instead of writing it. */
  typeable: boolean;
  onSkip: () => void;
}) {
  const t = useTranslations('demoKit.pace');
  const split = typeable ? splitTypeable(text) : null;
  return (
    <button type="button" className="demo-write" onClick={onSkip} aria-label={t('skip')}>
      {split ? (
        <span aria-hidden className="demo-write-text">
          {split.text.slice(0, chars)}
          <span className="demo-write-caret" />
        </span>
      ) : (
        <span aria-hidden className="demo-write-reveal" style={{ clipPath: `inset(0 ${Math.round((1 - progress) * 100)}% 0 0)` }}>
          {text}
        </span>
      )}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Seal                                                                 */
/* ------------------------------------------------------------------ */
/** The assistant's and the agent's seal (always visible on them): «Demostración guionada» / «Llamada simulada». */
export function Seal({ kind, className = '' }: { kind: 'scripted' | 'simulatedCall'; className?: string }) {
  const t = useTranslations('demoKit.seal');
  return <span className={`demo-seal ${className}`}>{t(kind)}</span>;
}

/* ------------------------------------------------------------------ */
/* Optimistic action → confirmation (with undo)                         */
/* ------------------------------------------------------------------ */
export interface ConfirmNotice {
  /** «Visita agendada · Vie 18:30». */
  text: string;
  /** Undo, when the action can be undone. */
  undo?: () => void;
  icon?: LucideIcon;
  /** The change was already announced elsewhere (e.g. the board's own live region): show it, don't repeat it. */
  silent?: boolean;
}

interface ConfirmState extends ConfirmNotice {
  key: number;
}

interface ConfirmApi {
  notice: ConfirmState | null;
  confirm: (notice: ConfirmNotice) => void;
  dismiss: () => void;
}

const ConfirmCtx = createContext<ConfirmApi>({ notice: null, confirm: () => {}, dismiss: () => {} });

/** One confirmation at a time per view (a new one replaces the previous). Wrap each demo screen. */
export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [notice, setNotice] = useState<ConfirmState | null>(null);
  const seq = useRef(0);
  const pending = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  // The change already shows (optimistic); its confirmation lands a beat later (400–700 ms).
  const confirm = useCallback((n: ConfirmNotice) => {
    clearTimeout(pending.current);
    const key = ++seq.current;
    pending.current = setTimeout(() => setNotice({ ...n, key }), PACE.confirmDelay);
  }, []);
  const dismiss = useCallback(() => {
    clearTimeout(pending.current);
    setNotice(null);
  }, []);
  useEffect(() => () => clearTimeout(pending.current), []);
  const api = useMemo(() => ({ notice, confirm, dismiss }), [notice, confirm, dismiss]);
  return <ConfirmCtx.Provider value={api}>{children}</ConfirmCtx.Provider>;
}

/** `confirm({ text, undo })` right after the optimistic change. */
export const useConfirm = (): ((notice: ConfirmNotice) => void) => useContext(ConfirmCtx).confirm;

/**
 * The confirmation notice at the bottom of the view: visible 3.6 s (it waits while the pointer or the
 * keyboard is on it, so «Deshacer» can always be reached), then leaves. Announced politely.
 */
export function ConfirmToast({ className = '' }: { className?: string }) {
  const t = useTranslations('demoKit.confirm');
  const { notice, dismiss } = useContext(ConfirmCtx);
  const [held, setHeld] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!notice || held) return;
    const id = setTimeout(dismiss, PACE.confirmMs);
    return () => clearTimeout(id);
  }, [notice, held, dismiss]);

  const Icon = notice?.icon;
  return (
    <div className={`demo-confirm-host ${className}`} aria-live={notice?.silent ? 'off' : 'polite'} aria-atomic="true">
      {notice ? (
        <div
          key={notice.key}
          ref={box}
          className="demo-confirm"
          onPointerEnter={() => setHeld(true)}
          onPointerLeave={() => setHeld(false)}
          onFocus={() => setHeld(true)}
          onBlur={(e) => {
            if (!box.current?.contains(e.relatedTarget as Node | null)) setHeld(false);
          }}
        >
          {Icon ? <Icon aria-hidden strokeWidth={2} className="demo-confirm-icon" /> : null}
          <span className="demo-confirm-text">{notice.text}</span>
          {notice.undo ? (
            <button
              type="button"
              className="demo-confirm-undo"
              onClick={() => {
                notice.undo?.();
                setHeld(false);
                dismiss();
              }}
            >
              <Undo2 aria-hidden strokeWidth={2} />
              {t('undo')}
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Success glint                                                        */
/* ------------------------------------------------------------------ */
/**
 * The site's diamond-ring sparkle over its parent (position it), once per `play` key change: an
 * important success only (a visit booked, a reservation). 760 ms; nothing with reduced motion.
 */
export function Glint({ play, className = '' }: { play: string | number | null; className?: string }) {
  const reduced = useReducedMotion();
  if (play === null || reduced) return null;
  return <span key={play} aria-hidden className={`demo-glint ${className}`} />;
}

/* ------------------------------------------------------------------ */
/* Loading                                                              */
/* ------------------------------------------------------------------ */
/**
 * A simulated load for `key` (a page opening): true for `ms` (≤ 600) after `key` changes, then false.
 * The first value of a component is not a load (what mounts with it shows at once).
 */
export function useSimulatedLoad(key: string, ms: number = 450): boolean {
  const [loaded, setLoaded] = useState(key);
  useEffect(() => {
    if (loaded === key) return;
    const id = setTimeout(() => setLoaded(key), Math.min(PACE.loadMax, ms));
    return () => clearTimeout(id);
  }, [key, loaded, ms]);
  return loaded !== key;
}

/** A skeleton block with the shape of what loads (no shimmer: nothing moves while waiting). */
export function Skeleton({ className = '', label }: { className?: string; label?: string }) {
  return label ? (
    <span role="status" className={`demo-skel ${className}`}>
      <span className="sr-only">{label}</span>
    </span>
  ) : (
    <span aria-hidden className={`demo-skel ${className}`} />
  );
}

/* ------------------------------------------------------------------ */
/* Error and empty states                                               */
/* ------------------------------------------------------------------ */
/** A simulated error: what happened and how to go on, with the way out at hand. Never a technical error. */
export function SimError({ children, action, className = '' }: { children: ReactNode; action?: ReactNode; className?: string }) {
  const id = useId();
  return (
    <div role="alert" aria-describedby={id} className={`demo-simerror ${className}`}>
      <CircleAlert aria-hidden strokeWidth={2} className="demo-simerror-icon" />
      <p id={id} className="demo-simerror-text">
        {children}
      </p>
      {action ? <div className="demo-simerror-action">{action}</div> : null}
    </div>
  );
}

/** An empty state: one line that says what to do, and the action to do it. */
export function EmptyState({ title, body, action, className = '', tour }: { title: string; body?: string; action?: ReactNode; className?: string; tour?: string }) {
  return (
    <div className={`demo-empty ${className}`} data-tour={tour}>
      <p className="demo-empty-title demo-display">{title}</p>
      {body ? <p className="demo-empty-body">{body}</p> : null}
      {action ? <div className="demo-empty-action">{action}</div> : null}
    </div>
  );
}
