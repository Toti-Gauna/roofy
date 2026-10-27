'use client';

import type { ReactNode } from 'react';
import { gsap } from 'gsap';
import { useTranslations } from 'next-intl';
import { PhaseGlyph } from '@/components/ui/PhaseGlyph';
import { LUMEN, SITE_URL, listingPath } from '@/components/demos/real-estate/data';
import { planInfo, planPhase } from '@/lib/plans';
import { BROWSER, Browser, Finger, Phone, UI_ZOOM } from '../../ui/devices';
import {
  AgendaPanel,
  BrandKit,
  ChannelsCard,
  ChatScreen,
  ContactHistory,
  ContactPanel,
  CrmShell,
  CRM_MODULES,
  InboxPanel,
  LibraryFan,
  ListingCard,
  ListingPage,
  ListingsPanel,
  NewInquiryCard,
  NextVisitCard,
  PipelinePanel,
  ProfileAudit,
  SiteHome,
  TasksPanel,
  TeamPanel,
} from '../../ui/estate';
import type { FilmCtx, Layout } from '../../film';
import { box, center, fingerOut, flash, golpe, head, lupa, span, tag, tap } from '../../moves';
import { CONTACT_DURATION, HEADS, HEAD_TIMES } from './script';
import type { Ratio } from '../../timeline';

/**
 * P1 · Contact (STORYBOARD.md next to this file): the markup and the choreography. Times and words are in script.ts;
 * the pieces are rebuilt in ui/estate.tsx with Lumen's data; no plan price, no quotas, the «Demo» seal on every frame.
 */
function Words({ text }: { text: string }) {
  return (
    <>
      {text.split(' ').map((w, i) => (
        <span key={i}>{i ? ` ${w}` : w}</span>
      ))}
    </>
  );
}

function Golpe({ id, panels }: { id: string; panels: { p: string; color: string; half?: boolean; text: string }[] }) {
  return (
    <section className="tr-scene tr-golpe" id={id} style={{ zIndex: 20 }}>
      {panels.map((x) => (
        <div key={x.p} className={`tr-panel-c tr-c-${x.color}`} data-p={x.p} data-half={x.half ? '' : undefined}>
          <span className="tr-word">
            <Words text={x.text} />
          </span>
        </div>
      ))}
    </section>
  );
}

function Mark({ id, line }: { id: string; line?: string }) {
  const t = useTranslations('video');
  return (
    <section className="tr-scene tr-c-night" id={id} style={{ zIndex: 22 }}>
      <div className="tr-mark">
        <div className="tr-mark-glyph">
          <PhaseGlyph phase={planPhase('contact')} size="100%" strokeWidth={0.7} />
        </div>
        <p className="tr-mark-word">{t('brand')}</p>
        <p className="tr-mark-plan">{planInfo('contact').name}</p>
        {line ? <p className="tr-mark-line">{line}</p> : null}
      </div>
    </section>
  );
}

function Abs({ className, children }: { className: string; children: ReactNode }) {
  return <div className={`tr-abs ${className}`}>{children}</div>;
}

