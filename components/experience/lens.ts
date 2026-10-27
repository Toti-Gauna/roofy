import { capabilityFromPlan, planIncludes, type PlanId } from '@/lib/plans';
import type { EstateTab } from '@/components/demos/real-estate/data';

/**
 * The catalog capability each area of the Lumen demo shows. The plan an area starts at is read from
 * the versioned catalog (`content/estateos-plans.json`), never written here. Areas the demo does not
 * have yet (administration, intelligence, …) arrive with their plan's lote (3.6–3.8d).
 */
const TAB_CAPABILITY: Record<EstateTab, string> = {
  today: 'crm_core',
  inbox: 'guided_chat',
  pipeline: 'crm_core',
  visits: 'crm_core',
  followups: 'whatsapp_auto',
  listings: 'web',
  site: 'web',
};

/** The plan an area starts at when `plan` does not include it; null when it is open (or no plan: the general demo). */
export function lockedFromFor(plan: PlanId | null, tab: EstateTab): PlanId | null {
  if (!plan) return null;
  const from = capabilityFromPlan(TAB_CAPABILITY[tab]) ?? 'contact';
  return planIncludes(plan, from) ? null : from;
}
