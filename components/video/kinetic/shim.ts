/** What Kinetic Studio's vendored engine (audio.js) installs on the window: `SFX`, its interface sounds. */
declare global {
  interface Window {
    SFX?: {
      play: (atraso: number, name: string, args: unknown[]) => void;
      render: (dur: number, events: { t: number; fn: () => void }[], o?: { sampleRate?: number; seed?: number }) => Promise<AudioBuffer>;
    };
  }
}

export {};
