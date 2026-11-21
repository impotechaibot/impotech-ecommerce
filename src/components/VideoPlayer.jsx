/**
 * VideoPlayer.jsx — ImpoTech শেয়ারড ভিডিও প্লেয়ার
 * ------------------------------------------------------------
 * একই প্লেয়ার প্রোডাক্ট ডিটেইল ও ল্যান্ডিং পেজে ব্যবহার হয়।
 *
 *  - YouTube (watch / youtu.be / shorts / embed / live) → iframe
 *  - সরাসরি ফাইল (mp4 / webm / ogv / mov / m4v) → <video> + <source type>
 *  - লোড না হলে পরিষ্কার এরর মেসেজ (আগে চুপচাপ কালো বক্স দেখাত)
 *  - autoplay শুধু তখনই, যখন প্রোডাক্টে চালু করা আছে (muted)
 *  - YouTube-এ mute বাটন নেই — iframe রিমাউন্ট হয়ে প্লেব্যাক হারাত
 */
import { useEffect, useRef, useState } from 'react';
import { Play, Volume2, VolumeX, AlertTriangle } from 'lucide-react';
import '../styles/VideoPlayer.css';

const VIDEO_EXT = /\.(mp4|webm|ogv|ogg|mov|m4v|m3u8)(\?.*)?$/i;

/* ------------------------------------------------------------
   YouTube URL থেকে ভিডিও ID
   সাপোর্ট: youtube.com/watch?v=ID · youtu.be/ID ·
            youtube.com/shorts/ID · /embed/ID · /live/ID
------------------------------------------------------------ */
export function getYouTubeId(value) {
  if (!value || typeof value !== 'string') return null;

  const input = value.trim();

  try {
    const url = new URL(input.startsWith('http') ? input : `https://${input}`);
    const host = url.hostname.replace(/^www\./, '').toLowerCase();

    if (host === 'youtu.be') {
      return url.pathname.split('/').filter(Boolean)[0] || null;
    }

    if (
      host === 'youtube.com' ||
      host === 'm.youtube.com' ||
      host === 'music.youtube.com'
    ) {
      if (url.pathname === '/watch') return url.searchParams.get('v');

      const parts = url.pathname.split('/').filter(Boolean);
      if (['shorts', 'embed', 'live', 'v'].includes(parts[0]) && parts[1]) {
        return parts[1];
      }
    }
  } catch {
    return null;
  }

  return null;
}

export function isYouTubeVideo(value) {
  return Boolean(getYouTubeId(value));
}

export function getYouTubeThumbnail(value) {
  const id = getYouTubeId(value);
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : '';
}

/** ফাইলের এক্সটেনশন থেকে সঠিক MIME টাইপ — <source type> ছাড়া কিছু ব্রাউজার চালায় না। */
export const mimeForVideo = (url) => {
  const u = String(url || '');
  if (/\.webm(\?|$)/i.test(u)) return 'video/webm';
  if (/\.og[gv](\?|$)/i.test(u)) return 'video/ogg';
  if (/\.mov(\?|$)/i.test(u)) return 'video/quicktime';
  if (/\.m4v(\?|$)/i.test(u)) return 'video/x-m4v';
  if (/\.m3u8(\?|$)/i.test(u)) return 'application/vnd.apple.mpegurl';
  return 'video/mp4';
};

/**
 * videos অ্যারে থেকে শুধু স্ট্রিং URL বের করে।
 * Supabase-এ কখনো `{ url: "..." }` আকারেও সেভ থাকতে পারে — সেটাও সামলায়।
 */
export const normalizeVideoList = (list) =>
  (Array.isArray(list) ? list : [])
    .map((v) => (typeof v === 'string' ? v : v?.url || v?.src || ''))
    .filter(Boolean);

export default function VideoPlayer({
  src,
  poster,
  autoplay = false,
  className = '',
  onError,
}) {
  const ytId = getYouTubeId(src);
  const [muted, setMuted] = useState(true);
  const [failed, setFailed] = useState(false);
  const [started, setStarted] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    setFailed(false);
    setStarted(false);
  }, [src]);

  if (!src) return null;

  /* ---------------- YouTube ---------------- */
  if (ytId) {
    const params = new URLSearchParams({
      rel: '0',
      playsinline: '1',
      modestbranding: '1',
    });
    if (autoplay) {
      params.set('autoplay', '1');
      params.set('mute', '1');
    }

    return (
      <div className={`vp-stage ${className}`}>
        <iframe
          className="vp-media"
          src={`https://www.youtube.com/embed/${ytId}?${params.toString()}`}
          title="YouTube ভিডিও"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          loading="lazy"
        />
      </div>
    );
  }

  /* ---------------- সরাসরি ফাইল ---------------- */
  const start = () => {
    const v = ref.current;
    if (!v) return;
    const p = v.play();
    if (p?.catch) p.catch(() => setStarted(true));
  };

  return (
    <div className={`vp-stage ${className}`}>
      {failed ? (
        <div className="vp-error" role="alert">
          <AlertTriangle size={22} />
          <b>ভিডিওটি চালানো যাচ্ছে না</b>
          <small>
            ফাইলটি খুঁজে পাওয়া যাচ্ছে না, অথবা ফরম্যাটটি ব্রাউজার সাপোর্ট করছে না।
          </small>
        </div>
      ) : (
        <video
          ref={ref}
          className="vp-media"
          poster={poster || undefined}
          controls
          playsInline
          preload="metadata"
          muted={muted}
          autoPlay={autoplay}
          loop={autoplay}
          onPlay={() => setStarted(true)}
          onError={() => {
            setFailed(true);
            onError?.(src);
          }}
        >
          <source src={src} type={mimeForVideo(src)} />
          আপনার ব্রাউজার এই ভিডিওটি চালাতে পারে না।
        </video>
      )}

      {!failed && !started && !autoplay && (
        <button
          type="button"
          className="vp-play"
          onClick={start}
          aria-label="ভিডিও চালান"
        >
          <Play size={26} />
        </button>
      )}

      {!failed && (
        <button
          type="button"
          className="vp-mute"
          onClick={() => setMuted((m) => !m)}
          aria-label={muted ? 'সাউন্ড চালু' : 'সাউন্ড বন্ধ'}
        >
          {muted ? <VolumeX size={17} /> : <Volume2 size={17} />}
        </button>
      )}
    </div>
  );
}
