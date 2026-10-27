'use client';

import { useId, useState, type CSSProperties } from 'react';
import { useTranslations } from 'next-intl';
import { Check, ChevronDown, Copy, Lock } from 'lucide-react';
import { useSound } from '@/components/sound/SoundContext';
import { useConfirm } from '../../kit';
import { BRAND_BASE, BRAND_DELIVERABLES, BRAND_HOOKS, BRAND_SWATCHES, BRAND_VIDEOS, GUIDE_CHAPTERS, LUMEN_THEME, PROFILE_ITEMS, listingById, type ListingId } from '../data';
import { useEstate } from '../context';
import { Facade } from '../facade';
import { LumenMark, useEstateText, ViewHead } from '../ui';
import { ROLE_CAN, ROLE_OF } from '../data';

/**
 * «Marca» — the brand setup Contact includes (`setup_brand`, D19: included in the plan, bounded; what goes
 * beyond it is quoted). Its deliverables, as Lumen received them: the brand kit, the site and a listing with
 * the brand applied, the audit of two social profiles, 12 hooks with 6 example videos and the operating guide.
 * All of it is fictional demo material (Lumen is not a real agency).
 */

/** The deliverables and where each one is. */
function Deliverables() {
  const t = useTranslations('demoRealEstate.brand');
  return (
    <ol className="re-deliver" aria-label={t('deliverables')}>
      {BRAND_DELIVERABLES.map((d) => (
        <li key={d}>
          <Check aria-hidden strokeWidth={2.2} />
          <span className="min-w-0">
            <span className="re-deliver-name">{t(`items.${d}.name`)}</span>
            <span className="re-deliver-text">{t(`items.${d}.text`)}</span>
          </span>
        </li>
      ))}
    </ol>
  );
}

/** Logo, palette and type, as the agency uses them. */
function Kit() {
  const t = useTranslations('demoRealEstate.brand');
  return (
    <section className="re-panel re-kit" aria-label={t('kit')}>
      <h3 className="re-panel-title">{t('kit')}</h3>
      <div className="re-kit-logos">
        <span className="re-kit-logo" data-on="light">
          <LumenMark />
        </span>
        <span className="re-kit-logo" data-on="ink">
          <LumenMark />
        </span>
        <span className="re-kit-logo" data-on="accent">
          <LumenMark />
        </span>
      </div>
      <ul className="re-kit-swatches">
        {BRAND_SWATCHES.map((s) => (
          <li key={s.id}>
            <span aria-hidden className="re-swatch" style={{ background: s.hex } as CSSProperties} />
            <span className="re-swatch-name">{t(`swatches.${s.id}`)}</span>
            <span className="re-swatch-hex demo-num">{s.hex}</span>
          </li>
        ))}
      </ul>
      <div className="re-kit-type">
        <p className="re-kit-display demo-display">{t('typeDisplay')}</p>
        <p className="re-kit-body">{t('typeBody')}</p>
      </div>
    </section>
  );
}

/**
 * The site's header and a listing card with the base template or with Lumen's brand: the moment the setup
 * shows off (video P1, shot 6). The change is uncovered by an edge passing (clip-path); reduced motion: instant.
 */
