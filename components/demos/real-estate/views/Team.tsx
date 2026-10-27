'use client';

import { useId, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Check, Eye, Minus, UserPlus, X } from 'lucide-react';
import { useSound } from '@/components/sound/SoundContext';
import { Avatar, Button, useConfirm } from '../../kit';
import { ADVISORS, PERMISSIONS, ROLE_CAN, ROLE_OF, type AdvisorId, type Role } from '../data';
import { act } from '../story';
import { useEstate } from '../context';
import { advisorOf, emailOf, useAllTasks } from '../crm';
import { useEstateText, ViewHead } from '../ui';

const ROLES: Role[] = ['admin', 'advisor'];

/** The account's people: role, contacts and open tasks, and «Ver como» to see the account through their eyes. */
function People() {
  const t = useTranslations('demoRealEstate.team');
  const { store, state, view, active } = useEstate();
  const x = useEstateText();
  const tasks = useAllTasks();
  const { play } = useSound();
  return (
    <ul className="re-people">
      {ADVISORS.map((a) => {
        const name = x.t(`people.${a.id}`);
        const contacts = view.cards.filter((c) => advisorOf(c.person) === a.id).length;
        const open = tasks.filter((k) => k.advisor === a.id && !k.done).length;
        const seeing = state.viewAs === a.id;
        return (
          <li key={a.id} className="re-person" data-on={seeing ? '' : undefined}>
            <Avatar initials={a.initials} color={a.color} ink={a.ink} className="re-person-avatar" />
            <div className="min-w-0 flex-1">
              <p className="re-person-name">{name}</p>
              <p className="re-person-role">{t(`roles.${ROLE_OF[a.id]}`)}</p>
              <p className="re-person-mail demo-num">{emailOf(name).replace('@correo.demo', '@lumenpropiedades.demo')}</p>
              <p className="re-person-load demo-num">
                {t('load', { contacts, tasks: open })}
              </p>
            </div>
            <Button
              variant={seeing ? 'secondary' : 'ghost'}
              icon={Eye}
              aria-pressed={seeing}
              onClick={() => {
                if (seeing) return;
                store.update(act.viewAs(a.id));
                if (active) play('toggle');
              }}
            >
              {seeing ? t('seeing') : t('viewAs', { name: x.t(`people.${a.id}First`) })}
            </Button>
          </li>
        );
      })}
    </ul>
  );
}

