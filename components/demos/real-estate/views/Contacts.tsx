'use client';

import { useId, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ArrowLeft, Copy, NotebookPen, Plus } from 'lucide-react';
import { useSound } from '@/components/sound/SoundContext';
import { Avatar, Button, EmptyState, Readout, useConfirm } from '../../kit';
import { ADVISORS, BASE_LEADS, CONTACT_PHONE, listingById } from '../data';
import { act } from '../story';
import { useEstate } from '../context';
import { advisorOf, emailOf, useAllTasks, useContactHistory, useContacts, type ContactId, type ContactRow } from '../crm';
import { Field, SOURCE_ICON, StageTrack, useEstateText, ViewHead } from '../ui';
import { NewTask, TaskRow } from './Tasks';

const ADVISOR = Object.fromEntries(ADVISORS.map((a) => [a.id, a]));
const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .map((w) => w.charAt(0))
    .slice(0, 2)
    .join('')
    .toUpperCase();

/** What the contact is after (budget and financing): their answers in the chat, or what the CRM already knew. */
function useLooking(id: ContactId): { budget: string | null; pay: string | null } {
  const { view } = useEstate();
  const t = useTranslations('demoRealEstate');
  if (id === 'carolina') return { budget: view.budget ? t(`budget.${view.budget}`) : null, pay: view.pay ? t(`pay.${view.pay}`) : null };
  if (id === 'you') return { budget: view.own?.budget ? t(`budget.${view.own.budget}`) : null, pay: view.own?.pay ? t(`pay.${view.own.pay}`) : null };
  const base = BASE_LEADS.find((b) => b.id === id);
  return { budget: base ? t(`budget.${base.budget}`) : null, pay: base ? t(`pay.${base.pay}`) : null };
}

