'use client';

import { useTranslations } from 'next-intl';
import { Lock } from 'lucide-react';
import { planInfo, type PlanId } from '@/lib/plans';
import type { EstateTab } from './data';
import { useLens } from './lens';

/**
 * An area that belongs to a higher plan (roofy). It says which plan brings it, the plan's price
 * (from the versioned catalog, never typed here) and offers that plan's demo.
 */
export function LockedArea({ tab, from }: { tab: EstateTab; from: PlanId }) {
  const t = useTranslations('demoRealEstate');
  const te = useTranslations('experience');
  const { seePlan } = useLens();
  const info = planInfo(from);
  return (
    <section className="re-locked" aria-labelledby={`re-locked-${tab}`}>
      <Lock aria-hidden strokeWidth={1.5} className="re-locked-icon" />
      <p className="re-locked-kicker demo-label">{te('locked.from', { plan: info.name })}</p>
      <h2 id={`re-locked-${tab}`} className="re-locked-title demo-display">
        {t(`nav.${tab}`)}
      </h2>
      <p className="re-locked-body">{te('locked.body', { area: t(`nav.${tab}`), plan: info.name })}</p>
      <p className="re-locked-price demo-num">
        {te('locked.price', { price: info.priceUsdMonthly })}
        {info.priceStatus === 'proposal' ? ` · ${te('stage.proposal')}` : ''}
      </p>
      <button type="button" className="re-locked-cta" onClick={() => seePlan(from)}>
        {te('locked.seePlan', { plan: info.name })}
      </button>
    </section>
  );
}
