'use client';

import { useEffect, useId, useRef } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { X } from 'lucide-react';
import { BASE_PATH } from '@/lib/env';
import { useSound } from '@/components/sound/SoundContext';
import type { EstateosVideo } from '@/lib/videos';

/**
 * A video in a native <dialog>: poster first, controls, never autoplay, and the transcript always
 * one tap away. One media at a time: opening it turns the music off and the demo's sound effects stay
 * quiet; closing it pauses the video. Escape and the close button return focus to the opener.
 */
export function VideoPlayer({ video, label, onClose }: { video: EstateosVideo; label: string; onClose: () => void }) {
  const t = useTranslations('experience');
  const locale = useLocale() as keyof EstateosVideo['transcript'];
  const { setMusic } = useSound();
  const uid = useId();
  const dialog = useRef<HTMLDialogElement>(null);
  const media = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    setMusic(false);
    const el = dialog.current;
    const player = media.current;
    if (el && !el.open) el.showModal();
    return () => {
      player?.pause();
      if (el?.open) el.close();
    };
  }, [setMusic]);

  return (
    <dialog ref={dialog} className="xp-video" aria-labelledby={`${uid}-title`} onClose={onClose} onCancel={() => media.current?.pause()}>
      <div className="xp-video-head">
        <h2 id={`${uid}-title`} className="xp-video-title">
          {label}
        </h2>
        <button type="button" className="xp-btn" onClick={() => dialog.current?.close()}>
          <X aria-hidden strokeWidth={1.5} />
          <span className="xp-btn-text">{t('video.close')}</span>
        </button>
      </div>
      <video ref={media} className="xp-video-media" controls playsInline preload="none" poster={`${BASE_PATH}${video.poster}`} src={`${BASE_PATH}${video.src}`} />
      <details className="xp-video-transcript">
        <summary>{t('video.transcript')}</summary>
        <p>{video.transcript[locale]}</p>
      </details>
    </dialog>
  );
}
