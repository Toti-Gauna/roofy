'use client';

import { useTranslations } from 'next-intl';
import { BASE_LEADS, BASE_TASKS, BASE_VISITS, LEAD_ADVISOR, OWN_ADVISOR, listingById, type AdvisorId, type BaseTask, type PersonId, type Source, type Stage } from './data';
import { useEstate } from './context';
import { useEstateText, useEventText } from './ui';
import type { Clock, LeadCard } from './story';

/**
 * The CRM's derived data (lote 3.6, Contact): contacts, tasks and each contact's history, all from the
 * story's view and the visitor's local actions. Nothing here is stored: it is recomputed from the store.
 */

export type ContactId = PersonId | 'you';

export const advisorOf = (person: ContactId): AdvisorId => (person === 'you' ? OWN_ADVISOR : LEAD_ADVISOR[person]);

/** Minutes since Monday 0:00 (sorts history and tasks). */
export const minutesOf = (c: Clock) => c.day * 1440 + c.min;

export interface Task extends BaseTask {
  done: Clock | null;
  /** Added by the visitor (can be removed with «Deshacer»). */
  added: boolean;
}

/** Every task (the open ones at 23:40, the ones the story creates and the visitor's), newest state applied. */
export function useAllTasks(): Task[] {
  const { view, state } = useEstate();
  const story: BaseTask[] = [];
  // The 23:40 visit, once booked: confirm it two hours before.
  const live = view.visits.find((v) => v.id === 'v-live');
  if (live) story.push({ id: 't-carolina', kind: 'confirm', person: 'carolina', listing: live.listing, day: live.day, min: live.start - 120, advisor: 'julia' });
  // With the chat off, the inquiry waits for the office: call first thing.
  if (view.botOff && view.t >= view.inquiryAt) story.push({ id: 't-carolina-call', kind: 'call', person: 'carolina', listing: view.listing, day: 4, min: 540, advisor: 'julia' });
  // The visitor's own visits.
  for (const m of state.mine) story.push({ id: `t-you-${m.day}-${m.start}`, kind: 'confirm', person: 'you', listing: m.listing, day: m.day, min: m.start - 120, advisor: OWN_ADVISOR });
  const all = [...BASE_TASKS, ...story, ...state.tasksAdded].map((task) => ({
    ...task,
    done: state.tasksDone[task.id] ?? null,
    added: state.tasksAdded.some((a) => a.id === task.id),
  }));
  return all.sort((a, b) => a.day * 1440 + a.min - (b.day * 1440 + b.min));
}

/** Tasks the account (as seen now) can see: an advisor only sees their own. */
export function useTasks(): Task[] {
  const { state } = useEstate();
  const all = useAllTasks();
  return state.viewAs === 'julia' ? all : all.filter((x) => x.advisor === state.viewAs);
}

/** "Llamar a Valeria Sosa" · "Enviar la ficha de Mitre 402 a Andrés Paz". */
export function useTaskTitle() {
  const t = useTranslations('demoRealEstate.tasks');
  const x = useEstateText();
  return (task: Pick<BaseTask, 'kind' | 'person' | 'listing'>) => t(`kinds.${task.kind}.title`, { name: x.person(task.person), street: listingById(task.listing).street });
}

export interface ContactRow {
  id: ContactId;
  card: LeadCard;
  stage: Stage;
  lost: boolean;
  source: Source | 'site';
  advisor: AdvisorId;
  /** First contact (the week's clock). */
  first: Clock;
}

/** The contacts: everyone with a card in the pipeline (Carolina once she writes, you once you chat). */
export function useContacts(): ContactRow[] {
  const { view, state } = useEstate();
  const rows = view.cards.map((card): ContactRow => {
    const base = BASE_LEADS.find((l) => l.id === card.person);
    const first: Clock = base ? { day: base.day, min: base.min } : card.person === 'carolina' ? { day: 3, min: 1420 } : view.clock;
    return { id: card.person, card, stage: card.column, lost: card.note === 'lost', source: card.source, advisor: advisorOf(card.person), first };
  });
  const visible = state.viewAs === 'julia' ? rows : rows.filter((r) => r.advisor === state.viewAs);
  // Newest first contact on top.
  return visible.sort((a, b) => minutesOf(b.first) - minutesOf(a.first));
}

export interface HistoryItem {
  id: string;
  clock: Clock;
  kind: 'inquiry' | 'answered' | 'stage' | 'visit' | 'note' | 'task' | 'event';
  text: string;
  /** For notes: who wrote it. */
  by?: AdvisorId;
}

/** A contact's history, newest first: how they arrived, every step, the visits, notes and tasks done. */
export function useContactHistory(id: ContactId): HistoryItem[] {
  const t = useTranslations('demoRealEstate');
  const { view, state } = useEstate();
  const x = useEstateText();
  const eventText = useEventText();
  const title = useTaskTitle();
  const tasks = useAllTasks();
  const items: HistoryItem[] = [];

  const base = BASE_LEADS.find((l) => l.id === id);
  if (base) {
    const l = listingById(base.listing);
    const at = (plus: number): Clock => ({ day: base.day + Math.floor((base.min + plus) / 1440), min: (base.min + plus) % 1440 });
    items.push({ id: 'inquiry', clock: at(0), kind: 'inquiry', text: t('history.inquiry', { street: l.street, source: t(`sources.${base.source}`) }) });
    if (base.source === 'web') items.push({ id: 'answered', clock: at(1), kind: 'answered', text: t('history.answered', { seconds: base.responseSec }) });
    const reached = ['new', 'qualified', 'visit', 'reserve'].indexOf(base.stage);
    if (reached >= 1) items.push({ id: 'qualified', clock: at(35), kind: 'stage', text: t('history.qualified', { pay: t(`pay.${base.pay}`), budget: t(`budget.${base.budget}`) }) });
    for (const v of BASE_VISITS.filter((v) => v.who === id)) items.push({ id: v.id, clock: at(50), kind: 'visit', text: t('history.booked', { slot: x.slotLong(v) }) });
    if (reached >= 3) items.push({ id: 'reserve', clock: at(1440 + 600), kind: 'stage', text: t('history.reserved', { street: l.street }) });
  } else {
    // Carolina's (the story) or the visitor's own events, as the activity feed tells them.
    const own = id === 'you';
    for (const e of view.events) {
      if (e.at > view.t) continue;
      if (own ? !e.mine : e.mine || e.kind.startsWith('past')) continue;
      items.push({ id: e.id, clock: e.clock, kind: 'event', text: eventText(e) });
    }
  }
  const moved = state.moved[id];
  if (moved) items.push({ id: 'moved', clock: view.clock, kind: 'stage', text: t('history.moved', { stage: t(`stages.${moved.column}`) }) });
  for (const n of state.notes.filter((n) => n.person === id)) items.push({ id: n.id, clock: n.clock, kind: 'note', text: n.text, by: n.by });
  for (const task of tasks.filter((k) => k.person === id && k.done)) items.push({ id: `done-${task.id}`, clock: task.done!, kind: 'task', text: t('history.taskDone', { task: title(task) }) });
  return items.sort((a, b) => minutesOf(b.clock) - minutesOf(a.clock));
}

/** A fictional email from the contact's name (`.demo` domain, nothing real). */
export function emailOf(name: string): string {
  const plain = name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z\s]/g, '')
    .trim()
    .split(/\s+/);
  return `${plain.join('.')}@correo.demo`;
}