function Applied() {
  const t = useTranslations('demoRealEstate.brand');
  const x = useEstateText();
  const { reduced, active } = useEstate();
  const { play } = useSound();
  const [branded, setBranded] = useState(true);
  const uid = useId();
  const l = listingById('olmos' as ListingId);
  const look = branded ? LUMEN_THEME : BRAND_BASE;
  const vars = {
    '--b-bg': look.bg,
    '--b-surface': look.surface,
    '--b-ink': look.ink,
    '--b-muted': look.muted,
    '--b-accent': look.accent,
    '--b-accent-ink': look.accentInk,
    '--b-line': look.line,
  } as CSSProperties;
  return (
    <section className="re-applied" aria-labelledby={`${uid}-t`}>
      <div className="flex flex-wrap items-center justify-between gap-[0.6em]">
        <h3 id={`${uid}-t`} className="re-panel-title">
          {t('applied')}
        </h3>
        <div className="re-segment" role="group" aria-label={t('applied')}>
          <button
            type="button"
            aria-pressed={!branded}
            onClick={() => {
              setBranded(false);
              if (active) play('select');
            }}
          >
            {t('before')}
          </button>
          <button
            type="button"
            aria-pressed={branded}
            onClick={() => {
              setBranded(true);
              if (active) play('select');
            }}
          >
            {t('after')}
          </button>
        </div>
      </div>
      <div key={branded ? 'b' : 'a'} className="re-applied-frame" data-branded={branded ? '' : undefined} data-instant={reduced ? '' : undefined} style={vars}>
        <div className="re-applied-bar">
          <span className="re-applied-logo">
            {branded ? <LumenMark /> : <span aria-hidden className="re-applied-blank" />}
            <span className={branded ? 'demo-display' : undefined}>{branded ? 'Lumen Propiedades' : t('baseName')}</span>
          </span>
          <span className="re-applied-nav">{t('navSample')}</span>
        </div>
        <div className="re-applied-card">
          <span className="re-applied-img">
            <Facade listing={l} />
          </span>
          <span className="re-applied-body">
            <span className={`re-applied-price ${branded ? 'demo-display' : ''}`}>{x.price(l.price)}</span>
            <span className="re-applied-street">{l.street}</span>
            <span className="re-applied-meta">
              {x.title(l.id)} · {x.rooms(l.id, true)}
            </span>
            <span className="re-applied-cta">{t('ctaSample')}</span>
          </span>
        </div>
      </div>
      <p className="re-quiet">{branded ? t('afterNote') : t('beforeNote')}</p>
    </section>
  );
}

