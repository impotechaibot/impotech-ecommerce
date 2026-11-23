import { useRef, useState } from 'react';
import {
  FiUploadCloud,
  FiTrash2,
  FiImage,
  FiVideo,
  FiLink,
  FiAlertTriangle,
  FiStar,
  FiMove,
  FiCheck,
  FiPlay,
} from 'react-icons/fi';
import { formatBytes, dataUrlBytes, listBytes } from '../utils/format.js';
import { uploadMedia, canUploadMedia, isRemote } from '../lib/db.js';
import { getYouTubeId, getYouTubeThumbnail, isYouTubeVideo } from '../components/VideoPlayer.jsx';

/* ==========================================================
   MediaManager — ছবি + ভিডিও ম্যানেজার (v2)

   ⚠️ আগের বাগ: ভিডিও ফাইল base64 `data:` URL হয়ে প্রোডাক্টে
   ঢুকত → localStorage (~5MB) ভরে যেত → সেভ চুপচাপ ব্যর্থ হত →
   ভিডিও কোথাও থাকত না, সাইটে কালো বক্স।

   এখন:
     • ভিডিও Supabase Storage-এ আপলোড হয়, প্রোডাক্টে শুধু URL থাকে
     • আপলোড প্রোগ্রেস (%) দেখায়
     • YouTube লিঙ্ক দিলে সাথে সাথে থাম্বনেইল প্রিভিউ
     • ছবি আগের মতোই ছোট করে data URL-এ (কারণ ছবি ছোট)
     • Storage না থাকলে স্পষ্ট বার্তা — চুপচাপ হারায় না
   ========================================================== */

const MAX_IMAGE_EDGE = 1000;
const IMAGE_QUALITY = 0.78;

export const MAX_VIDEO_MB = 50;
export const MAX_IMAGE_MB = 8;

const VIDEO_EXT = /\.(mp4|webm|ogv|ogg|mov|m4v)$/i;

/** ছবি ছোট করে JPEG data URL — localStorage-এ ছবি রাখা নিরাপদ। */
export const resizeImageToDataUrl = (file, max = MAX_IMAGE_EDGE, quality = IMAGE_QUALITY) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('read failed'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('decode failed'));
      img.onload = () => {
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(img.width * scale));
        canvas.height = Math.max(1, Math.round(img.height * scale));
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });

