/**
 * CSS transitions and Web Animations run on the browser's real clock, which the render driver does not
 * control (it simulates timers, `Date` and `requestAnimationFrame`, not the compositor). So every frame
 * the stage pins each running animation to the simulated time: an animation is born at the virtual time
 * it is first seen, held paused at `virtual − born`, and finished (its end events fire) once that passes
 * its end. Same command, same frames.
 */
const born = new WeakMap<Animation, number>();

export function syncAnimations(virtual: number) {
  if (typeof document === 'undefined' || !document.getAnimations) return;
  for (const anim of document.getAnimations()) {
    let start = born.get(anim);
    if (start === undefined) {
      start = virtual;
      born.set(anim, start);
    }
    const elapsed = Math.max(0, virtual - start);
    const end = anim.effect?.getComputedTiming().endTime;
    const endMs = typeof end === 'number' ? end : Number(end ?? Infinity);
    if (Number.isFinite(endMs) && elapsed >= endMs) {
      try {
        anim.finish();
      } catch {
        // An infinite animation can't finish: keep it pinned below.
      }
      continue;
    }
    anim.pause();
    anim.currentTime = elapsed;
  }
}
