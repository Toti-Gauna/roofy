'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Check, ChevronUp } from 'lucide-react';
import { PhaseGlyph } from '@/components/ui/PhaseGlyph';
import { PLAN_IDS, planInfo, planPhase, type PlanId } from '@/lib/plans';
import { useSound } from '@/components/sound/SoundContext';

/**
 * The plan lens: «Todos los planes» (the general demo, everything open) or one of the six plans.
 * Names and prices come from the versioned catalog (`lib/plans.ts`); a plan whose price is only a
 * proposal says so instead of showing a number.
 */
export function PlanMenu({ plan, onPick }: { plan: PlanId | null; onPick: (plan: PlanId | null) => void }) {
  const t = useTranslations('experience');
  const { play } = useSound();
  const uid = useId();
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      e.stopPropagation();
      setOpen(false);
      trigger.current?.focus();
    };
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const price = (id: PlanId) => {
    const info = planInfo(id);
    return info.priceStatus === 'proposal' ? t('stage.proposal') : t('locked.price', { price: info.priceUsdMonthly });
  };
  const pick = (next: PlanId | null) => {
    setOpen(false);
    trigger.current?.focus();
    if (next !== plan) {
      play('select');
      onPick(next);
    }
  };

  return (
    <div ref={root} className="xp-plan">
      <button
        ref={trigger}
        type="button"
        className="xp-btn xp-plan-trigger"
        aria-expanded={open}
        aria-controls={`${uid}-list`}
        aria-label={`${t('stage.planMenu')}: ${plan ? planInfo(plan).name : t('stage.allPlans')}`}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="xp-plan-label">{t('stage.plan')}</span>
        <span className="xp-plan-name">{plan ? planInfo(plan).name : t('stage.allPlans')}</span>
        {plan ? <span className="xp-plan-price readout">{price(plan)}</span> : null}
        <ChevronUp aria-hidden strokeWidth={1.5} className="xp-chev" data-open={open || undefined} />
      </button>
      {open ? (
        <ul id={`${uid}-list`} className="xp-plan-list" aria-label={t('stage.planMenu')}>
          <li>
            <button type="button" className="xp-plan-item" aria-current={plan === null ? 'true' : undefined} onClick={() => pick(null)}>
              <span className="xp-plan-glyph" aria-hidden />
              <span className="xp-plan-item-main">
                <span className="xp-plan-item-name">{t('stage.allPlans')}</span>
              </span>
              {plan === null ? <Check aria-hidden strokeWidth={1.5} className="xp-check" /> : null}
            </button>
          </li>
          {PLAN_IDS.map((id) => (
            <li key={id}>
              <button type="button" className="xp-plan-item" aria-current={plan === id ? 'true' : undefined} onClick={() => pick(id)}>
                <PhaseGlyph phase={planPhase(id)} size={20} className="xp-plan-glyph" />
                <span className="xp-plan-item-main">
                  <span className="xp-plan-item-name">{planInfo(id).name}</span>
                  <span className="xp-plan-item-tag">{t(`plans.${id}.tagline`)}</span>
                </span>
                <span className="xp-plan-item-price readout">{price(id)}</span>
                {plan === id ? <Check aria-hidden strokeWidth={1.5} className="xp-check" /> : null}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