/** The contacts as a ledger (desktop) or a list (phone): who, where from, stage, which home, owner. */
function ContactList({ rows, selected, onOpen, compact }: { rows: ContactRow[]; selected: ContactId | null; onOpen: (id: ContactId) => void; compact: boolean }) {
  const t = useTranslations('demoRealEstate');
  const x = useEstateText();
  if (!rows.length) return <EmptyState title={t('contacts.empty')} body={t('contacts.emptyBody')} />;
  if (compact) {
    return (
      <ul className="re-clist">
        {rows.map((r) => {
          const Icon = SOURCE_ICON[r.source];
          return (
            <li key={r.id}>
              <button type="button" className="re-crow" aria-current={selected === r.id ? 'true' : undefined} onClick={() => onOpen(r.id)}>
                <Icon aria-hidden strokeWidth={1.6} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[0.8em] font-semibold">{x.person(r.id)}</span>
                  <span className="block truncate text-[0.66em] text-[var(--demo-muted)]">
                    {listingById(r.card.listing).street} · {r.lost ? t('contacts.lost') : t(`stages.${r.stage}`)}
                  </span>
                </span>
                <span className="re-crow-score demo-num">{r.card.score}</span>
              </button>
            </li>
          );
        })}
      </ul>
    );
  }
  return (
    <table className="re-table re-ctable">
      <caption className="sr-only">{t('contacts.caption')}</caption>
      <thead>
        <tr>
          <th scope="col">{t('contacts.cols.name')}</th>
          <th scope="col">{t('contacts.cols.stage')}</th>
          <th scope="col">{t('contacts.cols.listing')}</th>
          <th scope="col" className="text-right">
            {t('contacts.cols.score')}
          </th>
          <th scope="col">{t('contacts.cols.owner')}</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => {
          const Icon = SOURCE_ICON[r.source];
          const owner = ADVISOR[r.advisor];
          return (
            <tr key={r.id} aria-current={selected === r.id ? 'true' : undefined}>
              <th scope="row">
                <button type="button" className="re-crow-name" onClick={() => onOpen(r.id)}>
                  <Icon aria-hidden strokeWidth={1.6} />
                  <span className="min-w-0">
                    <span className="block truncate font-semibold">{x.person(r.id)}</span>
                    <span className="block truncate text-[0.86em] text-[var(--demo-muted)]">{t(`sources.${r.source}`)}</span>
                  </span>
                </button>
              </th>
              <td>
                <span className="re-pill" data-stage={r.lost ? 'lost' : r.stage}>
                  {r.lost ? t('contacts.lost') : t(`stages.${r.stage}`)}
                </span>
              </td>
              <td className="truncate">{listingById(r.card.listing).street}</td>
              <td className="demo-num text-right">{r.card.score}</td>
              <td>
                <span className="flex items-center gap-[0.4em]">
                  <Avatar initials={owner.initials} color={owner.color} ink={owner.ink} className="text-[0.8em]" />
                  <span className="truncate">{x.t(`people.${r.advisor}First`)}</span>
                </span>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

/** A note on the contact (local: never sent). Saved at once; «Deshacer» removes it. */
function NoteComposer({ id }: { id: ContactId }) {
  const t = useTranslations('demoRealEstate.contacts');
  const { store, state, view, active } = useEstate();
  const confirm = useConfirm();
  const { play } = useSound();
  const uid = useId();
  const [text, setText] = useState('');
  const save = () => {
    const clean = text.trim().slice(0, 280);
    if (!clean) return;
    const noteId = `n-${Date.now()}`;
    store.update(act.addNote({ id: noteId, person: id, text: clean, by: state.viewAs, clock: view.clock }));
    setText('');
    if (active) play('success');
    confirm({ text: t('noteSaved'), icon: NotebookPen, undo: () => store.update(act.removeNote(noteId)) });
  };
  return (
    <form
      className="re-note"
      onSubmit={(e) => {
        e.preventDefault();
        save();
      }}
    >
      <label htmlFor={`${uid}-note`} className="sr-only">
        {t('noteLabel')}
      </label>
      <textarea id={`${uid}-note`} value={text} maxLength={280} rows={2} placeholder={t('notePlaceholder')} onChange={(e) => setText(e.target.value)} />
      <Button type="submit" variant="secondary" icon={NotebookPen} disabled={!text.trim()}>
        {t('addNote')}
      </Button>
    </form>
  );
}

/** Everything about one contact: details, what they want, visits, tasks and the full history. */
export function ContactFile({ id, compact, onBack }: { id: ContactId; compact: boolean; onBack?: () => void }) {
  const t = useTranslations('demoRealEstate');
  const { view } = useEstate();
  const x = useEstateText();
  const confirm = useConfirm();
  const row = useContacts().find((r) => r.id === id);
  const history = useContactHistory(id);
  const tasks = useAllTasks().filter((k) => k.person === id);
  const looking = useLooking(id);
  const [adding, setAdding] = useState(false);
  const uid = useId();
  if (!row) return null;
  const name = x.person(id);
  const owner = ADVISOR[advisorOf(id)];
  const visits = view.visits.filter((v) => v.who === id);
  const l = listingById(row.card.listing);
  const phone = CONTACT_PHONE[id];
  const copy = async () => {
    try {
      await navigator.clipboard?.writeText(phone);
    } catch {
      // Clipboard blocked: the number is on screen anyway.
    }
    confirm({ text: t('contacts.copied') });
  };
  return (
    <article className="re-cfile" aria-labelledby={`${uid}-name`} data-compact={compact ? '' : undefined}>
      {onBack ? (
        <button type="button" className="re-crumbs" onClick={onBack}>
          <ArrowLeft aria-hidden strokeWidth={1.8} />
          {t('contacts.back')}
        </button>
      ) : null}
      <header className="re-cfile-head">
        <Avatar initials={initialsOf(name)} color="var(--demo-accent-2)" ink="var(--demo-ink)" className="re-cfile-avatar" />
        <div className="min-w-0 flex-1">
          <h3 id={`${uid}-name`} className="re-cfile-name demo-display">
            {name}
          </h3>
          <p className="text-[0.68em] text-[var(--demo-muted)]">
            {t(`sources.${row.source}`)} · {t('contacts.since', { when: x.slot({ day: row.first.day, start: row.first.min }) })}
          </p>
        </div>
        <div className="re-cfile-score">
          <p className="re-label">{t('lead.score')}</p>
          <p className="demo-display">
            <Readout value={row.card.score} />
          </p>
        </div>
      </header>
      <StageTrack stage={row.stage} lost={row.lost} />

      <section className="re-cfile-grid">
        <dl className="re-fields">
          <Field label={t('contacts.phone')} value={<span className="demo-num">{phone}</span>} />
          <Field label={t('contacts.email')} value={emailOf(name)} />
          <Field label={t('lead.seeks')} value={`${x.title(l.id)} · ${l.street}`} />
          <Field label={t('lead.budget')} value={looking.budget} accent />
          <Field label={t('lead.pay')} value={looking.pay} />
          <Field
            label={t('contacts.owner')}
            value={
              <span className="flex items-center gap-[0.4em]">
                <Avatar initials={owner.initials} color={owner.color} ink={owner.ink} className="text-[0.8em]" />
                {x.t(`people.${advisorOf(id)}`)}
              </span>
            }
          />
        </dl>
        <div className="flex flex-wrap gap-[0.4em]">
          <Button variant="secondary" icon={Copy} onClick={copy}>
            {t('contacts.copyPhone')}
          </Button>
        </div>
      </section>

      <section aria-labelledby={`${uid}-visits`}>
        <h4 id={`${uid}-visits`} className="re-label">
          {t('contacts.visits')}
        </h4>
        {visits.length ? (
          <ul className="re-cvisits">
            {visits.map((v) => (
              <li key={v.id}>
                <span className="demo-num">{x.slot(v)}</span> · {listingById(v.listing).street} · {x.t(`people.${v.advisor}First`)}
              </li>
            ))}
          </ul>
        ) : (
          <p className="re-quiet">{t('contacts.noVisits')}</p>
        )}
      </section>

      <section aria-labelledby={`${uid}-tasks`}>
        <div className="flex items-center justify-between gap-[0.6em]">
          <h4 id={`${uid}-tasks`} className="re-label">
            {t('contacts.tasks')}
          </h4>
          {adding ? null : (
            <button type="button" className="re-link" onClick={() => setAdding(true)}>
              <Plus aria-hidden strokeWidth={1.8} />
              {t('tasks.new.title')}
            </button>
          )}
        </div>
        {adding ? <NewTask person={id} onDone={() => setAdding(false)} /> : null}
        {tasks.length ? (
          <ul>
            {tasks.map((k) => (
              <TaskRow key={k.id} task={k} showContact={false} />
            ))}
          </ul>
        ) : (
          <p className="re-quiet">{t('contacts.noTasks')}</p>
        )}
      </section>

      <section aria-labelledby={`${uid}-history`}>
        <h4 id={`${uid}-history`} className="re-label">
          {t('contacts.history')}
        </h4>
        <NoteComposer id={id} />
        <ol className="re-history">
          {history.map((h) => (
            <li key={h.id} data-kind={h.kind}>
              <span className="re-history-when demo-num">{x.slot({ day: h.clock.day, start: h.clock.min })}</span>
              <span className="re-history-text">
                {h.kind === 'note' ? <span className="re-history-by">{t('contacts.noteBy', { name: x.t(`people.${h.by}First`) })}</span> : null}
                {h.text}
              </span>
            </li>
          ))}
        </ol>
      </section>
    </article>
  );
}

export function LaptopContacts() {
  const t = useTranslations('demoRealEstate.contacts');
  const { contact, openContact } = useEstate();
  const rows = useContacts();
  const selected = contact && rows.some((r) => r.id === contact) ? contact : (rows[0]?.id ?? null);
  return (
    <div className="flex h-full min-h-0 flex-col gap-[1em]">
      <ViewHead title={t('title')} sub={t('sub', { count: rows.length })} />
      <div className="re-contacts">
        <div className="re-contacts-list">
          <ContactList rows={rows} selected={selected} onOpen={openContact} compact={false} />
        </div>
        <div className="re-contacts-file">{selected ? <ContactFile key={selected} id={selected} compact={false} /> : null}</div>
      </div>
    </div>
  );
}

export function PhoneContacts() {
  const t = useTranslations('demoRealEstate.contacts');
  const { contact, openContact } = useEstate();
  const rows = useContacts();
  const open = contact && rows.some((r) => r.id === contact) ? contact : null;
  if (open) return <ContactFile key={open} id={open} compact onBack={() => openContact(null)} />;
  return (
    <div className="flex flex-col gap-[0.9em] pt-[0.3em]">
      <ViewHead title={t('title')} sub={t('sub', { count: rows.length })} />
      <ContactList rows={rows} selected={null} onOpen={openContact} compact />
    </div>
  );
}
