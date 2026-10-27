/**
 * The one piece of Kinetic Studio's engine that its vendored music module needs: `Trailer.plugin` (the module
 * registers its `done` hook there) and the `Trailer` namespace it hangs `Trailer.music` on. Imported before
 * `recipes-music.js` (module order is evaluation order).
 */
export interface KineticD {
  tl: gsap.core.Timeline;
  sfx: (name: string, at: number, ...args: unknown[]) => void;
  segs?: undefined;
}
interface KineticPlugin {
  done?: (D: KineticD, cfg: { music?: unknown }) => void;
}
interface TrailerNs {
  plugin: (p: KineticPlugin) => void;
  plugins: KineticPlugin[];
  music?: { ACORDES: Record<string, number[]> };
}

declare global {
  interface Window {
    Trailer?: TrailerNs;
    SFX?: {
      play: (atraso: number, name: string, args: unknown[]) => void;
      render: (dur: number, events: { t: number; fn: () => void }[], o?: { sampleRate?: number; seed?: number }) => Promise<AudioBuffer>;
    };
  }
}

if (typeof window !== 'undefined' && !window.Trailer) {
  const plugins: KineticPlugin[] = [];
  window.Trailer = { plugins, plugin: (p) => plugins.push(p) };
}

export {};