export function ContactFilm({ ratio, L }: { ratio: Ratio; L: Layout }) {
  const t = useTranslations('video');
  const tc = useTranslations('video.contact');
  const tx = useTranslations('experience');
  const g = (k: string) => tc(`golpes.${k}`);
  return (
    <div className="tr" data-ratio={ratio} style={{ width: L.W, height: L.H }}>
      <p className="tr-seal">{t('seal')}</p>
      <div className="tr-flash" />
      <Finger />

      <Golpe
        id="gancho"
        panels={[
          { p: '1', color: 'cobalt', text: g('g1') },
          { p: '2', color: 'stone', half: true, text: g('g2') },
          { p: '3', color: 'ink', text: g('g3') },
          { p: '4', color: 'sand', half: true, text: g('g4') },
        ]}
      />
      <Mark id="marca" />

      <section className="tr-scene" id="app">
        <div className="tr-tags" style={{ position: 'absolute', left: L.tag.x, top: L.tag.y }}>
          {(['web', 'chat', 'crm', 'setup'] as const).map((k, i) => (
            <span key={k} className={`tr-tag tg-${k}`} style={{ position: 'absolute', left: 0, top: 0 }}>
              <b>{i + 1}</b>
              {tc(`tags.${k}`)}
            </span>
          ))}
        </div>
        <div className="tr-heads" style={{ left: L.heads.x, top: L.heads.y, width: L.heads.w, height: L.heads.h }}>
          {HEADS.map((h) => (
            <p key={h} className={`tr-head hd-${h}`}>
              <Words text={tc(`heads.${h}`)} />
            </p>
          ))}
        </div>

        {/* Chapter 1 · the site */}
        <Abs className="dev-site">
          <Browser url={SITE_URL}>
            <div className="pg-home tr-abs" style={{ inset: 0 }}>
              <SiteHome />
            </div>
            <div className="pg-detail tr-abs" style={{ inset: 0 }}>
              <ListingPage id="olmos" />
            </div>
          </Browser>
        </Abs>
        {(['olmos', 'ribera', 'parque'] as const).map((id) => (
          <div key={id} className={`tr-abs lp-listing lp-${id}`}>
            <ListingCard id={id} className="is-big" />
          </div>
        ))}

        {/* Chapter 2 · the guided chat */}
        <Abs className="dev-phone">
          <Phone time="23:40">
            <ChatScreen />
          </Phone>
        </Abs>
        <Abs className="lp-inquiry">
          <NewInquiryCard kicker={tc('lupa.inquiry')} />
        </Abs>

        {/* Chapter 3 · the CRM */}
        <Abs className="dev-crm">
          <Browser url={`${SITE_URL}/crm`}>
            <CrmShell>
              <InboxPanel />
              <ContactPanel />
              <PipelinePanel />
              <AgendaPanel />
              <TasksPanel />
              <ListingsPanel />
              <TeamPanel />
            </CrmShell>
          </Browser>
        </Abs>
        <Abs className="lp-channels">
          <ChannelsCard title={tc('lupa.channels')} />
        </Abs>
        <Abs className="lp-history">
          <ContactHistory className="is-big" />
        </Abs>
        <Abs className="lp-visit">
          <NextVisitCard />
        </Abs>

        {/* Chapter 4 · the setup */}
        <Abs className="st-kit">
          <BrandKit />
        </Abs>
        <Abs className="dev-brand">
          <Browser url={listingPath('olmos').replace(/\/propiedad\/.*/, '')}>
            <div className="tr-abs" style={{ inset: 0 }}>
              <SiteHome base />
            </div>
            <div className="tr-wipe br-after">
              <SiteHome />
            </div>
            <i className="tr-wipe-edge br-edge" />
          </Browser>
        </Abs>
        <Abs className="st-audit">
          <ProfileAudit />
        </Abs>
        <Abs className="st-library">
          <LibraryFan />
        </Abs>
      </section>

      <Golpe
        id="giro"
        panels={[
          { p: '1', color: 'ink', text: g('g5') },
          { p: '2', color: 'cobalt', half: true, text: g('g6') },
        ]}
      />
      <Golpe
        id="marcha"
        panels={[
          { p: '1', color: 'cobalt', text: g('g7') },
          { p: '2', color: 'sand', half: true, text: g('g8') },
        ]}
      />
      <Golpe
        id="resumen"
        panels={[
          { p: '1', color: 'cobalt', text: g('s1') },
          { p: '2', color: 'stone', text: g('s2') },
          { p: '3', color: 'ink', text: g('s3') },
          { p: '4', color: 'sand', text: g('s4') },
        ]}
      />
      <Mark id="final" line={tx('plans.contact.tagline')} />
      <span hidden data-business={LUMEN.business} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* The timeline                                                         */
/* ------------------------------------------------------------------ */

export function buildContact(c: FilmCtx) {
  const { tl, L, q, one } = c;
  const place = (sel: string, p: { x: number; y: number; s: number }) => gsap.set(one(sel), { x: p.x, y: p.y, scale: p.s, transformOrigin: '0 0' });

  // Rest positions first (everything is measured there), then the motion.
  place('.dev-site', L.browser);
  place('.dev-crm', L.browser);
  place('.dev-brand', L.browser);
  place('.dev-phone', L.phone);
  gsap.set(one('.st-kit'), { x: L.vertical ? 60 : 800, y: L.vertical ? 820 : 220 });
  const auditAt = { x: L.vertical ? 50 : 790, y: L.vertical ? 800 : 250 };
  gsap.set(one('.st-audit'), auditAt);
  gsap.set(one('.st-library'), { x: L.vertical ? 25 : 790, y: L.vertical ? 800 : 210 });
  gsap.set(one('.tr-audit'), { width: L.vertical ? 980 : 1030 });
  // The operating guide lands on top of the fan, rotated, like a sheet left on the desk.
  const guideAt = { x: L.vertical ? 330 : 640, y: L.vertical ? 640 : 330 };
  gsap.set(q('.pg-detail, .br-after'), { autoAlpha: 0 });
  gsap.set(one('.pg-detail'), { autoAlpha: 1 });
  const homeCards = q('.pg-home .tr-listing').map((el) => center(c, el));
  const bookBtn = center(c, one('.tr-book-btn'));
  const dayChip = center(c, one('.tr-booking-day'));
  const timeChip = center(c, one('.tr-booking-time'));
  const confirm = center(c, one('.tr-booking-confirm'));
  const credit = center(c, one('.tr-chip-credit'));
  const phoneMid = center(c, one('.tr-phone'));
  const crmMid = center(c, one('.dev-crm .tr-crm-main'));
  // Slot n of a column, in the pipeline panel's own px (stage px ÷ the window's scale and the UI zoom inside it).
  const kPanel = box(c, one('.tr-panel[data-m="pipeline"]'));
  const sc = L.browser.s * UI_ZOOM.browser;
  const slot = (stage: string, n: number) => {
    const first = one(`.tr-kcol[data-s="${stage}"] .tr-kcard`);
    const b = box(c, first);
    return { x: (b.x - kPanel.x) / sc, y: (b.y - kPanel.y) / sc + n * (first.offsetHeight + 10) };
  };
  const visitNew = center(c, one('.tr-visit.is-new'));
  gsap.set(one('.pg-detail'), { autoAlpha: 0 });

  // Scenes on screen.
  span(c, '#gancho', 0, 4);
  span(c, '#marca', 4, 6);
  span(c, '#app', 6, 48);
  span(c, '#giro', 17.8, 20);
  span(c, '#marcha', 33.8, 36);
  span(c, '#resumen', 47.8, 52);
  span(c, '#final', 52, CONTACT_DURATION + 1);

  /* 0–4 · gancho */
  golpe(c, '#gancho', [
    { panel: '[data-p="1"]', at: 0, from: 'none' },
    { panel: '[data-p="2"]', at: 1, from: 'bottom', half: true },
    { panel: '[data-p="3"]', at: 2, from: 'left' },
    { panel: '[data-p="4"]', at: 3, from: 'bottom', half: true },
  ], { exit: true, end: 4 });

  /* 4–6 · marca */
  mark(c, '#marca', 4);

  /* chapter tags and headlines */
  tag(c, '.tg-web', 6.0, 14);
  tag(c, '.tg-chat', 14.0, 18);
  tag(c, '.tg-crm', 20.0, 34);
  tag(c, '.tg-setup', 36.0, 48);
  HEADS.forEach((h) => head(c, `.hd-${h}`, HEAD_TIMES[h][0], HEAD_TIMES[h][1]));

  /* 6–14 · the site */
  const site = one('.dev-site');
  tl.set(site, { autoAlpha: 0, x: L.browser.x + 220 }, 0);
  tl.to(site, { autoAlpha: 1, x: L.browser.x, duration: 0.7, ease: 'expo.out' }, 6.0);
  c.sfx('whoosh', 5.95, 0.5, 0.2);
  tl.to(site, { scale: L.browser.s * 1.02, duration: 1.9, ease: 'none' }, 6.1);
  // 8 · three listings leave the window (the lupa)
  const heads = one('.tr-heads');
  const tags = one('.tr-tags');
  if (L.headsUp) tl.to([heads, tags], { y: L.headsUp, duration: 0.5, ease: 'expo.out' }, 7.9).to([heads, tags], { y: 0, duration: 0.5, ease: 'expo.out' }, 10.8);
  tl.to(site, { autoAlpha: 0.22, duration: 0.3 }, 8.1).to(site, { autoAlpha: 1, duration: 0.3 }, 10.85);
  (['olmos', 'ribera', 'parque'] as const).forEach((id, i) => lupa(c, one(`.lp-${id} .tr-listing`), homeCards[i], L.row[i], 8.2 + i * 0.15, 10.9, { rot: L.vertical ? [-2, 2, 0][i] : 0 }));
  // 11 · the listing page and the booking
  tl.set(one('.pg-detail'), { autoAlpha: 0 }, 0);
  tl.to(one('.pg-detail'), { autoAlpha: 1, duration: 0.25 }, 11.0);
  tl.to(one('.pg-home'), { autoAlpha: 0, duration: 0.25 }, 11.0);
  tl.set(site, { scale: L.browser.s }, 11.0);
  tap(c, bookBtn, 11.4, 11.9);
  const booking = one('.tr-booking');
  tl.set(booking, { autoAlpha: 0, y: 16 }, 0);
  tl.to(booking, { autoAlpha: 1, y: 0, duration: 0.3, ease: 'expo.out' }, 12.0);
  tl.to(q('.pg-detail .tr-detail-facts, .tr-book-btn'), { autoAlpha: 0, duration: 0.2 }, 12.0);
  tap(c, dayChip, 12.1, 12.45, { chain: true });
  tap(c, timeChip, 12.5, 12.85, { chain: true });
  tl.set(one('.tr-booking-time'), { className: 'tr-chip tr-booking-time tr-booking-time-on' }, 12.85);
  tap(c, confirm, 12.9, 13.25, { chain: true });
  const booked = one('.tr-booked');
  tl.set(booked, { autoAlpha: 0, scale: 0.94 }, 0);
  tl.to(booking, { autoAlpha: 0, duration: 0.2 }, 13.35);
  tl.to(booked, { autoAlpha: 1, scale: 1, duration: 0.35, ease: 'expo.out' }, 13.35);
  c.sfx('bell', 13.35, 1318.5, 0.07, 0.7);
  c.sfx('bell', 13.42, 1975.5, 0.05, 0.7);
  fingerOut(c, 13.45);
  tl.to(site, { autoAlpha: 0, x: L.browser.x - 160, duration: 0.25, ease: 'power2.in' }, 13.85);

  /* 14–18 · the guided chat */
  const phone = one('.dev-phone');
  tl.set(phone, { autoAlpha: 0, y: L.phone.y + 260 }, 0);
  tl.to(phone, { autoAlpha: 1, y: L.phone.y, duration: 0.6, ease: 'expo.out' }, 14.0);
  const bubbles = ['.tr-b-ask', '.tr-b-hi', '.tr-b-pay', '.tr-b-chips'].map(one);
  tl.set([...bubbles, one('.tr-b-credit')], { autoAlpha: 0, y: 24 }, 0);
  bubbles.forEach((b, i) => {
    tl.to(b, { autoAlpha: 1, y: 0, duration: 0.35, ease: 'expo.out' }, 14.35 + i * 0.45);
    c.sfx('plip', 14.35 + i * 0.45, 0.18, i % 2 ? 700 : 520);
  });
  tap(c, credit, 15.9, 16.35);
  tl.to(one('.tr-b-chips'), { autoAlpha: 0, duration: 0.15 }, 16.4);
  tl.to(one('.tr-b-credit'), { autoAlpha: 1, y: 0, duration: 0.35, ease: 'expo.out' }, 16.45);
  fingerOut(c, 16.5);
  lupa(c, one('.lp-inquiry .tr-inquiry'), phoneMid, L.vertical ? { x: L.lupa.x, y: L.lupa.y - 60 } : { x: L.lupa.x, y: L.lupa.y - 30 }, 16.7, 17.85);
  tl.to(phone, { autoAlpha: 0, duration: 0.2 }, 17.8);

  /* 18–20 · giro */
  golpe(c, '#giro', [
    { panel: '[data-p="1"]', at: 18, from: 'right' },
    { panel: '[data-p="2"]', at: 19, from: 'bottom', half: true },
  ], { exit: true, end: 20 });

  /* 20–34 · the CRM, module by module */
  flash(c, 20, 0.85);
  const crm = one('.dev-crm');
  tl.set(crm, { autoAlpha: 0 }, 0);
  tl.set(crm, { autoAlpha: 1 }, 20);
  tl.set(crm, { scale: L.browser.s * 0.94 }, 20).to(crm, { scale: L.browser.s, duration: 0.6, ease: 'expo.out' }, 20);
  CRM_MODULES.forEach((m, i) => {
    const at = 20 + i * 2;
    const item = one(`.tr-crm-item[data-m="${m}"]`);
    const panel = one(`.tr-panel[data-m="${m}"]`);
    tl.set(item, { '--on': 0, color: 'var(--l-muted)', fontWeight: 400 }, 0);
    tl.to(item, { '--on': 1, color: 'var(--l-ink)', fontWeight: 650, duration: 0.25 }, at);
    tl.to(item, { '--on': 0, color: 'var(--l-muted)', fontWeight: 400, duration: 0.2 }, at + 1.95);
    // Cut on the beat: the next panel lands while this one goes (never an empty window).
    tl.set(panel, { autoAlpha: 0, x: 24 }, 0);
    tl.to(panel, { autoAlpha: 1, duration: 0.12 }, at).to(panel, { x: 0, duration: 0.4, ease: 'expo.out' }, at);
    if (i < CRM_MODULES.length - 1) tl.to(panel, { autoAlpha: 0, duration: 0.12 }, at + 2);
    c.sfx('tick', at, 0.08);
  });
  tl.to(crm, { autoAlpha: 0, duration: 0.2 }, 33.8);
  // inbox: rows by channel, then the week's inquiries leave the window
  const inRows = q('.tr-inbox-row');
  tl.set(inRows, { autoAlpha: 0, x: 30 }, 0);
  tl.to(inRows, { autoAlpha: 1, x: 0, duration: 0.35, ease: 'expo.out', stagger: 0.08 }, 20.25);
  lupa(c, one('.lp-channels .tr-channels'), crmMid, L.lupa, 20.75, 21.95);
  // contacts: the file and its history
  lupa(c, one('.lp-history .tr-history'), crmMid, L.lupa, 22.55, 23.95);
  const hist = q('.lp-history .tr-history-item');
  tl.set(hist, { autoAlpha: 0, x: -20 }, 0);
  tl.to(hist, { autoAlpha: 1, x: 0, duration: 0.3, ease: 'expo.out', stagger: 0.12 }, 22.8);
  // pipeline: Carolina moves from «Nuevo» to «Calificado»
  const card = one('.tr-kcard-carolina');
  gsap.set(card, { width: q('.tr-kcol .tr-kcard')[0].offsetWidth });
  const from = slot('new', 2);
  const to = slot('qualified', 2);
  tl.set(card, { x: from.x, y: from.y, rotation: 0, scale: 1 }, 0);
  tl.to(card, { rotation: -3, scale: 1.08, duration: 0.18, ease: 'power2.out' }, 24.6);
  tl.to(card, { x: to.x, y: to.y, duration: 0.55, ease: 'expo.inOut' }, 24.7);
  tl.to(card, { rotation: 0, scale: 1, duration: 0.25, ease: 'power2.out' }, 25.25);
  tl.set(one('.tr-score-a'), { autoAlpha: 1 }, 0).to(one('.tr-score-a'), { autoAlpha: 0, duration: 0.1 }, 25.3);
  tl.set(one('.tr-score-b'), { autoAlpha: 0 }, 0).to(one('.tr-score-b'), { autoAlpha: 1, duration: 0.1 }, 25.3);
  c.sfx('whoosh', 24.7, 0.4, 0.15);
  c.sfx('bell', 25.3, 1760, 0.06, 0.5);
  // agenda: the visit lands on Friday
  const visit = one('.tr-visit.is-new');
  tl.set(visit, { autoAlpha: 0, y: -40 }, 0);
  tl.to(visit, { autoAlpha: 1, y: 0, duration: 0.4, ease: 'expo.out' }, 26.5);
  c.sfx('bell', 26.5, 1318.5, 0.06, 0.6);
  lupa(c, one('.lp-visit .tr-nextvisit'), visitNew, L.lupa, 26.85, 27.95);
  // tasks: ticked one by one
  q('.tr-task').forEach((row, i) => {
    const at = 28.45 + i * 0.28;
    tl.set([row.querySelector('.tr-check-fill'), row.querySelector('.tr-check svg')], { autoAlpha: 0 }, 0);
    tl.to([row.querySelector('.tr-check-fill'), row.querySelector('.tr-check svg')], { autoAlpha: 1, duration: 0.12 }, at);
    c.sfx('tick', at, 0.1);
  });
  // listings: the portfolio rises
  const props = q('.tr-prop');
  tl.set(props, { autoAlpha: 0, y: 20 }, 0);
  tl.to(props, { autoAlpha: 1, y: 0, duration: 0.35, ease: 'expo.out', stagger: 0.07 }, 30.2);
  // team: two roles and their permissions
  const people = q('.tr-person');
  const perms = q('.tr-perm');
  tl.set([...people, ...perms], { autoAlpha: 0, y: 16 }, 0);
  tl.to(people, { autoAlpha: 1, y: 0, duration: 0.35, ease: 'expo.out', stagger: 0.12 }, 32.2);
  tl.to(perms, { autoAlpha: 1, y: 0, duration: 0.3, ease: 'expo.out', stagger: 0.08 }, 32.6);

  /* 34–36 · marcha */
  golpe(c, '#marcha', [
    { panel: '[data-p="1"]', at: 34, from: 'left' },
    { panel: '[data-p="2"]', at: 35, from: 'bottom', half: true },
  ], { exit: true, end: 36 });

  /* 36–48 · the setup: the brand */
  // 36 · the brand kit assembles
  const kit = one('.st-kit');
  tl.set(kit, { autoAlpha: 0 }, 0).set(kit, { autoAlpha: 1 }, 36).to(kit, { autoAlpha: 0, duration: 0.2 }, 38.8);
  const logos = q('.tr-kit-logo');
  const swatches = q('.tr-swatch');
  const type = q('.tr-kit-type > *');
  tl.set([...logos, ...swatches, ...type], { autoAlpha: 0, y: 30, scale: 0.94 }, 0);
  tl.to(logos, { autoAlpha: 1, y: 0, scale: 1, duration: 0.45, ease: 'expo.out', stagger: 0.12 }, 36.2);
  tl.to(swatches, { autoAlpha: 1, y: 0, scale: 1, duration: 0.4, ease: 'expo.out', stagger: 0.1 }, 36.75);
  tl.to(type, { autoAlpha: 1, y: 0, scale: 1, duration: 0.45, ease: 'expo.out', stagger: 0.12 }, 37.3);
  logos.forEach((_, i) => c.sfx('plip', 36.2 + i * 0.12, 0.16, 600 + i * 120));
  // 39 · from the template to the brand (an edge passes)
  const brandDev = one('.dev-brand');
  tl.set(brandDev, { autoAlpha: 0 }, 0).to(brandDev, { autoAlpha: 1, duration: 0.3 }, 39.0).to(brandDev, { autoAlpha: 0, duration: 0.2 }, 41.8);
  const after = one('.br-after');
  tl.set(after, { autoAlpha: 1, clipPath: 'inset(0 0 0 100%)' }, 0);
  tl.to(after, { clipPath: 'inset(0 0 0 0%)', duration: 0.9, ease: 'expo.inOut' }, 40.0);
  // The edge that passes (the motion signature's occultation): rides the wipe, gone once it is done.
  const edge = one('.br-edge');
  tl.set(edge, { x: 0, autoAlpha: 0 }, 0).set(edge, { autoAlpha: 1 }, 40.0);
  tl.to(edge, { x: -BROWSER.w / UI_ZOOM.browser, duration: 0.9, ease: 'expo.inOut' }, 40.0).set(edge, { autoAlpha: 0 }, 40.9);
  c.sfx('whoosh', 40.0, 0.9, 0.25);
  // 42 · the profiles' audit: each item gets its after
  const audit = one('.st-audit');
  tl.set(audit, { autoAlpha: 0, y: auditAt.y + 30 }, 0).to(audit, { autoAlpha: 1, y: auditAt.y, duration: 0.45, ease: 'expo.out' }, 42.0).to(audit, { autoAlpha: 0, duration: 0.2 }, 44.8);
  q('.tr-audit-after').forEach((a, i) => {
    const at = 42.6 + i * 0.4;
    tl.set(a, { autoAlpha: 0, x: -12 }, 0).to(a, { autoAlpha: 1, x: 0, duration: 0.3, ease: 'expo.out' }, at);
    c.sfx('tick', at, 0.1);
  });
  // 45 · hooks, example videos and the operating guide
  const lib = one('.st-library');
  tl.set(lib, { autoAlpha: 0 }, 0).set(lib, { autoAlpha: 1 }, 45).to(lib, { autoAlpha: 0, duration: 0.2 }, 47.8);
  const hooks = q('.tr-hook');
  const vids = q('.tr-video');
  const guide = one('.tr-guide');
  tl.set([...hooks, ...vids], { autoAlpha: 0, y: 40, rotation: 0 }, 0);
  tl.to(hooks, { autoAlpha: 1, y: 0, rotation: (i: number) => [-2, 1, -1, 2, -1, 1][i] ?? 0, duration: 0.45, ease: 'expo.out', stagger: 0.08 }, 45.2);
  tl.to(vids, { autoAlpha: 1, y: 0, duration: 0.45, ease: 'expo.out', stagger: 0.1 }, 45.8);
  tl.set(guide, { autoAlpha: 0, x: guideAt.x + 60, y: guideAt.y, rotation: 3 }, 0).to(guide, { autoAlpha: 1, x: guideAt.x, duration: 0.5, ease: 'expo.out' }, 46.4);
  c.sfx('whoosh', 45.2, 0.5, 0.15);
  c.sfx('bell', 46.4, 1568, 0.05, 0.5);

  /* 48–52 · resumen */
  golpe(c, '#resumen', [
    { panel: '[data-p="1"]', at: 48, from: 'right' },
    { panel: '[data-p="2"]', at: 49, from: 'left' },
    { panel: '[data-p="3"]', at: 50, from: 'bottom' },
    { panel: '[data-p="4"]', at: 51, from: 'right' },
  ], { end: 52 });

  /* 52–56 · final */
  flash(c, 52, 0.9);
  mark(c, '#final', 52, true);

  tl.set({}, {}, CONTACT_DURATION);
}

/** The brand moment: the glyph uncovers itself (a disc), the words rise. */
function mark(c: FilmCtx, scene: string, at: number, line = false) {
  const { tl } = c;
  const glyph = c.one(`${scene} .tr-mark-glyph`);
  const word = c.one(`${scene} .tr-mark-word`);
  const plan = c.one(`${scene} .tr-mark-plan`);
  tl.set(glyph, { clipPath: 'circle(0% at 50% 50%)', rotation: -30 }, 0);
  tl.to(glyph, { clipPath: 'circle(75% at 50% 50%)', rotation: 0, duration: 0.8, ease: 'expo.out' }, at + 0.05);
  tl.set([word, plan], { autoAlpha: 0, y: 40 }, 0);
  tl.to(word, { autoAlpha: 1, y: 0, duration: 0.6, ease: 'expo.out' }, at + 0.25);
  tl.to(plan, { autoAlpha: 1, y: 0, duration: 0.6, ease: 'expo.out' }, at + 0.5);
  if (line) {
    const l = c.one(`${scene} .tr-mark-line`);
    tl.set(l, { autoAlpha: 0, y: 20 }, 0).to(l, { autoAlpha: 1, y: 0, duration: 0.6, ease: 'expo.out' }, at + 0.8);
  }
}
