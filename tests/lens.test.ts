import { describe, expect, it } from 'vitest';
import { lockedFromFor } from '@/components/experience/lens';
import { PLAN_IDS } from '@/lib/plans';
import type { EstateTab } from '@/components/demos/real-estate/data';

const TABS: EstateTab[] = ['today', 'inbox', 'contacts', 'pipeline', 'visits', 'tasks', 'followups', 'listings', 'site', 'brand', 'team'];

describe('the plan lens', () => {
  it('the general demo opens every area', () => {
    for (const tab of TABS) expect(lockedFromFor(null, tab)).toBeNull();
  });

  it('Contact has the base product and locks the WhatsApp follow-ups, which start at Growth', () => {
    expect(TABS.filter((tab) => lockedFromFor('contact', tab))).toEqual(['followups']);
    expect(lockedFromFor('contact', 'followups')).toBe('growth');
  });

  it('from Growth up nothing is locked', () => {
    for (const plan of PLAN_IDS.filter((id) => id !== 'contact')) for (const tab of TABS) expect(lockedFromFor(plan, tab), `${plan}/${tab}`).toBeNull();
  });
});

describe('how much of the story each plan shows', () => {
  it('Contact ends with the visit booked (the WhatsApp follow-up is Growth); Growth and up, and the general demo, show it all', async () => {
    const { beatLimitFor } = await import('@/components/experience/lens');
    expect(beatLimitFor('contact')).toBe(3);
    expect(beatLimitFor('growth')).toBeUndefined();
    expect(beatLimitFor('partner')).toBeUndefined();
    expect(beatLimitFor(null)).toBeUndefined();
  });
});
