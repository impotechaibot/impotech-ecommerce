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
} from 'react-icons/fi';
import {
  formatBytes,
  dataUrlBytes,
  listBytes,
  STORAGE_BUDGET_BYTES,
  VIDEO_WARN_BYTES,
} from '../utils/format.js';

/* ==========================================================
   MediaManager
   Multi-image + multi-video editor used inside the product form.
   - images: drag & drop / multi-select upload, thumbnail grid,
     drag-to-reorder, delete, first item = primary image
   - videos: mp4/webm upload or URL, preview player, delete,
     size warning so localStorage never overflows
   ========================================================== */

const MAX_IMAGE_EDGE = 1000;
const IMAGE_QUALITY = 0.78;

/** Downscale an image file to a JPEG data URL (keeps localStorage small). */
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

/** Read a video file as a data URL (no transcoding — browsers cannot). */
const readVideoToDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('read failed'));
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(file);
  });

const MediaManager = ({ images = [], videos = [], onChange, onError }) => {
  const [imgUrl, setImgUrl] = useState('');
  const [vidUrl, setVidUrl] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [busy, setBusy] = useState(false);
  const [dragIndex, setDragIndex] = useState(null);
  const [overIndex, setOverIndex] = useState(null);
  const imgInput = useRef(null);
  const vidInput = useRef(null);

  const imageBytes = listBytes(images);
  const videoBytes = listBytes(videos);
  const totalBytes = imageBytes + videoBytes;
  const overBudget = totalBytes > STORAGE_BUDGET_BYTES;

  const emit = (next) => onChange({ images, videos, ...next });

  /* ---------------- images ---------------- */

  const addImageFiles = async (fileList) => {
    const files = Array.from(fileList || []).filter((f) =>
      f.type.startsWith('image/')
    );
    if (!files.length) {
      onError?.('শুধু ছবি ফাইল আপলোড করুন (JPG / PNG / WEBP)');
      return;
    }
    setBusy(true);
    const added = [];
    for (const file of files) {
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

  const removeImage = (i) =>
    emit({ images: images.filter((_, idx) => idx !== i) });

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

  /* ---------------- videos ---------------- */

  const addVideoFiles = async (fileList) => {
    const files = Array.from(fileList || []).filter(
      (f) => f.type.startsWith('video/') || /\.(mp4|webm|ogv|mov|m4v)$/i.test(f.name)
    );
    if (!files.length) {
      onError?.('শুধু ভিডিও ফাইল আপলোড করুন (mp4 / webm)');
      return;
    }
    setBusy(true);
    const added = [];
    for (const file of files) {
      try {
        const data = await readVideoToDataUrl(file);
        added.push(data);
      } catch {
        onError?.(`"${file.name}" পড়া যায়নি`);
      }
    }
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
    emit({ videos: [...videos, url] });
    setVidUrl('');
  };

  const removeVideo = (i) =>
    emit({ videos: videos.filter((_, idx) => idx !== i) });

  return (
    <div className="mm-wrap">
      {/* ---------------- images ---------------- */}
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

      {/* ---------------- videos ---------------- */}
      <section className="mm-block">
        <header className="mm-head">
          <h4>
            <FiVideo size={15} /> ভিডিও
            <span className="mm-count">{videos.length}</span>
          </h4>
          <span className="mm-size">{formatBytes(videoBytes)}</span>
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
          <span>ভিডিও আপলোড করুন (mp4 / webm)</span>
          <small>একসাথে একাধিক ভিডিও · বড় ফাইল সেভ নাও হতে পারে</small>
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

        {videos.length > 0 && (
          <ul className="mm-vid-list">
            {videos.map((src, i) => {
              const bytes = dataUrlBytes(src);
              const heavy = bytes > VIDEO_WARN_BYTES;
              return (
                <li key={src.slice(0, 40) + i} className="mm-vid">
                  <video src={src} controls preload="metadata" playsInline />
                  <div className="mm-vid-meta">
                    <b>ভিডিও {i + 1}</b>
                    <small className={heavy ? 'warn' : ''}>
                      {bytes ? formatBytes(bytes) : 'বাইরের লিংক'}
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
            placeholder="ভিডিওর URL (mp4 / webm) দিয়ে যোগ করুন…"
            aria-label="ভিডিওর URL"
          />
          <button type="button" onClick={addVideoUrl}>
            যোগ করুন
          </button>
        </div>

        {videoBytes > VIDEO_WARN_BYTES && (
          <p className="mm-warn">
            <FiAlertTriangle size={13} /> ভিডিওর সাইজ বড় — ব্রাউজার স্টোরেজ
            (প্রায় ৫MB) ছাড়িয়ে গেলে সেভ হবে না। ছোট ক্লিপ ব্যবহার করুন বা
            ভিডিওর URL দিন।
          </p>
        )}
      </section>

      {/* ---------------- total budget ---------------- */}
      <div className={`mm-budget ${overBudget ? 'over' : ''}`}>
        <span>মোট মিডিয়া সাইজ</span>
        <b>
          {formatBytes(totalBytes)} / {formatBytes(STORAGE_BUDGET_BYTES)}
        </b>
        {overBudget && (
          <em>
            <FiAlertTriangle size={12} /> সীমার কাছাকাছি — কিছু ছবি/ভিডিও সরান
          </em>
        )}
      </div>
    </div>
  );
};

export default MediaManager;
