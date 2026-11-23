/**
 * VideoPlayer.jsx — শেয়ারড ভিডিও প্লেয়ার (v2)
 * ------------------------------------------------------------
 * একই প্লেয়ার প্রোডাক্ট পেজ, ল্যান্ডিং পেজ ও অ্যাডমিন প্রিভিউতে।
 *
 *  • YouTube (watch / youtu.be / shorts / embed / live) → iframe
 *  • সরাসরি ফাইল (mp4 / webm / ogv / mov / m4v / m3u8) → <video> + <source type>
 *  • লোড না হলে **আসল কারণ** দেখায় (404 / CORS / কোডেক / নেটওয়ার্ক)
 *  • "নতুন ট্যাবে খুলুন" ফলব্যাক — ইউজার আটকে থাকে না
 *  • YouTube-এ mute বাটন iframe রিমাউন্ট করে না (আগের বাগ)
 */
import { useEffect, useRef, useState } from 'react';
import { Play, Volume2, VolumeX, AlertTriangle, ExternalLink, RotateCcw } from 'lucide-react';
import '../styles/VideoPlayer.css';

const VIDEO_EXT = /\.(mp4|webm|ogv|ogg|mov|m4v|m3u8)(\?.*)?$/i;

/* ------------------------------------------------------------
   YouTube URL → ভিডিও ID
------------------------------------------------------------ */
export function getYouTubeId(value) {
  if (!value || typeof value !== 'string') return null;
  const input = value.trim();
  if (!input) return null;

  // খালি ID দিলেও কাজ করবে (১১ অক্ষরের)
  if (/^[A-Za-z0-9_-]{11}$/.test(input)) return input;

  try {
    const url = new URL(input.startsWith('http') ? input : `https://${input}`);
    const host = url.hostname.replace(/^www\./, '').toLowerCase();

    if (host === 'youtu.be') {
      return url.pathname.split('/').filter(Boolean)[0] || null;
    }

    if (
      host === 'youtube.com' ||
      host === 'm.youtube.com' ||
      host === 'music.youtube.com' ||
      host === 'youtube-nocookie.com'
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

/** এক্সটেনশন থেকে সঠিক MIME — <source type> ছাড়া কিছু ব্রাউজার চালায় না। */
export const mimeForVideo = (url) => {
  const u = String(url || '');
  if (/\.webm(\?|$)/i.test(u)) return 'video/webm';
  if (/\.og[gv](\?|$)/i.test(u)) return 'video/ogg';
  if (/\.mov(\?|$)/i.test(u)) return 'video/quicktime';
  if (/\.m4v(\?|$)/i.test(u)) return 'video/x-m4v';
  if (/\.m3u8(\?|$)/i.test(u)) return 'application/vnd.apple.mpegurl';
  return 'video/mp4';
};

/** videos অ্যারে থেকে শুধু স্ট্রিং URL। */
export const normalizeVideoList = (list) =>
  (Array.isArray(list) ? list : [])
    .map((v) => (typeof v === 'string' ? v : v?.url || v?.src || ''))
    .map((v) => String(v || '').trim())
    .filter(Boolean);

/** ব্রাউজারের MediaError → বোধগম্য বাংলা বার্তা। */
const explainMediaError = (el) => {
  const err = el?.error;
  if (!err) return 'ভিডিওটি লোড করা যায়নি।';
  switch (err.code) {
    case 1:
      return 'ভিডিও লোড করা বন্ধ হয়ে গেছে (ABORTED)।';
    case 2:
      return 'নেটওয়ার্ক সমস্যা — ফাইলটি সার্ভার থেকে আসছে না (404 বা CORS)।';
    case 3:
      return 'ফাইলটি ডিকোড করা যায়নি — কোডেক/ফরম্যাট ব্রাউজার সাপোর্ট করছে না। MP4 (H.264 + AAC) ব্যবহার করুন।';
    case 4:
      return 'ফাইলটি পাওয়া যায়নি বা ফরম্যাট সাপোর্টেড নয় (404 / ভুল পাথ / HTML রেসপন্স)।';
    default:
      return 'ভিডিও চালানো যায়নি।';
  }
};

export default function VideoPlayer({
  src,
  poster,
  autoplay = false,
  className = '',
  onError,
  showFallback = true,
}) {
  const ytId = getYouTubeId(src);
  const [muted, setMuted] = useState(true);
  const [failed, setFailed] = useState(false);
  const [reason, setReason] = useState('');
  const [started, setStarted] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    setFailed(false);
    setReason('');
    setStarted(false);
  }, [src, attempt]);

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
      <div className={`vp-stage ${className}`.trim()}>
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

  const handleError = () => {
    const msg = explainMediaError(ref.current);
    setFailed(true);
    setReason(msg);
    onError?.(src, msg);
  };

  return (
    <div className={`vp-stage ${className}`.trim()}>
      {failed ? (
        <div className="vp-error" role="alert">
          <AlertTriangle size={22} />
          <b>ভিডিওটি চালানো যাচ্ছে না</b>
          <small>{reason}</small>
          <div className="vp-error-actions">
            <button
              type="button"
              onClick={() => {
                setAttempt((a) => a + 1);
              }}
            >
              <RotateCcw size={13} /> আবার চেষ্টা
            </button>
            {showFallback && (
              <a href={src} target="_blank" rel="noopener noreferrer">
                <ExternalLink size={13} /> নতুন ট্যাবে খুলুন
              </a>
            )}
          </div>
        </div>
      ) : (
        <video
          key={`${src}-${attempt}`}
          ref={ref}
          className="vp-media"
          poster={poster || undefined}
          controls
          playsInline
          preload="metadata"
          muted={muted}
          autoPlay={autoplay}
          loop={autoplay}
          crossOrigin="anonymous"
          onPlay={() => setStarted(true)}
          onError={handleError}
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
