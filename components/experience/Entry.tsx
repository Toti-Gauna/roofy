'use client';

import { useEffect, useId, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Compass, Hand } from 'lucide-react';

/**
 * «¿Cómo la querés ver?» — offered on EVERY load and for every plan; nothing is remembered and the
 * guide never starts by itself. It sits over the demo (which is inert while this is open).
 */
export function Entry({ onGuide, onOwn }: { onGuide: () => void; onOwn: () => void }) {
  const t = useTranslations('experience');
  const uid = useId();
  const first = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    first.current?.focus({ preventScroll: true });
  }, []);

  return (
    <div className="xp-entry" role="group" aria-labelledby={`${uid}-title`}>
      <div className="xp-entry-card">
        <p className="label">{t('entry.eyebrow')}</p>
        <h2 id={`${uid}-title`} className="display xp-entry-title">
          {t('entry.title')}
        </h2>
        <div className="xp-entry-options">
          <button ref={first} type="button" onClick={onGuide} className="xp-entry-option" data-xp-choice="guide">
            <Compass aria-hidden strokeWidth={1.5} className="xp-entry-icon" />
            <span className="xp-entry-name">{t('entry.guide.name')}</span>
            <span className="xp-entry-text">{t('entry.guide.text')}</span>
          </button>
          <button type="button" onClick={onOwn} className="xp-entry-option" data-xp-choice="own">
            <Hand aria-hidden strokeWidth={1.5} className="xp-entry-icon" />
            <span className="xp-entry-name">{t('entry.own.name')}</span>
            <span className="xp-entry-text">{t('entry.own.text')}</span>
          </button>
        </div>
        <p className="xp-entry-note">{t('entry.note')}</p>
      </div>
    </div>
  );
}
