import type { DemoTourStep } from '@/components/demos/tourTypes';
import type { TourStep } from '@/components/ui/tour/types';

export type ViewTag = DemoTourStep['view'];

export interface GuideCopy {
  has: (key: string) => boolean;
  get: (key: string) => string;
  tag: (view: ViewTag) => string;
}

/**
 * The guide's steps ("Ver con guía"): ids from `real-estate/tour.ts`, copy from `demoTours.realEstate.<id>`.
 * A step whose copy is missing is left out (same rule as Eclipse-Web's `buildTourSteps`).
 */
export function buildTourSteps(demo: string, steps: readonly DemoTourStep[], copy: GuideCopy): (TourStep & { view: ViewTag })[] {
  return steps.flatMap((step) => {
    const base = `${demo}.${step.copy ?? step.id}`;
    if (!copy.has(`${base}.title`) || !copy.has(`${base}.body`)) return [];
    return [
      {
        id: step.id,
        view: step.view,
        targets: [`[data-tour="${step.id}"]`],
        title: copy.get(`${base}.title`),
        body: copy.get(`${base}.body`),
        tag: copy.tag(step.view),
      },
    ];
  });
}
