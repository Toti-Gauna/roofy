'use client';

import type { CSSProperties, ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { CalendarDays, Check, Columns3, Globe, ListChecks, MessageCircle, MessagesSquare, Newspaper, ShieldCheck, Signpost, Users, Building2, Minus, Play, FileText } from 'lucide-react';
import {
  ADVISORS,
  BASE_LEADS,
  BASE_TASKS,
  BASE_VISITS,
  BRAND_BASE,
  BRAND_HOOKS,
  BRAND_SWATCHES,
  BRAND_VIDEOS,
  CHAT_SLOTS,
  GUIDE_CHAPTERS,
  LISTINGS,
  LUMEN,
  LUMEN_THEME,
  PERMISSIONS,
  PROFILE_ITEMS,
  ROLE_CAN,
  ROLE_OF,
  STAGES,
  WEEK_BY_SOURCE,
  listingById,
  type Listing,
  type ListingId,
  type PersonId,
  type Source,
  type Stage,
} from '@/components/demos/real-estate/data';
import { Facade } from '@/components/demos/real-estate/facade';
import { LumenMark, useEstateText } from '@/components/demos/real-estate/ui';

/**
 * Lumen's product, rebuilt as trailer pieces (guía de motion §0): the same data, words and palette as the demo
 * (data.ts, `demoRealEstate`), laid out at a reading size for the film. Nothing here exists only in the video:
 * every piece is a screen or a module the demo has. Class names are the film's animation hooks.
 */

const SOURCE_ICON: Record<Source, typeof Globe> = { web: Globe, whatsapp: MessageCircle, portal: Newspaper, sign: Signpost };
const CRM_ICON = { inbox: MessagesSquare, contacts: Users, pipeline: Columns3, visits: CalendarDays, tasks: ListChecks, listings: Building2, team: ShieldCheck } as const;
export const CRM_MODULES = ['inbox', 'contacts', 'pipeline', 'visits', 'tasks', 'listings', 'team'] as const;
export type CrmModule = (typeof CRM_MODULES)[number];

const initials = (name: string) =>
  name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2);

type Look = { bg: string; surface: string; ink: string; muted: string; accent: string; accentInk: string; line: string };
const LUMEN_LOOK: Look = {
  bg: LUMEN_THEME.bg,
  surface: LUMEN_THEME.surface ?? LUMEN_THEME.bg,
  ink: LUMEN_THEME.ink,
  muted: LUMEN_THEME.muted,
  accent: LUMEN_THEME.accent,
  accentInk: LUMEN_THEME.accentInk,
  line: LUMEN_THEME.line ?? 'rgb(20 20 20 / 0.13)',
};
const lookVars = (l: Look) =>
  ({ '--l-bg': l.bg, '--l-surface': l.surface, '--l-ink': l.ink, '--l-muted': l.muted, '--l-accent': l.accent, '--l-accent-ink': l.accentInk, '--l-line': l.line }) as CSSProperties;

/* ------------------------------------------------------------------ */
/* The site                                                             */
/* ------------------------------------------------------------------ */

export function ListingCard({ id, className = '' }: { id: ListingId; className?: string }) {
  const x = useEstateText();
  const l = listingById(id);
  return (
    <article className={`tr-card tr-listing ${className}`} data-id={id}>
      <div className="tr-listing-img">
        <Facade listing={l} />
      </div>
      <div className="tr-listing-body">
        <p className="tr-listing-price">{x.price(l.price)}</p>
        <p className="tr-listing-street">{l.street}</p>
        <p className="tr-listing-meta">
          {x.rooms(l.id, true)} · {x.zone(l.zone)}
        </p>
      </div>
    </article>
  );
}

