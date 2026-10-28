import { describe, expect, it } from 'vitest';
import { pickStops } from '@/components/tour/autoTour';
import { SITE_SECTIONS, sectionNumber, sectionPhase } from '@/lib/sections';

describe('automatic tour · pickStops', () => {
  it('keeps the first stop and skips the ones still on screen', () => {
    // A wide screen: the section head and the ledger rows fit in one screen → one stop.
    expect(pickStops([1000, 1100, 1400], 900)).toEqual([0]);
    // A phone: the ledger is long → the head, then each row half a screen further.
    expect(pickStops([1000, 1500, 2100, 2200], 760)).toEqual([0, 1, 2]);
  });

  it('is empty without stops', () => {
    expect(pickStops([], 900)).toEqual([]);
  });
});

describe('home sections', () => {
  it('numbers them in page order and runs the eclipse from totality to the full sun', () => {
    expect(SITE_SECTIONS.map(sectionNumber)).toEqual(['01', '02', '03']);
    expect(sectionPhase('inicio')).toBe(1);
    expect(sectionPhase('otros-negocios')).toBe(0);
  });
});
