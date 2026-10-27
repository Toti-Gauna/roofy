'use client';

import { useId, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Check, ListPlus, Plus } from 'lucide-react';
import { useSound } from '@/components/sound/SoundContext';
import { Avatar, Button, EmptyState, useConfirm } from '../../kit';
import { ADVISORS, CAL_DAYS, TASK_KINDS, type TaskKind } from '../data';
import { act } from '../story';
import { useEstate } from '../context';
import { useContacts, useTaskTitle, useTasks, type ContactId, type Task } from '../crm';
import { useEstateText, ViewHead } from '../ui';

const ADVISOR = Object.fromEntries(ADVISORS.map((a) => [a.id, a]));
/** Times offered for a new task (9:00 → 18:00). */
const TASK_TIMES = [540, 600, 660, 720, 900, 960, 1020, 1080];

/**
 * One task: a real checkbox (completing it is optimistic and can be undone), what to do, when, with whom
 * (opens the contact's file) and who owns it.
 */
export function TaskRow({ task, showContact = true }: { task: Task; showContact?: boolean }) {
  const t = useTranslations('demoRealEstate.tasks');
  const { store, view, active, openContact } = useEstate();
  const x = useEstateText();
  const title = useTaskTitle();
  const confirm = useConfirm();
  const { play } = useSound();
  const done = !!task.done;
  const name = title(task);
  const owner = ADVISOR[task.advisor];
  const toggle = () => {
    store.update(act.toggleTask(task.id, view.clock));
    if (active) play(done ? 'select' : 'success');
    if (!done) confirm({ text: t('doneToast'), icon: Check, undo: () => store.update(act.toggleTask(task.id, view.clock)) });
  };
  return (
    <li className="re-task" data-done={done ? '' : undefined}>
      <button type="button" role="checkbox" aria-checked={done} aria-label={name} className="re-check" onClick={toggle}>
        <Check aria-hidden strokeWidth={2.4} />
      </button>
      <span className="min-w-0 flex-1">
        <span className="re-task-title">{name}</span>
        <span className="re-task-meta">
          <span className="demo-num">{x.slot({ day: task.day, start: task.min })}</span>
          {showContact ? (
            <>
              {' · '}
              <button type="button" className="re-link re-task-who" onClick={() => openContact(task.person)}>
                {t('seeContact')}
              </button>
            </>
          ) : null}
          {done ? <span className="re-task-done"> · {t('done')}</span> : null}
        </span>
      </span>
      <span className="re-task-owner" title={x.t(`people.${task.advisor}`)}>
        <Avatar initials={owner.initials} color={owner.color} ink={owner.ink} className="text-[0.62em]" />
        <span className="sr-only">{t('owner', { name: x.t(`people.${task.advisor}`) })}</span>
      </span>
    </li>
  );
}

