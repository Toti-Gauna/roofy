import { PLAN_IDS } from '@/lib/plans';

/**
 * The instrument around the eclipse (decorative, aria-hidden by the stage). Copied from Eclipse-Web
 * (components/hero/Dial.tsx, 5cdb887): there it has one position per rubro and turns toward the chip
 * under the pointer; here it has one position per plan (01…06, the ladder) and stays still.
 *
 * Geometry (must match hero.css): the dial box is the eclipse square plus 8% on each side
 * (1.16 × the square). SVG units: the square spans −50…50, so the viewBox is −58…58.
 */
const POINTER_DEG = 45;
const RING = 48;
const LABEL_R = 43.2;
const BOX = 58;
const COUNT = PLAN_IDS.length;

const angle = (index: number) => (360 / COUNT) * index;

const polar = (r: number, deg: number) => {
  const a = ((deg - 90) * Math.PI) / 180;
  return [r * Math.cos(a), r * Math.sin(a)] as const;
};
const f = (n: number) => n.toFixed(2);
const seg = (r0: number, r1: number, deg: number) => {
  const [x0, y0] = polar(r0, deg);
  const [x1, y1] = polar(r1, deg);
  return `M${f(x0)} ${f(y0)}L${f(x1)} ${f(y1)}`;
};

// Built once at module load (deterministic → identical SSR / client markup).
let MINOR = '';
let MEDIUM = '';
for (let deg = 0; deg < 360; deg += 2) {
  if (deg % 10 === 0) MEDIUM += seg(RING, RING - 2.6, deg);
  else MINOR += seg(RING, RING - 1.3, deg);
}
const MAJOR = PLAN_IDS.map((_, i) => seg(RING + 0.6, RING - 4.6, angle(i))).join('');
const CROSS = [0, 90, 180, 270].map((deg) => seg(RING + 4.5, RING + 8, deg)).join('');
const POINTER_LINE = seg(RING - 5.5, RING + 2, POINTER_DEG);
const [PX, PY] = polar(RING + 4.4, POINTER_DEG);

/** Label position on the bezel, in % of the dial box. */
function labelStyle(index: number) {
  const deg = angle(index);
  const [x, y] = polar(LABEL_R, deg);
  return {
    left: `${50 + (x / (2 * BOX)) * 100}%`,
    top: `${50 + (y / (2 * BOX)) * 100}%`,
    transform: `translate(-50%, -50%) rotate(${deg}deg)`,
  };
}

export function Dial() {
  return (
    <div className="hero-dial">
      <svg viewBox={`${-BOX} ${-BOX} ${2 * BOX} ${2 * BOX}`} className="hero-dial-svg" focusable="false">
        <circle r={RING} className="hero-dial-ring" />
        <path d={MINOR} className="hero-dial-tick" />
        <path d={MEDIUM} className="hero-dial-tick hero-dial-tick--mid" />
        <path d={MAJOR} className="hero-dial-tick hero-dial-tick--major" />
        <path d={CROSS} className="hero-dial-cross" />
        <path d={POINTER_LINE} className="hero-dial-pointer-line" />
        <rect x={f(PX - 1.25)} y={f(PY - 1.25)} width={2.5} height={2.5} transform={`rotate(45 ${f(PX)} ${f(PY)})`} className="hero-dial-pointer" />
      </svg>
      {PLAN_IDS.map((id, i) => (
        <span key={id} className="hero-dial-label" style={labelStyle(i)}>
          {String(i + 1).padStart(2, '0')}
        </span>
      ))}
    </div>
  );
}