/** The site's home: header, hero, search and three listings. `base`: the product's template before the brand. */
export function SiteHome({ base = false, className = '' }: { base?: boolean; className?: string }) {
  const t = useTranslations('demoRealEstate');
  const look = base ? (BRAND_BASE as Look) : LUMEN_LOOK;
  return (
    <div className={`tr-site ${base ? 'is-base' : ''} ${className}`} style={lookVars(look)}>
      <header className="tr-site-head">
        <span className="tr-site-logo">
          {base ? <i className="tr-site-blank" aria-hidden /> : <LumenMark />}
          <span>{base ? t('brand.baseName') : LUMEN.business}</span>
        </span>
        <span className="tr-site-nav">{t('brand.navSample')}</span>
      </header>
      <div className="tr-site-hero">
        <p className="tr-site-kicker">{t('site.kicker')}</p>
        <h3 className="tr-site-title">{t.rich('site.title', { em: (c) => <em>{c}</em> })}</h3>
        <div className="tr-site-search">
          <span>
            {t('site.search.zone')} · {t('site.search.zoneAll')}
          </span>
          <span>
            {t('site.search.rooms')} · {t('site.search.roomsAny')}
          </span>
          <span>
            {t('site.search.price')} · {t('site.search.priceAny')}
          </span>
          <b>{t('site.search.label')}</b>
        </div>
      </div>
      <div className="tr-site-grid">
        {(['olmos', 'ribera', 'parque'] as const).map((id) => (
          <ListingCard key={id} id={id} />
        ))}
      </div>
    </div>
  );
}

