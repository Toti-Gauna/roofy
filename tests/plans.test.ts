import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { PLANS } from '@/lib/handoff';
import { CATALOG_DIGEST, CATALOG_VERSION, PLAN_IDS, capabilityFromPlan, planIncludes, planInfo, planOrder, planPhase } from '@/lib/plans';

const raw = JSON.parse(readFileSync(new URL('../content/estateos-plans.json', import.meta.url), 'utf8')) as Record<string, unknown>;

describe('the EstateOS plan catalog (copy of Eclipse-Web docs/v3/estateos/catalogo-estateos.v3.json)', () => {
  it('carries the digest of its own data, and Eclipse-Web pins the same one', () => {
    const { digest, ...data } = raw;
    expect(digest).toBe(createHash('sha256').update(JSON.stringify(data)).digest('hex'));
    expect(CATALOG_DIGEST).toBe('42b268777840a7001524fe83575e429b5a3326e8f1c01f66eb4223f4b51ea25c');
    expect(CATALOG_VERSION).toBe('estateos-2026-10-27-v3');
  });

  it('is the six-level ladder with the owner’s prices and Partner as a proposal', () => {
    expect(PLAN_IDS.map((id) => [id, planInfo(id).priceUsdMonthly, planInfo(id).priceStatus === 'proposal'])).toEqual([
      ['contact', 30, false],
      ['growth', 75, false],
      ['escalar', 100, false],
      ['hipergrowth', 150, false],
      ['deluxe', 200, false],
      ['partner', 500, true],
    ]);
  });

  it('the link contract and the catalog name the same plans', () => {
    expect([...PLANS]).toEqual([...PLAN_IDS]);
  });

  it('a plan includes itself and everything below it', () => {
    expect(planIncludes('growth', 'contact')).toBe(true);
    expect(planIncludes('contact', 'growth')).toBe(false);
    expect(planIncludes('partner', 'partner')).toBe(true);
    expect(PLAN_IDS.map(planOrder)).toEqual([0, 1, 2, 3, 4, 5]);
  });

  it('the phase of the eclipse grows with the plan and Partner is totality', () => {
    const phases = PLAN_IDS.map(planPhase);
    expect([...phases].sort((a, b) => a - b)).toEqual(phases);
    expect(planPhase('partner')).toBe(1);
  });

  it('every capability starts at a real plan', () => {
    const capabilities = raw.capabilities as { id: string }[];
    for (const c of capabilities) expect(PLAN_IDS, c.id).toContain(capabilityFromPlan(c.id));
  });
});