/** The audit of two profiles: what each one had and what changed (bio, cover, highlights, call to action). */
function Profiles() {
  const t = useTranslations('demoRealEstate.brand');
  const [which, setWhich] = useState<'main' | 'second'>('main');
  return (
    <section className="re-panel" aria-label={t('profiles')}>
      <div className="flex flex-wrap items-center justify-between gap-[0.6em]">
        <h3 className="re-panel-title">{t('profiles')}</h3>
        <div className="re-segment" role="group" aria-label={t('profiles')}>
          {(['main', 'second'] as const).map((p) => (
            <button key={p} type="button" aria-pressed={which === p} onClick={() => setWhich(p)}>
              {t(`profile.${p}.name`)}
            </button>
          ))}
        </div>
      </div>
      <p className="re-profile-handle demo-num">{t(`profile.${which}.handle`)}</p>
      <table className="re-table re-audit">
        <caption className="sr-only">{t('auditCaption', { profile: t(`profile.${which}.name`) })}</caption>
        <thead>
          <tr>
            <th scope="col">{t('auditItem')}</th>
            <th scope="col">{t('auditBefore')}</th>
            <th scope="col">{t('auditAfter')}</th>
          </tr>
        </thead>
        <tbody>
          {PROFILE_ITEMS.map((item) => (
            <tr key={item}>
              <th scope="row">{t(`auditItems.${item}`)}</th>
              <td className="re-audit-before">{t(`profile.${which}.${item}.before`)}</td>
              <td className="re-audit-after">{t(`profile.${which}.${item}.after`)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

/** 12 hooks (copy one) and 6 example videos (each with its script): material to reuse, not exclusive ads. */
function Library() {
  const t = useTranslations('demoRealEstate.brand');
  const confirm = useConfirm();
  const { active } = useEstate();
  const { play } = useSound();
  const [openVideo, setOpenVideo] = useState<string | null>(null);
  const copy = async (text: string) => {
    try {
      await navigator.clipboard?.writeText(text);
    } catch {
      // Clipboard blocked: the hook is on screen anyway.
    }
    if (active) play('select');
    confirm({ text: t('hookCopied'), icon: Copy });
  };
  return (
    <section className="re-library" aria-label={t('library')}>
      <div className="re-panel">
        <h3 className="re-panel-title">{t('hooks', { count: BRAND_HOOKS.length })}</h3>
        <ul className="re-hooks">
          {BRAND_HOOKS.map((h) => {
            const text = t(`hook.${h.id}`);
            return (
              <li key={h.id}>
                <span className="re-hook-tag">{t(`hookTags.${h.tag}`)}</span>
                <span className="re-hook-text">{text}</span>
                <button type="button" className="re-icon-btn" aria-label={t('copyHook', { hook: text })} onClick={() => copy(text)}>
                  <Copy aria-hidden strokeWidth={1.7} />
                </button>
              </li>
            );
          })}
        </ul>
      </div>
      <div className="re-panel">
        <h3 className="re-panel-title">{t('videos', { count: BRAND_VIDEOS.length })}</h3>
        <ul className="re-videos">
          {BRAND_VIDEOS.map((v) => {
            const open = openVideo === v.id;
            return (
              <li key={v.id} className="re-video" data-open={open ? '' : undefined}>
                <button type="button" className="re-video-head" aria-expanded={open} onClick={() => setOpenVideo(open ? null : v.id)}>
                  <span className="re-video-thumb">
                    <Facade listing={listingById(v.listing)} />
                    <span className="re-video-len demo-num">{t('seconds', { seconds: v.seconds })}</span>
                  </span>
                  <span className="min-w-0 flex-1 text-left">
                    <span className="re-video-title">{t(`video.${v.id}.title`)}</span>
                    <span className="re-video-format">{t(`formats.${v.format}`)}</span>
                  </span>
                  <ChevronDown aria-hidden strokeWidth={1.7} className="re-video-chev" />
                </button>
                {open ? (
                  <ol className="re-video-script">
                    {(['a', 'b', 'c'] as const).map((k) => (
                      <li key={k}>{t(`video.${v.id}.${k}`)}</li>
                    ))}
                  </ol>
                ) : null}
              </li>
            );
          })}
        </ul>
        <p className="re-quiet">{t('videosNote')}</p>
      </div>
    </section>
  );
}

/** The operating guide: how the team uses the product day to day. */
function Guide() {
  const t = useTranslations('demoRealEstate.brand');
  return (
    <section className="re-panel" aria-label={t('guide')}>
      <h3 className="re-panel-title">{t('guide')}</h3>
      <ol className="re-guide">
        {GUIDE_CHAPTERS.map((c) => (
          <li key={c}>
            <span className="re-guide-name">{t(`chapters.${c}.name`)}</span>
            <span className="re-guide-text">{t(`chapters.${c}.text`)}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}

/** Only the owner changes the brand (basic roles): an advisor sees it read-only. */
function ReadOnlyNote() {
  const t = useTranslations('demoRealEstate.brand');
  const { state } = useEstate();
  if (ROLE_CAN[ROLE_OF[state.viewAs]].site === true) return null;
  return (
    <p className="re-viewing">
      <Lock aria-hidden strokeWidth={1.8} />
      <span>{t('readOnly')}</span>
    </p>
  );
}

export function LaptopBrand() {
  const t = useTranslations('demoRealEstate.brand');
  return (
    <div className="flex flex-col gap-[1em]">
      <ViewHead title={t('title')} sub={t('sub')} />
      <ReadOnlyNote />
      <div className="re-brand-top">
        <Deliverables />
        <Applied />
      </div>
      <div className="re-brand-grid">
        <Kit />
        <Profiles />
      </div>
      <Library />
      <Guide />
    </div>
  );
}

export function PhoneBrand() {
  const t = useTranslations('demoRealEstate.brand');
  return (
    <div className="flex flex-col gap-[0.9em] pt-[0.3em]">
      <ViewHead title={t('title')} sub={t('sub')} />
      <ReadOnlyNote />
      <Applied />
      <Deliverables />
      <Kit />
      <Profiles />
      <Library />
      <Guide />
    </div>
  );
}