/** A listing's page with the booking: «Agendar visita» → day and time → «Visita agendada». */
export function ListingPage({ id }: { id: ListingId }) {
  const t = useTranslations('demoRealEstate');
  const x = useEstateText();
  const l = listingById(id);
  const slot = CHAT_SLOTS.fri;
  return (
    <div className="tr-detail" style={lookVars(LUMEN_LOOK)}>
      <div className="tr-detail-img">
        <Facade listing={l} />
      </div>
      <div className="tr-detail-info">
        <p className="tr-site-kicker">{t('site.crumbs', { zone: x.zone(l.zone) })}</p>
        <h3 className="tr-detail-title">{x.title(l.id)}</h3>
        <p className="tr-detail-price">{x.price(l.price)}</p>
        <p className="tr-detail-street">{l.street}</p>
        <ul className="tr-detail-facts">
          <li>{t('listing.area', { count: l.area })}</li>
          <li>{x.rooms(l.id)}</li>
          <li>{t('listing.baths', { count: l.baths })}</li>
          <li>{t('features.credit')}</li>
        </ul>
        <div className="tr-detail-book">
          <button type="button" className="tr-btn tr-book-btn">
            {t('site.book')}
          </button>
          <div className="tr-booking">
            <p className="tr-booking-title">{t('site.booking.title')}</p>
            <div className="tr-booking-row">
              <span className="tr-chip is-on tr-booking-day">{x.day(slot.day)}</span>
              <span className="tr-chip">{x.day(CHAT_SLOTS.sat.day)}</span>
            </div>
            <div className="tr-booking-row">
              <span className="tr-chip tr-booking-time">{x.fmt.time(slot.start)}</span>
              <span className="tr-chip">{x.fmt.time(slot.start + 30)}</span>
            </div>
            <button type="button" className="tr-btn tr-booking-confirm">
              {t('site.booking.confirm')}
            </button>
          </div>
          <div className="tr-booked">
            <Check aria-hidden strokeWidth={2.4} />
            <span>
              <b>{t('site.booking.booked')}</b>
              <br />
              {x.slot(slot)} · {l.street}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* The guided chat (Carolina's phone)                                  */
/* ------------------------------------------------------------------ */

export function ChatScreen() {
  const t = useTranslations('demoRealEstate');
  const x = useEstateText();
  const l = listingById('olmos');
  const name = x.t('people.carolinaFirst');
  return (
    <div className="tr-chat" style={lookVars(LUMEN_LOOK)}>
      <header className="tr-chat-head">
        <span className="tr-chat-avatar">
          <LumenMark />
        </span>
        <span>
          <b>{LUMEN.business}</b>
          <br />
          <small>{t('bot.title')}</small>
        </span>
      </header>
      <div className="tr-chat-log">
        <p className="tr-bubble is-user tr-b-ask">{t('chat.steps.ask', { street: l.street })}</p>
        <p className="tr-bubble tr-b-hi">{t('chat.steps.hi', { name })}</p>
        <p className="tr-bubble tr-b-pay">{t('chat.steps.pay')}</p>
        <div className="tr-b-reply">
          <div className="tr-chips tr-b-chips">
            {(['cash', 'credit', 'sell'] as const).map((r) => (
              <span key={r} className={`tr-chip ${r === 'credit' ? 'tr-chip-credit' : ''}`}>
                {t(`chat.replies.${r}`)}
              </span>
            ))}
          </div>
          <p className="tr-bubble is-user tr-b-credit">{t('chat.replies.credit')}</p>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* The CRM                                                              */
/* ------------------------------------------------------------------ */

export function CrmShell({ children }: { children: ReactNode }) {
  const t = useTranslations('demoRealEstate.nav');
  return (
    <div className="tr-crm" style={lookVars(LUMEN_LOOK)}>
      <nav className="tr-crm-side">
        <span className="tr-crm-brand">
          <LumenMark />
          <span>{LUMEN.business}</span>
        </span>
        <ul>
          {CRM_MODULES.map((m) => {
            const Icon = CRM_ICON[m];
            return (
              <li key={m} className="tr-crm-item" data-m={m}>
                <Icon aria-hidden strokeWidth={1.7} />
                <span>{t(m)}</span>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="tr-crm-main">{children}</div>
    </div>
  );
}

function Panel({ m, title, children }: { m: CrmModule; title: string; children: ReactNode }) {
  return (
    <section className="tr-panel" data-m={m}>
      <h3 className="tr-panel-title">{title}</h3>
      {children}
    </section>
  );
}

function SourceTag({ source }: { source: Source }) {
  const t = useTranslations('demoRealEstate.sources');
  const Icon = SOURCE_ICON[source];
  return (
    <span className="tr-source" data-s={source}>
      <Icon aria-hidden strokeWidth={1.8} />
      {t(source)}
    </span>
  );
}

const INBOX: { id: PersonId; source: Source }[] = [
  { id: 'carolina', source: 'web' },
  { id: 'andres', source: 'whatsapp' },
  { id: 'valeria', source: 'portal' },
  { id: 'diego', source: 'sign' },
  { id: 'lucia', source: 'web' },
];

export function InboxPanel() {
  const t = useTranslations('demoRealEstate');
  const x = useEstateText();
  return (
    <Panel m="inbox" title={t('nav.inbox')}>
      <ul className="tr-rows">
        {INBOX.map((r) => (
          <li key={r.id} className="tr-row tr-inbox-row">
            <span className="tr-avatar">{initials(x.person(r.id))}</span>
            <span className="tr-row-main">
              <b>{x.person(r.id)}</b>
              <small>{r.id === 'carolina' ? t('chat.replies.credit') : t(`inbox.previews.${r.id}`)}</small>
            </span>
            <SourceTag source={r.source} />
          </li>
        ))}
      </ul>
    </Panel>
  );
}

/** The lupa of the chat: the inquiry as it lands in the CRM (Carolina's answers on her file). */
export function NewInquiryCard({ kicker }: { kicker: string }) {
  const t = useTranslations('demoRealEstate');
  const x = useEstateText();
  const l = listingById('olmos');
  return (
    <div className="tr-card tr-big tr-inquiry">
      <p className="tr-big-kicker">{kicker}</p>
      <p className="tr-inquiry-name">
        <span className="tr-avatar is-big">{initials(x.person('carolina'))}</span>
        <b>{x.person('carolina')}</b>
      </p>
      <p className="tr-big-line">
        <SourceTag source="web" /> {l.street}
      </p>
      <p className="tr-big-line">
        <b>{t('lead.pay')}</b> · {t('chat.replies.credit')}
      </p>
    </div>
  );
}

/** The lupa of the inbox: the week's inquiries by channel, all in one place. */
export function ChannelsCard({ title }: { title: string }) {
  const sources: Source[] = ['web', 'whatsapp', 'portal', 'sign'];
  return (
    <div className="tr-card tr-big tr-channels">
      <p className="tr-big-kicker">{title}</p>
      {sources.map((s) => (
        <p key={s} className="tr-channel">
          <SourceTag source={s} />
          <b>{WEEK_BY_SOURCE[s]}</b>
        </p>
      ))}
    </div>
  );
}

export function ContactPanel() {
  const t = useTranslations('demoRealEstate');
  const x = useEstateText();
  const lead = BASE_LEADS.find((l) => l.id === 'lucia')!;
  const l = listingById(lead.listing);
  const name = x.person('lucia');
  return (
    <Panel m="contacts" title={t('nav.contacts')}>
      <div className="tr-contact">
        <span className="tr-avatar is-big">{initials(name)}</span>
        <div>
          <b className="tr-contact-name">{name}</b>
          <p className="tr-contact-meta">
            {x.title(l.id)} · {x.price(l.price)}
          </p>
          <p className="tr-contact-meta">
            {t('contacts.owner')}: {x.t('people.marcos')}
          </p>
        </div>
      </div>
      <ContactHistory />
    </Panel>
  );
}

/** Her history, as the contact file tells it. */
export function ContactHistory({ className = '' }: { className?: string }) {
  const t = useTranslations('demoRealEstate');
  const x = useEstateText();
  const lead = BASE_LEADS.find((l) => l.id === 'lucia')!;
  const l = listingById(lead.listing);
  const visit = BASE_VISITS.find((v) => v.who === 'lucia');
  const items = [
    t('history.inquiry', { street: l.street, source: t(`sources.${lead.source}`) }),
    t('history.answered', { seconds: lead.responseSec }),
    t('history.qualified', { pay: t(`pay.${lead.pay}`), budget: t(`budget.${lead.budget}`) }),
    visit ? t('history.booked', { slot: x.slotLong(visit) }) : null,
  ].filter(Boolean) as string[];
  return (
    <ol className={`tr-history ${className}`}>
      {items.map((it, i) => (
        <li key={i} className="tr-history-item">
          <i aria-hidden />
          {it}
        </li>
      ))}
    </ol>
  );
}

export function PipelinePanel() {
  const t = useTranslations('demoRealEstate');
  const x = useEstateText();
  const col = (s: Stage) => BASE_LEADS.filter((l) => l.stage === s).slice(0, 2);
  return (
    <Panel m="pipeline" title={t('nav.pipeline')}>
      <div className="tr-kanban">
        {STAGES.map((s) => (
          <div key={s} className="tr-kcol" data-s={s}>
            <p className="tr-kcol-head">{t(`stages.${s}`)}</p>
            {col(s).map((l) => (
              <div key={l.id} className="tr-kcard">
                <b>{x.short(l.id)}</b>
                <small>{listingById(l.listing).street}</small>
                <span className="tr-score">{l.score}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="tr-kcard tr-kcard-carolina">
        <b>{x.short('carolina')}</b>
        <small>{listingById('olmos').street}</small>
        <span className="tr-score">
          <span className="tr-score-a">58</span>
          <span className="tr-score-b">82</span>
        </span>
      </div>
    </Panel>
  );
}

export function AgendaPanel() {
  const t = useTranslations('demoRealEstate');
  const x = useEstateText();
  const days = [0, 1, 2, 3, 4, 5];
  const hours = [600, 720, 840, 960, 1080, 1200];
  const top = (min: number) => ((min - 600) / 600) * 100;
  const slot = CHAT_SLOTS.fri;
  return (
    <Panel m="visits" title={t('nav.visits')}>
      <div className="tr-week">
        <div className="tr-week-hours">
          {hours.map((h) => (
            <span key={h} style={{ top: `${top(h)}%` }}>
              {x.fmt.time(h)}
            </span>
          ))}
        </div>
        {days.map((d) => (
          <div key={d} className="tr-week-day">
            <p className="tr-week-label">{x.day(d)}</p>
            <div className="tr-week-col">
              {BASE_VISITS.filter((v) => v.day === d && v.start >= 600 && v.start < 1200).map((v) => (
                <span key={v.id} className="tr-visit" style={{ top: `${top(v.start)}%`, height: `${((v.end - v.start) / 600) * 100}%` }}>
                  {v.who ? x.short(v.who) : t(`visits.what.${v.what}`)}
                </span>
              ))}
              {d === slot.day ? (
                <span className="tr-visit is-new" style={{ top: `${top(slot.start)}%`, height: `${(60 / 600) * 100}%` }}>
                  {x.short('carolina')}
                </span>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

/** The lupa of the agenda: the next visit. */
export function NextVisitCard() {
  const t = useTranslations('demoRealEstate');
  const x = useEstateText();
  const slot = CHAT_SLOTS.fri;
  return (
    <div className="tr-card tr-big tr-nextvisit">
      <p className="tr-big-kicker">{t('visits.next')}</p>
      <p className="tr-big-time">{x.fmt.time(slot.start)}</p>
      <p className="tr-big-line">{x.day(slot.day, 'long')}</p>
      <p className="tr-big-line">
        <b>{x.person('carolina')}</b> · {listingById('olmos').street}
      </p>
      <p className="tr-big-line is-muted">{t('visits.withAdvisor', { advisor: x.t('people.julia') })}</p>
    </div>
  );
}

export function TasksPanel() {
  const t = useTranslations('demoRealEstate');
  const x = useEstateText();
  return (
    <Panel m="tasks" title={t('nav.tasks')}>
      <ul className="tr-rows">
        {BASE_TASKS.slice(0, 5).map((k) => (
          <li key={k.id} className="tr-row tr-task">
            <span className="tr-check">
              <i className="tr-check-fill" aria-hidden />
              <Check aria-hidden strokeWidth={2.6} />
            </span>
            <span className="tr-row-main">
              <b>{t(`tasks.kinds.${k.kind}.title`, { name: x.person(k.person), street: listingById(k.listing).street })}</b>
              <small>{x.slot({ day: k.day, start: k.min })}</small>
            </span>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

export function ListingsPanel() {
  const t = useTranslations('demoRealEstate');
  const x = useEstateText();
  return (
    <Panel m="listings" title={t('nav.listings')}>
      <ul className="tr-rows">
        {LISTINGS.map((l: Listing) => (
          <li key={l.id} className="tr-row tr-prop">
            <span className="tr-prop-img">
              <Facade listing={l} />
            </span>
            <span className="tr-row-main">
              <b>{l.street}</b>
              <small>{x.title(l.id)}</small>
            </span>
            <span className="tr-prop-price">{x.price(l.price)}</span>
            <span className="tr-prop-n">{t('listing.inquiries', { count: l.inquiries })}</span>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

export function TeamPanel() {
  const t = useTranslations('demoRealEstate');
  const x = useEstateText();
  return (
    <Panel m="team" title={t('nav.team')}>
      <div className="tr-team">
        {ADVISORS.map((a) => (
          <div key={a.id} className="tr-person">
            <span className="tr-avatar is-big" style={{ background: a.color, color: a.ink }}>
              {a.initials}
            </span>
            <span>
              <b>{x.t(`people.${a.id}`)}</b>
              <small>{t(`team.roles.${ROLE_OF[a.id]}`)}</small>
            </span>
          </div>
        ))}
      </div>
      <table className="tr-perms">
        <thead>
          <tr>
            <th />
            <th>{t('team.roles.admin')}</th>
            <th>{t('team.roles.advisor')}</th>
          </tr>
        </thead>
        <tbody>
          {PERMISSIONS.slice(0, 5).map((p) => (
            <tr key={p} className="tr-perm">
              <th>{t(`team.perms.${p}`)}</th>
              {(['admin', 'advisor'] as const).map((r) => {
                const v = ROLE_CAN[r][p];
                return <td key={r}>{v === true ? <Check aria-hidden strokeWidth={2.4} /> : v === 'own' ? <span className="tr-own">{t('team.own')}</span> : <Minus aria-hidden strokeWidth={2} />}</td>;
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </Panel>
  );
}

/* ------------------------------------------------------------------ */
/* The setup: the brand                                                 */
/* ------------------------------------------------------------------ */

export function BrandKit() {
  const t = useTranslations('demoRealEstate.brand');
  return (
    <div className="tr-kit">
      <div className="tr-kit-logos">
        {(['light', 'ink', 'accent'] as const).map((on) => (
          <span key={on} className="tr-kit-logo" data-on={on}>
            <LumenMark />
            <span>{LUMEN.business}</span>
          </span>
        ))}
      </div>
      <div className="tr-kit-swatches">
        {BRAND_SWATCHES.map((s) => (
          <span key={s.id} className="tr-swatch">
            <i style={{ background: s.hex }} />
            <b>{t(`swatches.${s.id}`)}</b>
            <small>{s.hex}</small>
          </span>
        ))}
      </div>
      <div className="tr-kit-type">
        <p className="tr-kit-display">{t('typeDisplay')}</p>
        <p className="tr-kit-body">{t('typeBody')}</p>
      </div>
    </div>
  );
}

export function ProfileAudit() {
  const t = useTranslations('demoRealEstate.brand');
  return (
    <div className="tr-card tr-audit">
      <p className="tr-big-kicker">
        {t('profile.main.name')} · {t('profile.main.handle')}
      </p>
      {PROFILE_ITEMS.map((item) => (
        <div key={item} className="tr-audit-row">
          <span className="tr-audit-label">{t(`auditItems.${item}`)}</span>
          <span className="tr-audit-before">{t(`profile.main.${item}.before`)}</span>
          <span className="tr-audit-after">
            <Check aria-hidden strokeWidth={2.4} />
            {t(`profile.main.${item}.after`)}
          </span>
        </div>
      ))}
    </div>
  );
}

export function LibraryFan() {
  const t = useTranslations('demoRealEstate.brand');
  return (
    <div className="tr-library">
      <div className="tr-hooks">
        {BRAND_HOOKS.slice(0, 6).map((h) => (
          <div key={h.id} className="tr-card tr-hook">
            <small>{t(`hookTags.${h.tag}`)}</small>
            <p>{t(`hook.${h.id}`)}</p>
          </div>
        ))}
      </div>
      <div className="tr-videos">
        {BRAND_VIDEOS.slice(0, 3).map((v) => (
          <div key={v.id} className="tr-card tr-video">
            <span className="tr-video-img">
              <Facade listing={listingById(v.listing)} />
              <Play aria-hidden strokeWidth={1.8} />
            </span>
            <b>{t(`video.${v.id}.title`)}</b>
            <small>{t('seconds', { seconds: v.seconds })}</small>
          </div>
        ))}
      </div>
      <div className="tr-card tr-guide">
        <p className="tr-big-kicker">
          <FileText aria-hidden strokeWidth={1.8} />
          {t('guide')}
        </p>
        <ol>
          {GUIDE_CHAPTERS.map((c) => (
            <li key={c}>{t(`chapters.${c}.name`)}</li>
          ))}
        </ol>
      </div>
    </div>
  );
}