/** «Nueva tarea»: what (four kinds), with whom (the contacts this account sees), when. Added at once; can be undone. */
export function NewTask({ person: fixed, onDone }: { person?: ContactId; onDone?: () => void }) {
  const t = useTranslations('demoRealEstate.tasks');
  const { store, state, active } = useEstate();
  const x = useEstateText();
  const contacts = useContacts();
  const confirm = useConfirm();
  const { play } = useSound();
  const uid = useId();
  const [kind, setKind] = useState<TaskKind>('call');
  const [person, setPerson] = useState<ContactId | ''>(fixed ?? contacts[0]?.id ?? '');
  const [day, setDay] = useState<number>(CAL_DAYS[0]);
  const [min, setMin] = useState(TASK_TIMES[1]);
  const row = contacts.find((c) => c.id === (fixed ?? person));
  const save = () => {
    if (!row) return;
    const id = `t-new-${Date.now()}`;
    store.update(act.addTask({ id, kind, person: row.id, listing: row.card.listing, day, min, advisor: state.viewAs }));
    if (active) play('success');
    confirm({ text: t('addedToast'), icon: ListPlus, undo: () => store.update(act.removeTask(id)) });
    onDone?.();
  };
  return (
    <form
      className="re-newtask"
      aria-labelledby={`${uid}-t`}
      onSubmit={(e) => {
        e.preventDefault();
        save();
      }}
    >
      <p id={`${uid}-t`} className="re-label">
        {t('new.title')}
      </p>
      <fieldset className="re-newtask-kinds">
        <legend className="sr-only">{t('new.kind')}</legend>
        {TASK_KINDS.map((k) => (
          <button key={k} type="button" className="re-chip" aria-pressed={kind === k} onClick={() => setKind(k)}>
            {t(`kinds.${k}.short`)}
          </button>
        ))}
      </fieldset>
      <div className="re-newtask-row">
        {fixed ? null : (
          <label className="re-select">
            <span>{t('new.contact')}</span>
            <select value={person} onChange={(e) => setPerson(e.target.value as ContactId)}>
              {contacts.map((c) => (
                <option key={c.id} value={c.id}>
                  {x.person(c.id)}
                </option>
              ))}
            </select>
          </label>
        )}
        <label className="re-select">
          <span>{t('new.day')}</span>
          <select value={day} onChange={(e) => setDay(Number(e.target.value))}>
            {CAL_DAYS.map((d) => (
              <option key={d} value={d}>
                {x.day(d)}
              </option>
            ))}
          </select>
        </label>
        <label className="re-select">
          <span>{t('new.time')}</span>
          <select value={min} onChange={(e) => setMin(Number(e.target.value))}>
            {TASK_TIMES.map((m) => (
              <option key={m} value={m}>
                {x.fmt.time(m)}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="flex flex-wrap gap-[0.4em]">
        <Button type="submit" icon={Plus} disabled={!row}>
          {t('new.save')}
        </Button>
        {onDone ? (
          <Button variant="ghost" onClick={onDone}>
            {t('new.cancel')}
          </Button>
        ) : null}
      </div>
    </form>
  );
}

/** The to-do list, by day: what the team (or, seen as an advisor, that advisor) has to do next. */
function TaskList() {
  const t = useTranslations('demoRealEstate.tasks');
  const x = useEstateText();
  const tasks = useTasks();
  const [filter, setFilter] = useState<'open' | 'done'>('open');
  const shown = tasks.filter((k) => (filter === 'open' ? !k.done : !!k.done));
  const days = [...new Set(shown.map((k) => k.day))];
  const open = tasks.filter((k) => !k.done).length;
  return (
    <section className="re-tasks" aria-label={t('title')}>
      <div className="re-segment" role="group" aria-label={t('filter')}>
        <button type="button" aria-pressed={filter === 'open'} onClick={() => setFilter('open')}>
          {t('open', { count: open })}
        </button>
        <button type="button" aria-pressed={filter === 'done'} onClick={() => setFilter('done')}>
          {t('doneTab', { count: tasks.length - open })}
        </button>
      </div>
      {shown.length ? (
        days.map((d) => (
          <div key={d} className="re-tasks-day">
            <h3 className="re-label">{x.day(d, 'long')}</h3>
            <ul>
              {shown
                .filter((k) => k.day === d)
                .map((k) => (
                  <TaskRow key={k.id} task={k} />
                ))}
            </ul>
          </div>
        ))
      ) : (
        <EmptyState title={filter === 'open' ? t('emptyOpen') : t('emptyDone')} body={filter === 'open' ? t('emptyOpenBody') : t('emptyDoneBody')} />
      )}
    </section>
  );
}

export function LaptopTasks() {
  const t = useTranslations('demoRealEstate.tasks');
  return (
    <div className="re-tasks-page">
      <ViewHead title={t('title')} sub={t('sub')} />
      <div className="re-tasks-grid">
        <TaskList />
        <aside className="re-panel">
          <NewTask />
        </aside>
      </div>
    </div>
  );
}

export function PhoneTasks() {
  const t = useTranslations('demoRealEstate.tasks');
  const [adding, setAdding] = useState(false);
  return (
    <div className="flex flex-col gap-[0.9em] pt-[0.3em]">
      <ViewHead title={t('title')} sub={t('sub')} />
      {adding ? (
        <div className="re-panel">
          <NewTask onDone={() => setAdding(false)} />
        </div>
      ) : (
        <Button variant="secondary" icon={Plus} onClick={() => setAdding(true)}>
          {t('new.title')}
        </Button>
      )}
      <TaskList />
    </div>
  );
}
