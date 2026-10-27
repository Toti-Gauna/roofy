import type { ReactNode } from 'react';

/**
 * The trailer's devices, rebuilt for the film (the Kinetic Studio way: src/handy/ui/PhoneFrame.ts): a browser window
 * for the site and the CRM, a phone for the chat. Fixed sizes in stage px; the film moves them with transforms.
 */

/** Browser window: 1040 × 760, a 52 px bar with the address, the page below (1040 × 708). */
export const BROWSER = { w: 1040, h: 760, bar: 52 } as const;
/** Phone: 438 × 920 frame, 414 × 896 screen (as Handy's). */
export const PHONE = { w: 438, h: 920, bezel: 12, status: 54 } as const;
/**
 * The UI inside the devices is drawn bigger than on the web (a trailer is watched on a phone): the page is laid out at
 * 1/zoom of the window and scaled up with a transform, so every measurement (getBoundingClientRect) stays in stage px.
 */
export const UI_ZOOM = { browser: 1.3, phone: 1.2 } as const;

function Zoom({ z, children }: { z: number; children: ReactNode }) {
  return (
    <div className="tr-zoom" style={{ width: `${100 / z}%`, height: `${100 / z}%`, transform: `scale(${z})` }}>
      {children}
    </div>
  );
}

export function Browser({ url, children, className = '' }: { url: string; children: ReactNode; className?: string }) {
  return (
    <div className={`tr-browser ${className}`} style={{ width: BROWSER.w, height: BROWSER.h }}>
      <div className="tr-browser-bar" style={{ height: BROWSER.bar }}>
        <span className="tr-browser-dots" aria-hidden>
          <i />
          <i />
          <i />
        </span>
        <span className="tr-browser-url">{url}</span>
      </div>
      <div className="tr-browser-page">
        <Zoom z={UI_ZOOM.browser}>{children}</Zoom>
      </div>
    </div>
  );
}

export function Phone({ time, children, className = '' }: { time: string; children: ReactNode; className?: string }) {
  return (
    <div className={`tr-phone ${className}`} style={{ width: PHONE.w, height: PHONE.h }}>
      <div className="tr-phone-screen" style={{ inset: PHONE.bezel }}>
        <div className="tr-phone-status" style={{ height: PHONE.status }}>
          <span>{time}</span>
          <span className="tr-phone-island" aria-hidden />
          <span className="tr-phone-glyphs" aria-hidden>
            <i />
            <i />
            <i />
          </span>
        </div>
        <div className="tr-phone-app" style={{ top: PHONE.status }}>
          <Zoom z={UI_ZOOM.phone}>{children}</Zoom>
        </div>
      </div>
    </div>
  );
}

/** Where a touch lands: a ring that presses and a ripple (stage px; `x`/`y` are set by the film). */
export function Finger({ className = '' }: { className?: string }) {
  return (
    <span className={`tr-finger ${className}`} aria-hidden>
      <i className="tr-finger-ripple" />
      <i className="tr-finger-dot" />
    </span>
  );
}
