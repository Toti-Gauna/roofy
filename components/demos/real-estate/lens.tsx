'use client';

import { createContext, useContext } from 'react';
import type { PlanId } from '@/lib/plans';
import type { EstateTab } from './data';

/**
 * The plan "lens" (roofy, lote 3.5): which areas of the demo the chosen plan includes. Without a
 * provider (or with `plan: null`, the general demo) every area is open.
 */
export interface Lens {
  /** The plan the visitor is looking at, or null for the general demo (everything open). */
  plan: PlanId | null;
  /** The plan an area starts at, when the current plan does not include it (null = open). */
  lockedFrom: (tab: EstateTab) => PlanId | null;
  /** «Ver demo de <plan>»: switch the demo to that plan. */
  seePlan: (plan: PlanId) => void;
}

export const OPEN_LENS: Lens = { plan: null, lockedFrom: () => null, seePlan: () => {} };

const LensCtx = createContext<Lens>(OPEN_LENS);
export const LensProvider = LensCtx.Provider;
export const useLens = (): Lens => useContext(LensCtx);
