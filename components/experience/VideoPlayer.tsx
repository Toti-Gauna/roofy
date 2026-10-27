'use client';

import { useEffect, useId, useRef } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { X } from 'lucide-react';
import { BASE_PATH } from '@/lib/env';
import { useSound } from '@/components/sound/SoundContext';
import { planInfo } from '@/lib/plans';
import { useMediaQuery } from '@/lib/useMediaQuery';
import { fileFor, type EstateosVideo, type VideoLocale } from '@/lib/videos';

const LOCALES: readonly VideoLocale[] = ['es', 'en', 'pt'];

/**
 * A video in a native <dialog> (guía de motion v1 §9): poster first, controls, never autoplay, no sound
 * when it starts, and the transcript always one tap away. A portrait screen gets the 9:16 cut. Subtitles in
 * the three languages; they start on when the visitor reads another language than the image's (in the
 * image's own language its words are already on screen). The plan's price sits next to the video, in HTML.
 * One media at a time: opening it turns the music off; closing it pauses the video. Escape and the close
 * button return focus to the opener.
 */
export function VideoPlayer({ video, label, onClose }: { video: EstateosVideo; label: string; onClose: () => void }) {
  const t = useTranslations('experience');
  const locale = useLocale() as VideoLocale;
  const { setMusic } = useSound();
  const portrait = useMediaQuery('(max-aspect-ratio: 4/5)');
  const uid = useId();
  const dialog = useRef<HTMLDialogElement>(null);
  const media = useRef<HTMLVideoElement>(null);
  const file = fileFor(video, portrait);
  const src = file?.src ?? video.src;
  const poster = file?.poster ?? video.poster;
  const info = video.plan ? planInfo(video.plan) : null;

  useEffect(() => {
    setMusic(false);
    const el = dialog.current;
    const player = media.current;
    // Silent at first (§9); React does not reflect `muted` as an attribute, so it is set here.
    if (player) player.muted = true;
    if (el && !el.open) el.showModal();
    return () => {
      player?.pause();
      if (el?.open) el.close();
    };
  }, [setMusic]);

  return (
    <dialog ref={dialog} className="xp-video" data-ratio={file?.ratio} aria-labelledby={`${uid}-title`} onClose={onClose} onCancel={() => media.current?.pause()}>
      <div className="xp-video-head">
        <h2 id={`${uid}-title`} className="xp-video-title">
          {label} <span className="xp-video-length readout">{t('video.duration', { seconds: Math.round(video.durationSec) })}</span>
        </h2>
        <button type="button" className="xp-btn" onClick={() => dialog.current?.close()}>
          <X aria-hidden strokeWidth={1.5} />
          <span className="xp-btn-text">{t('video.close')}</span>
        </button>
      </div>
      <video key={src} ref={media} className="xp-video-media" controls playsInline preload="none" poster={`${BASE_PATH}${poster}`} src={`${BASE_PATH}${src}`}>
        {LOCALES.map((l) => (
          <track key={l} kind="subtitles" srcLang={l} label={t(`video.subtitles.${l}`)} src={`${BASE_PATH}${video.subtitles[l]}`} default={l === locale && locale !== video.lang} />
        ))}
      </video>
      {info ? (
        <p className="xp-video-plan">
          <span>{info.name}</span>
          <span className="readout">{info.priceStatus === 'proposal' ? t('stage.proposal') : t('locked.price', { price: info.priceUsdMonthly })}</span>
          <button type="button" className="xp-link" onClick={() => dialog.current?.close()}>
            {t('video.back', { plan: info.name })}
          </button>
        </p>
      ) : null}
      <details className="xp-video-transcript">
        <summary>{t('video.transcript')}</summary>
        <p>{video.transcript[locale]}</p>
      </details>
    </dialog>
  );
}
