'use client';

import { lazy, Suspense, useCallback, useMemo, useRef, useState, type ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { Monitor, Smartphone, Compass, Play } from 'lucide-react';
import { Tour } from '@/components/ui/tour/Tour';
import { useTourCopy } from '@/components/ui/tour/useTourCopy';
import type { TourStep } from '@/components/ui/tour/types';
import { SoundToggle } from '@/components/sound/SoundToggle';
import { useSound } from '@/components/sound/SoundContext';
import { LensProvider, type Lens } from '@/components/demos/real-estate/lens';
import { contactTour, tour } from '@/components/demos/real-estate/tour';
import { LUMEN } from '@/components/demos/real-estate/data';
import { useIsClient } from '@/components/motion/useIsClient';
import { parseHandoff, type Locale } from '@/lib/handoff';
import { isPlanId, planInfo, PLAN_DEMO_STATUS, type PlanId } from '@/lib/plans';
import { videoFor } from '@/lib/videos';
import { useMediaQuery } from '@/lib/useMediaQuery';
import { useSearch } from '@/lib/useSearch';
import { Entry } from './Entry';
import { PlanMenu } from './PlanMenu';
import { VideoPlayer } from './VideoPlayer';
import { buildTourSteps, type ViewTag } from './guide';
import { beatLimitFor, lockedFromFor } from './lens';
import './experience.css';

const RealEstateDemo = lazy(() => import('@/components/demos/real-estate/RealEstateDemo'));

type Mode = 'entry' | 'guide' | 'own';

/** From this width the phone view docks beside the desktop view; below it, one view at a time. */
const DUAL = '(min-width: 1280px)';
/** Below this width the phone is the view you start with (on a real phone the logic is inverted: D35). */
const COMPACT = '(max-width: 699px)';

const nextFrame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

/** Writes the plan into the address bar (the rest of the query is kept) so the link can be shared. */
function writePlan(plan: PlanId | null) {
  try {
    const params = new URLSearchParams(window.location.search);
    params.delete('plan');
    if (plan) params.set('plan', plan);
    const query = params.toString();
    window.history.replaceState(window.history.state, '', `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`);
  } catch {
    // History unavailable (sandboxed frame): the lens still works for this visit.
  }
}

/**
 * EstateOS' stage (lote 3.5, D35): Lumen full screen, a bottom bar with the plan lens, the guide,
 * sound and — at the bottom right — the phone view. Every load offers «Ver con guía» / «Ver por mi
 * cuenta»; nothing is remembered. `nav` is the server-rendered top row (way back to Eclipse + languages).
 */
export function Experience({ locale, nav }: { locale: Locale; nav: ReactNode }) {
  const t = useTranslations('experience');
  const tt = useTranslations('tour');
  const td = useTranslations('demoTours');
  const ts = useTranslations('demoShowcase');
  const { play } = useSound();
  const client = useIsClient();
  const dual = useMediaQuery(DUAL);
  const compact = useMediaQuery(COMPACT);

  const business = LUMEN.business;
  const stage = useRef<HTMLElement>(null);
  const [mode, setMode] = useState<Mode>('entry');
  const [guideRun, setGuideRun] = useState(0);
  // The link may carry the plan whose demo opens (`?plan=`; the contract's allow-list already filtered it);
  // once the visitor picks one in the bar, that choice wins.
  const search = useSearch();
  const linkPlan = parseHandoff(locale, search).plan;
  const [picked, setPicked] = useState<{ plan: PlanId | null } | null>(null);
  const plan = picked ? picked.plan : linkPlan && isPlanId(linkPlan) ? linkPlan : null;
  const [phonePick, setPhonePick] = useState<boolean | null>(null);
  const [videoOpen, setVideoOpen] = useState(false);
  const phoneOpen = phonePick ?? compact;

  const setPlan = useCallback((next: PlanId | null) => {
    setPicked({ plan: next });
    writePlan(next);
  }, [setPicked]);

  const lens = useMemo<Lens>(
    () => ({
      plan,
      lockedFrom: (tab) => lockedFromFor(plan, tab),
      beatLimit: beatLimitFor(plan),
      seePlan: (next) => {
        play('select');
        setPlan(next);
      },
    }),
    [plan, play, setPlan],
  );

  const copy = useTourCopy(tt('labelFor', { name: business }));
  const steps = useMemo(
    () =>
      buildTourSteps('realEstate', plan === 'contact' ? contactTour : tour, {
        has: (key) => td.has(key as never),
        get: (key) => td(key as never),
        tag: (view: ViewTag) => tt(view === 'laptop' ? 'tagDesktop' : view === 'phone' ? 'tagMobile' : 'tagBoth'),
      }),
    [td, tt, plan],
  );

  const onStep = useCallback(
    async (step: TourStep) => {
      const want = (step as TourStep & { view?: ViewTag }).view;
      if (dual || !want || want === 'both') return;
      setPhonePick(want === 'phone');
      // Wait (≤ 1.5 s) for the step's target to mount in the view just shown.
      for (let i = 0; i < 90; i++) {
        await nextFrame();
        if (step.targets.some((sel) => stage.current?.querySelector(sel))) break;
      }
    },
    [dual],
  );

  const startGuide = () => {
    play('open');
    // Wide screens: both views are lit by the guide ("Las dos vistas").
    if (dual) setPhonePick(true);
    setGuideRun((n) => n + 1);
    setMode('guide');
  };
  const startOwn = () => {
    play('select');
    setMode('own');
  };

  // The video of the plan in view (none exists until V1–V5 are rendered: then there is no button).
  const video = videoFor(plan);
  const videoLabel = plan ? t('video.label', { plan: planInfo(plan).name }) : t('video.general');
  const draft = PLAN_DEMO_STATUS[plan ?? 'contact'] === 'draft';
  const pending = mode === 'entry';
  const phoneLabel = ts('phoneLabel', { business });
  const laptopLabel = ts('laptopLabel', { business });

  const fallback = (
    <span role="status" className="sr-only">
      {ts('loading', { business })}
    </span>
  );
  const view = (kind: 'laptop' | 'phone') => (
    <Suspense fallback={fallback}>
      <RealEstateDemo screen={kind} active={!pending} />
    </Suspense>
  );

  // Wide: both views are always mounted (they share one story); the phone is only shown on request.
  // Narrow: one view at a time, the store is kept by the host (kit/store.ts → findShowcaseHost).
  const showLaptop = dual || !phoneOpen;
  const showPhone = dual || phoneOpen;

  return (
    <div className="xp theme-dark corona-glow" data-mode={mode} data-dual={dual || undefined} data-phone={phoneOpen || undefined}>
      <header className="xp-top container-x">{nav}</header>
      <p className="xp-notice container-x">
        <span className="xp-demo">{t('stage.fictional')}</span>
        {draft ? <span className="xp-draft">{t('stage.draft')}</span> : null}
      </p>
      <h1 className="sr-only">{t('stage.label')}</h1>

      <main id="contenido" ref={stage} className="xp-stage" data-demo-host inert={pending || undefined}>
        {client ? (
          <LensProvider value={lens}>
            <div className="xp-views">
              {showLaptop ? (
                <div role="region" aria-label={laptopLabel} className="device-laptop xp-pane" data-kind="laptop">
                  <div className="device-screen xp-screen">{view('laptop')}</div>
                </div>
              ) : null}
              {showPhone ? (
                <div role="region" aria-label={phoneLabel} className="device-phone xp-pane" data-kind="phone" hidden={dual && !phoneOpen} id="xp-phone">
                  <div className="device-screen xp-screen">{view('phone')}</div>
                </div>
              ) : null}
            </div>
          </LensProvider>
        ) : null}
      </main>

      <div className="xp-bar" role="group" aria-label={t('stage.barLabel')} inert={pending || undefined}>
        <PlanMenu plan={plan} onPick={setPlan} />
        <div className="xp-bar-right">
          {video ? (
            <button type="button" className="xp-btn" onClick={() => setVideoOpen(true)}>
              <Play aria-hidden strokeWidth={1.5} />
              <span className="xp-btn-text">{t('video.open')}</span>
            </button>
          ) : null}
          <button type="button" className="xp-btn" onClick={startGuide}>
            <Compass aria-hidden strokeWidth={1.5} />
            <span className="xp-btn-text">{t('stage.guideStart')}</span>
          </button>
          <SoundToggle className="xp-sound" />
          <button
            type="button"
            className="xp-btn"
            aria-controls={dual ? 'xp-phone' : undefined}
            aria-pressed={dual ? phoneOpen : undefined}
            onClick={() => {
              play('toggle');
              setPhonePick(!phoneOpen);
            }}
          >
            {!dual && phoneOpen ? <Monitor aria-hidden strokeWidth={1.5} /> : <Smartphone aria-hidden strokeWidth={1.5} />}
            <span className="xp-btn-text">{dual ? (phoneOpen ? t('stage.hidePhone') : t('stage.showPhone')) : phoneOpen ? t('stage.showDesktop') : t('stage.showPhone')}</span>
          </button>
        </div>
      </div>

      {video && videoOpen ? <VideoPlayer video={video} label={videoLabel} onClose={() => setVideoOpen(false)} /> : null}

      {pending ? <Entry onGuide={startGuide} onOwn={startOwn} /> : null}

      {mode === 'guide' ? (
        <Tour
          key={guideRun}
          open
          steps={steps}
          copy={copy}
          root={() => stage.current}
          onStep={onStep}
          onClose={() => setMode('own')}
        />
      ) : null}
    </div>
  );
}
