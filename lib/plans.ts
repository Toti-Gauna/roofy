import catalog from '@/content/estateos-plans.json';

/**
 * The six EstateOS plans and what each one includes, from the versioned catalog copy in
 * `content/estateos-plans.json` (a subset of Eclipse-Web's `docs/v3/estateos/catalogo-estateos.v3.json`;
 * `tests/plans.test.ts` pins its digest, and Eclipse-Web pins the same one). Prices live ONLY there:
 * components read them through `planPrice`, never write a number.
 */
export const PLAN_IDS = ['contact', 'growth', 'escalar', 'hipergrowth', 'deluxe', 'partner'] as const;
export type PlanId = (typeof PLAN_IDS)[number];

export const CATALOG_VERSION: string = catalog.catalogVersion;
export const CATALOG_DIGEST: string = catalog.digest;

export const isPlanId = (value: unknown): value is PlanId => typeof value === 'string' && (PLAN_IDS as readonly string[]).includes(value);

/** Position in the ladder (0 = Contact). A plan includes everything of the plans below it. */
export const planOrder = (id: PlanId): number => PLAN_IDS.indexOf(id);

/** The plan's phase of the eclipse (`PhaseGlyph`): 1/6 … 1 (totality). The only level symbol. */
export const planPhase = (id: PlanId): number => (planOrder(id) + 1) / PLAN_IDS.length;

export interface PlanInfo {
  id: PlanId;
  name: string;
  priceUsdMonthly: number;
  /** `proposal` (Partner) is not an approved price. */
  priceStatus: string;
  capabilityIds: readonly string[];
}

const PLAN_BY_ID = new Map<string, PlanInfo>(catalog.plans.map((p) => [p.id, p as PlanInfo]));

export function planInfo(id: PlanId): PlanInfo {
  const info = PLAN_BY_ID.get(id);
  if (!info) throw new Error(`Unknown plan ${id}`);
  return info;
}

/** Does `plan` include what `from` brings (itself and everything below it)? */
export const planIncludes = (plan: PlanId, from: PlanId): boolean => planOrder(plan) >= planOrder(from);

/** The plan an area or capability starts at. */
export function capabilityFromPlan(capabilityId: string): PlanId | null {
  const c = catalog.capabilities.find((x) => x.id === capabilityId);
  return c && isPlanId(c.fromPlan) ? c.fromPlan : null;
}

/**
 * Honesty about progress: whether the plan's demo already shows everything the plan includes.
 * Every plan starts as `draft` (lote 3.5 builds the frame); lotes 3.6–3.8d flip each one to
 * `built` as its areas land. While `draft`, the stage says so.
 */
export const PLAN_DEMO_STATUS: Record<PlanId, 'built' | 'draft'> = {
  contact: 'draft',
  growth: 'draft',
  escalar: 'draft',
  hipergrowth: 'draft',
  deluxe: 'draft',
  partner: 'draft',
};