const MediaManager = ({ images = [], videos = [], onChange, onError }) => {
  const [imgUrl, setImgUrl] = useState('');
  const [vidUrl, setVidUrl] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragIndex, setDragIndex] = useState(null);
  const [overIndex, setOverIndex] = useState(null);
  const imgInput = useRef(null);
  const vidInput = useRef(null);

  const imageBytes = listBytes(images);
  const videoBytes = listBytes(videos);
  const storageReady = canUploadMedia();

  const emit = (next) => onChange({ images, videos, ...next });

  /* ---------------- ছবি ---------------- */

  const addImageFiles = async (fileList) => {
    const files = Array.from(fileList || []).filter((f) => f.type.startsWith('image/'));
    if (!files.length) {
      onError?.('শুধু ছবি ফাইল আপলোড করুন (JPG / PNG / WEBP)');
      return;
    }
    setBusy(true);
    const added = [];
    for (const file of files) {
      if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
        onError?.(`"${file.name}" অনেক বড় — সর্বোচ্চ ${MAX_IMAGE_MB}MB`);
        continue;
      }
      try {
        added.push(await resizeImageToDataUrl(file));
      } catch {
        onError?.(`"${file.name}" পড়া যায়নি, অন্য ছবি চেষ্টা করুন`);
      }
    }
    setBusy(false);
    if (added.length) emit({ images: [...images, ...added] });
  };

  const addImageUrl = () => {
    const url = imgUrl.trim();
    if (!url) return;
    if (!/^(https?:|data:image\/)/i.test(url)) {
      onError?.('ছবির URL http(s):// বা data:image/ দিয়ে শুরু হতে হবে');
      return;
    }
    emit({ images: [...images, url] });
    setImgUrl('');
  };

  const removeImage = (i) => emit({ images: images.filter((_, idx) => idx !== i) });

  const makePrimary = (i) => {
    if (i === 0) return;
    const next = [...images];
    const [picked] = next.splice(i, 1);
    next.unshift(picked);
    emit({ images: next });
  };

  const reorder = (from, to) => {
    if (from === null || to === null || from === to) return;
    const next = [...images];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    emit({ images: next });
  };

  /* ---------------- ভিডিও ---------------- */

  const addVideoFiles = async (fileList) => {
    const files = Array.from(fileList || []).filter(
      (f) => f.type.startsWith('video/') || VIDEO_EXT.test(f.name)
    );
    if (!files.length) {
      onError?.('শুধু ভিডিও ফাইল আপলোড করুন (mp4 / webm)');
      return;
    }

    if (!storageReady) {
      onError?.(
        'ভিডিও আপলোডের জন্য Supabase Storage দরকার। ' +
          'Vercel-এ VITE_SUPABASE_URL ও VITE_SUPABASE_ANON_KEY দিন, ' +
          'অথবা নিচে হোস্ট করা ভিডিওর লিঙ্ক পেস্ট করুন।'
      );
      return;
    }

    setBusy(true);
    const added = [];
    for (const file of files) {
      if (file.size > MAX_VIDEO_MB * 1024 * 1024) {
        onError?.(
          `"${file.name}" অনেক বড় (${formatBytes(file.size)}) — সর্বোচ্চ ${MAX_VIDEO_MB}MB`
        );
        continue;
      }
      setProgress(0);
      const res = await uploadMedia(file, {
        kind: 'video',
        folder: 'products',
        onProgress: setProgress,
      });
      if (res.ok) {
        added.push(res.data.url);
      } else {
        onError?.(`"${file.name}" আপলোড হয়নি — ${res.error}`);
      }
    }
    setProgress(0);
    setBusy(false);
    if (added.length) emit({ videos: [...videos, ...added] });
  };

  const addVideoUrl = () => {
    const url = vidUrl.trim();
    if (!url) return;
    if (!/^(https?:|data:video\/)/i.test(url)) {
      onError?.('ভিডিওর URL http(s):// বা data:video/ দিয়ে শুরু হতে হবে');
      return;
    }
    if (videos.includes(url)) {
      onError?.('এই ভিডিওটি আগেই যোগ করা আছে');
      return;
    }
    emit({ videos: [...videos, url] });
    setVidUrl('');
  };

  const removeVideo = (i) => emit({ videos: videos.filter((_, idx) => idx !== i) });

  return (
    <div className="mm-wrap">
      {/* ---------------- ছবি ---------------- */}
      <section className="mm-block">
        <header className="mm-head">
          <h4>
            <FiImage size={15} /> ছবি (গ্যালারি)
            <span className="mm-count">{images.length}</span>
          </h4>
          <span className="mm-size">{formatBytes(imageBytes)}</span>
        </header>

        <div
          className={`mm-drop ${dragOver ? 'over' : ''}`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            addImageFiles(e.dataTransfer.files);
          }}
          onClick={() => imgInput.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') imgInput.current?.click();
          }}
        >
          <FiUploadCloud size={20} />
          <span>
            {busy ? 'প্রসেস হচ্ছে…' : 'ছবি টেনে এনে ছাড়ুন বা ক্লিক করে বেছে নিন'}
          </span>
          <small>একসাথে একাধিক ছবি · অটো রিসাইজ হবে</small>
          <input
            ref={imgInput}
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => {
              addImageFiles(e.target.files);
              e.target.value = '';
            }}
          />
        </div>

        {images.length > 0 && (
          <ul className="mm-grid">
            {images.map((src, i) => (
              <li
                key={src.slice(0, 40) + i}
                className={`mm-tile ${i === 0 ? 'primary' : ''} ${
                  overIndex === i ? 'drop-target' : ''
                }`}
                draggable
                onDragStart={() => setDragIndex(i)}
                onDragEnd={() => {
                  setDragIndex(null);
                  setOverIndex(null);
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  setOverIndex(i);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  reorder(dragIndex, i);
                  setDragIndex(null);
                  setOverIndex(null);
                }}
              >
                <img src={src} alt={`ছবি ${i + 1}`} />
                {i === 0 && (
                  <span className="mm-primary-tag">
                    <FiStar size={11} /> প্রধান
                  </span>
                )}
                <span className="mm-grip" aria-hidden="true">
                  <FiMove size={12} />
                </span>
                <div className="mm-tile-actions">
                  {i !== 0 && (
                    <button
                      type="button"
                      onClick={() => makePrimary(i)}
                      title="প্রধান ছবি করুন"
                      aria-label="প্রধান ছবি করুন"
                    >
                      <FiStar size={13} />
                    </button>
                  )}
                  <button
                    type="button"
                    className="del"
                    onClick={() => removeImage(i)}
                    title="ছবি সরান"
                    aria-label="ছবি সরান"
                  >
                    <FiTrash2 size={13} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        <div className="mm-url">
          <FiLink size={14} />
          <input
            value={imgUrl}
            onChange={(e) => setImgUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addImageUrl();
              }
            }}
            placeholder="ছবির URL দিয়ে যোগ করুন…"
            aria-label="ছবির URL"
          />
          <button type="button" onClick={addImageUrl}>
            যোগ করুন
          </button>
        </div>

        {images.length > 1 && (
          <p className="mm-hint">
            টেনে এনে ক্রম বদলাতে পারেন · প্রথম ছবিটাই কার্ড ও লিস্টিংয়ে দেখাবে
          </p>
        )}
      </section>

      {/* ---------------- ভিডিও ---------------- */}
      <section className="mm-block">
        <header className="mm-head">
          <h4>
            <FiVideo size={15} /> ভিডিও
            <span className="mm-count">{videos.length}</span>
          </h4>
          <span className="mm-size">
            {storageReady ? 'Supabase Storage' : 'শুধু লিঙ্ক'}
          </span>
        </header>

        <div
          className="mm-drop"
          onClick={() => vidInput.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') vidInput.current?.click();
          }}
        >
          <FiUploadCloud size={20} />
          <span>
            {busy && progress > 0
              ? `আপলোড হচ্ছে… ${progress}%`
              : 'ভিডিও আপলোড করুন (mp4 / webm)'}
          </span>
          <small>
            সর্বোচ্চ {MAX_VIDEO_MB}MB · একসাথে একাধিক ভিডিও
            {!storageReady && ' · Storage কনফিগার নেই'}
          </small>
          <input
            ref={vidInput}
            type="file"
            accept="video/mp4,video/webm,video/*"
            multiple
            onChange={(e) => {
              addVideoFiles(e.target.files);
              e.target.value = '';
            }}
          />
        </div>

        {busy && progress > 0 && (
          <div className="mm-progress" role="progressbar" aria-valuenow={progress}>
            <span style={{ width: `${progress}%` }} />
          </div>
        )}

        {videos.length > 0 && (
          <ul className="mm-vid-list">
            {videos.map((src, i) => {
              const yt = isYouTubeVideo(src);
              const bytes = dataUrlBytes(src);
              const heavy = bytes > 800 * 1024;
              return (
                <li key={src.slice(0, 60) + i} className="mm-vid">
                  {yt ? (
                    <div className="mm-vid-yt">
                      <img src={getYouTubeThumbnail(src)} alt={`YouTube ${i + 1}`} />
                      <span className="mm-vid-play">
                        <FiPlay size={14} />
                      </span>
                    </div>
                  ) : (
                    <video src={src} controls preload="metadata" playsInline />
                  )}
                  <div className="mm-vid-meta">
                    <b>
                      ভিডিও {i + 1}
                      {yt && <span className="mm-yt-tag">YouTube</span>}
                    </b>
                    <small className={heavy ? 'warn' : ''}>
                      {yt
                        ? getYouTubeId(src)
                        : bytes
                        ? formatBytes(bytes)
                        : 'হোস্ট করা লিঙ্ক'}
                      {heavy && (
                        <>
                          {' '}
                          <FiAlertTriangle size={11} /> বড় ফাইল
                        </>
                      )}
                    </small>
                  </div>
                  <button
                    type="button"
                    className="del"
                    onClick={() => removeVideo(i)}
                    title="ভিডিও সরান"
                    aria-label="ভিডিও সরান"
                  >
                    <FiTrash2 size={14} />
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        <div className="mm-url">
          <FiLink size={14} />
          <input
            value={vidUrl}
            onChange={(e) => setVidUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addVideoUrl();
              }
            }}
            placeholder="YouTube বা mp4/webm লিঙ্ক পেস্ট করুন…"
            aria-label="ভিডিওর URL"
          />
          <button type="button" onClick={addVideoUrl}>
            যোগ করুন
          </button>
        </div>

        {vidUrl.trim() && isYouTubeVideo(vidUrl) && (
          <div className="mm-yt-preview">
            <img src={getYouTubeThumbnail(vidUrl)} alt="YouTube প্রিভিউ" />
            <span>
              <FiCheck size={13} /> YouTube ভিডিও শনাক্ত হয়েছে
            </span>
          </div>
        )}

        {!storageReady && (
          <p className="mm-warn">
            <FiAlertTriangle size={13} /> Supabase Storage কনফিগার নেই — ফাইল আপলোড
            কাজ করবে না। Vercel-এ <code>VITE_SUPABASE_URL</code> ও{' '}
            <code>VITE_SUPABASE_ANON_KEY</code> দিন এবং Supabase-এ{' '}
            <code>supabase/storage.sql</code> চালান। ততক্ষণ YouTube বা হোস্ট করা
            ভিডিওর লিঙ্ক ব্যবহার করুন।
          </p>
        )}
      </section>

      {/* ---------------- বাজেট ---------------- */}
      <div className="mm-budget">
        <span>লোকাল স্টোরেজে মিডিয়া</span>
        <b>{formatBytes(imageBytes + videoBytes)}</b>
        <em>
          {isRemote()
            ? 'ভিডিও Supabase-এ থাকে — লোকাল স্টোরেজে জায়গা নেয় না'
            : 'ডেমো মোড: ছবি লোকাল স্টোরেজে থাকে'}
        </em>
      </div>
    </div>
  );
};

export default MediaManager;