/** What each role can do. The role the account is seen as is highlighted. */
function Permissions() {
  const t = useTranslations('demoRealEstate.team');
  const { state } = useEstate();
  const current = ROLE_OF[state.viewAs];
  const mark = (v: boolean | 'own') =>
    v === true ? (
      <>
        <Check aria-hidden strokeWidth={2.2} className="re-perm-yes" />
        <span className="sr-only">{t('yes')}</span>
      </>
    ) : v === 'own' ? (
      <span className="re-perm-own">{t('own')}</span>
    ) : (
      <>
        <Minus aria-hidden strokeWidth={2} className="re-perm-no" />
        <span className="sr-only">{t('no')}</span>
      </>
    );
  return (
    <table className="re-table re-perms">
      <caption className="re-label re-perms-cap">{t('permsTitle')}</caption>
      <thead>
        <tr>
          <th scope="col">{t('perm')}</th>
          {ROLES.map((r) => (
            <th key={r} scope="col" className="text-center" data-on={r === current ? '' : undefined}>
              {t(`roles.${r}`)}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {PERMISSIONS.map((p) => (
          <tr key={p}>
            <th scope="row">{t(`perms.${p}`)}</th>
            {ROLES.map((r) => (
              <td key={r} className="text-center" data-on={r === current ? '' : undefined}>
                {mark(ROLE_CAN[r][p])}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/** «Invitar»: an email and a role; the invitation shows as pending (local, nothing is sent). Owner only. */
function Invite() {
  const t = useTranslations('demoRealEstate.team');
  const { state, active } = useEstate();
  const confirm = useConfirm();
  const { play } = useSound();
  const uid = useId();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>('advisor');
  const [pending, setPending] = useState<{ email: string; role: Role }[]>([]);
  const canInvite = ROLE_CAN[ROLE_OF[state.viewAs]].users === true;
  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  return (
    <section className="re-panel re-invite" aria-labelledby={`${uid}-t`}>
      <div className="flex items-center justify-between gap-[0.6em]">
        <h3 id={`${uid}-t`} className="re-panel-title">
          {t('inviteTitle')}
        </h3>
        {!open && canInvite ? (
          <Button variant="secondary" icon={UserPlus} onClick={() => setOpen(true)}>
            {t('invite')}
          </Button>
        ) : null}
      </div>
      {!canInvite ? <p className="re-quiet">{t('inviteOwnerOnly')}</p> : null}
      {open && canInvite ? (
        <form
          className="re-newtask"
          onSubmit={(e) => {
            e.preventDefault();
            if (!valid) return;
            const entry = { email: email.trim().toLowerCase(), role };
            setPending((p) => [...p, entry]);
            setEmail('');
            setOpen(false);
            if (active) play('success');
            confirm({ text: t('invited'), icon: UserPlus, undo: () => setPending((p) => p.filter((x) => x !== entry)) });
          }}
        >
          <label className="re-select">
            <span>{t('email')}</span>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t('emailPlaceholder')} autoComplete="off" />
          </label>
          <label className="re-select">
            <span>{t('role')}</span>
            <select value={role} onChange={(e) => setRole(e.target.value as Role)}>
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {t(`roles.${r}`)}
                </option>
              ))}
            </select>
          </label>
          <div className="flex flex-wrap gap-[0.4em]">
            <Button type="submit" icon={UserPlus} disabled={!valid}>
              {t('send')}
            </Button>
            <Button variant="ghost" icon={X} onClick={() => setOpen(false)}>
              {t('cancel')}
            </Button>
          </div>
        </form>
      ) : null}
      {pending.length ? (
        <ul className="re-pending">
          {pending.map((p) => (
            <li key={p.email}>
              <span className="demo-num">{p.email}</span> · {t(`roles.${p.role}`)} · <span className="re-quiet">{t('pending')}</span>
            </li>
          ))}
        </ul>
      ) : null}
      <p className="re-quiet">{t('inviteNote')}</p>
    </section>
  );
}

export function LaptopTeam() {
  const t = useTranslations('demoRealEstate.team');
  return (
    <div className="flex flex-col gap-[1em]">
      <ViewHead title={t('title')} sub={t('sub')} />
      <div className="re-team">
        <div className="flex flex-col gap-[1em]">
          <People />
          <Invite />
        </div>
        <Permissions />
      </div>
    </div>
  );
}

export function PhoneTeam() {
  const t = useTranslations('demoRealEstate.team');
  return (
    <div className="flex flex-col gap-[0.9em] pt-[0.3em]">
      <ViewHead title={t('title')} sub={t('sub')} />
      <People />
      <Permissions />
      <Invite />
    </div>
  );
}

/** «Estás viendo la cuenta como Marcos · Asesor» with the way back (shown on every area while it applies). */
export function ViewingAs() {
  const t = useTranslations('demoRealEstate.team');
  const { state, store, active } = useEstate();
  const x = useEstateText();
  const { play } = useSound();
  if (state.viewAs === 'julia') return null;
  const owner: AdvisorId = 'julia';
  return (
    <div className="re-viewing" role="status">
      <Eye aria-hidden strokeWidth={1.8} />
      <span className="min-w-0 flex-1">{t('banner', { name: x.t(`people.${state.viewAs}`), role: t(`roles.${ROLE_OF[state.viewAs]}`) })}</span>
      <button
        type="button"
        className="re-link"
        onClick={() => {
          store.update(act.viewAs(owner));
          if (active) play('toggle');
        }}
      >
        {t('back', { name: x.t(`people.${owner}First`) })}
      </button>
    </div>
  );
}
