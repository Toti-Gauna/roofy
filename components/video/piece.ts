import type { EstateTab } from '@/components/demos/real-estate/data';
import type { EstateText } from '@/components/demos/real-estate/ui';
import type { PlanId } from '@/lib/plans';
import type { SoundName } from '@/lib/sound/types';
import type { Ratio, Shot } from './timeline';

/**
 * What a piece is made of (guía de motion v1 §5): shots of the REAL demo, each filmed as its own take.
 * A take mounts Lumen fresh, plays it to where the shot starts (steps with a negative `at` run before the
 * first frame, off camera) and then lets it run in front of the camera. Every change on screen comes
 * from the demo's own controls: the SimBar's beats, its navigation, its buttons.
 */

/** Which screen a take films: the agency's desktop, its phone app, or the buyer's phone (Carolina's). */
export type TakeView = 'laptop' | 'app' | 'buyer';

export type Step =
  /** «Simular»: plays the next beat (the SimBar's own button). */
  | { at: number; play: true }
  /** «Saltar al final» of the beat being played. */
  | { at: number; finish: true }
  /** The demo's navigation (the section's label, as the visitor would tap it). */
  | { at: number; nav: EstateTab }
  /** A button inside the take (`text`: a `demoRealEstate` key its label must equal); `tap` draws the touch ring there. */
  | { at: number; click: string; text?: string; tap?: boolean; sound?: SoundName }
  /** Scrolls the screen's content to its top or bottom (where the shot's subject sits on a small screen). */
  | { at: number; scroll: 'top' | 'bottom' }
  /** The touch ring on a button the story presses by itself (Carolina's reply), without clicking it. */
  | { at: number; ring: string; text?: string }
  /** A sound effect on an action the story plays by itself (Carolina answers, a visit lands). */
  | { at: number; sound: SoundName };

export interface Take {
  view: TakeView;
  /** What the camera frames: a selector inside the take (default: the whole screen). */
  frame?: string;
  /** Room around the framed element, in the screen's CSS px. */
  pad?: number;
  /** `contain` (default): all of the framed element shows. `cover`: it fills the window, trimming the long side. */
  fit?: 'contain' | 'cover';
  /** A fixed zoom instead of fitting (the phone in 9:16: readable text, the frame chooses what shows). */
  zoom?: number;
  /** Where the framed element sits when the window is taller/wider than it: 0 top/left … 1 bottom/right. */
  align?: { x?: number; y?: number };
  /** Camera drift over the shot (scale gain, 0.02–0.04: §2 cámara). */
  push?: number;
  steps: Step[];
}

export interface PieceShot extends Shot {
  kind: 'ui' | 'close';
  takes?: Record<Ratio, Take>;
  /** A mono reading shown with the shot (Lumen's clock, the visit). */
  readout?: (x: EstateText) => string;
  /** The piece's one serif line (the problem), instead of a caption. */
  headline?: boolean;
  /** The screen starts dark and the light uncovers it (an edge passing). */
  dark?: { at: number };
}

export interface Piece {
  id: string;
  /** The plan the piece is about (`null`: the general demo). */
  plan: PlanId | null;
  /** Lumen's lens while filming (what the plan includes). */
  lens: PlanId | null;
  /** Bumped when the cut changes (the manifest records it). */
  version: number;
  total: number;
  tolerance: number;
  /** Shots allowed beyond 5 s because they carry a conversation, not one action. */
  longShots: readonly string[];
  shots: readonly PieceShot[];
}
