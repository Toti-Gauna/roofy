import { capabilityFromPlan, planIncludes, type PlanId } from '@/lib/plans';
import { BEATS, type EstateBeatId, type EstateTab } from '@/components/demos/real-estate/data';

/**
 * The catalog capability each area of the Lumen demo shows. The plan an area starts at is read from
 * the versioned catalog (`content/estateos-plans.json`), never written here. Areas the demo does not
 * have yet (administration, intelligence, …) arrive with their plan's lote (3.6–3.8d).
 */
const TAB_CAPABILITY: Record<EstateTab, string> = {
  today: 'crm_core',
  inbox: 'guided_chat',
  contacts: 'crm_core',
  pipeline: 'crm_core',
  visits: 'crm_core',
  tasks: 'crm_core',
  followups: 'whatsapp_auto',
  listings: 'web',
  site: 'web',
  brand: 'setup_brand',
  team: 'crm_core',
};

/** The plan an area starts at when `plan` does not include it; null when it is open (or no plan: the general demo). */
export function lockedFromFor(plan: PlanId | null, tab: EstateTab): PlanId | null {
  if (!plan) return null;
  const from = capabilityFromPlan(TAB_CAPABILITY[tab]) ?? 'contact';
  return planIncludes(plan, from) ? null : from;
}

/** The catalog capability a beat of the story shows (beats not listed are part of the base product). */
const BEAT_CAPABILITY: Partial<Record<EstateBeatId, string>> = { followup: 'whatsapp_auto', reply: 'whatsapp_auto' };

/**
 * How many beats of the story `plan` shows: the story stops before the first beat whose capability the plan
 * doesn't include (Contact: inquiry, qualification and visit; the WhatsApp follow-up is Growth). Undefined: all.
 */
export function beatLimitFor(plan: PlanId | null): number | undefined {
  if (!plan) return undefined;
  const i = BEATS.findIndex((b) => {
    const cap = BEAT_CAPABILITY[b.id];
    return cap ? !planIncludes(plan, capabilityFromPlan(cap) ?? 'contact') : false;
  });
  return i < 0 ? undefined : i;
}
