import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  BASE_LEADS,
  BASE_TASKS,
  BRAND_DELIVERABLES,
  BRAND_HOOKS,
  BRAND_VIDEOS,
  CAL_DAYS,
  CONTACT_PHONE,
  LEAD_ADVISOR,
  LISTINGS,
  PERMISSIONS,
  ROLE_CAN,
} from '@/components/demos/real-estate/data';
import { PLAN_DEMO_STATUS } from '@/lib/plans';

type Tree = { [key: string]: Tree | string };
const load = (locale: string): Tree => JSON.parse(readFileSync(new URL(`../messages/${locale}.json`, import.meta.url), 'utf8')) as Tree;
const strings = (tree: Tree): string[] => Object.values(tree).flatMap((v) => (typeof v === 'string' ? [v] : strings(v)));

describe('Contact (lote 3.6)', () => {
  it('is complete: its demo shows everything the plan includes', () => {
    expect(PLAN_DEMO_STATUS.contact).toBe('built');
  });

  it.each(['es', 'en', 'pt'])('%s: the site chat is a guided chat, never presented as AI (D20; no plan sells an AI site chat)', (locale) => {
    const m = load(locale);
    const demo = strings(m.demoRealEstate as Tree).concat(strings(m.demoTours as Tree));
    const ai = demo.filter((s) => /\b(IA|AI)\b|asistente IA|AI assistant|assistente de IA|inteligencia artificial|artificial intelligence/i.test(s));
    expect(ai).toEqual([]);
  });

  it('the brand setup delivers what the catalog says: 12 hooks and 6 example videos, plus the operating guide', () => {
    expect(BRAND_HOOKS).toHaveLength(12);
    expect(BRAND_VIDEOS).toHaveLength(6);
    expect(BRAND_DELIVERABLES).toContain('guide');
    for (const locale of ['es', 'en', 'pt']) {
      const brand = (load(locale).demoRealEstate as Tree).brand as Tree;
      for (const h of BRAND_HOOKS) expect(((brand.hook as Tree)[h.id] as string).length, `${locale} ${h.id}`).toBeGreaterThan(10);
      for (const v of BRAND_VIDEOS) for (const k of ['title', 'a', 'b', 'c']) expect(((brand.video as Tree)[v.id] as Tree)[k], `${locale} ${v.id}.${k}`).toBeTruthy();
    }
  });

  it('every contact has an owner and a fictional phone (5550 range); every task points at a real contact and a calendar day', () => {
    for (const l of BASE_LEADS) expect(LEAD_ADVISOR[l.id]).toBeDefined();
    expect(LEAD_ADVISOR.carolina).toBe('julia');
    for (const phone of Object.values(CONTACT_PHONE)) expect(phone).toMatch(/5550-01\d\d$/);
    for (const k of BASE_TASKS) {
      expect(BASE_LEADS.some((l) => l.id === k.person), k.id).toBe(true);
      expect(CAL_DAYS as readonly number[], k.id).toContain(k.day);
    }
  });

  it('basic roles: the owner can do everything; an agent works only their own contacts and cannot change the brand or invite', () => {
    for (const p of PERMISSIONS) expect(ROLE_CAN.admin[p]).toBe(true);
    expect(ROLE_CAN.advisor.seeAll).toBe('own');
    expect(ROLE_CAN.advisor.site).toBe(false);
    expect(ROLE_CAN.advisor.users).toBe(false);
  });

  it('every listing has a description in the three languages', () => {
    for (const locale of ['es', 'en', 'pt']) {
      const desc = ((load(locale).demoRealEstate as Tree).listing as Tree).desc as Tree;
      for (const l of LISTINGS) expect((desc[l.id] as string).length, `${locale} ${l.id}`).toBeGreaterThan(40);
    }
  });
});
