/**
 * storage.js — ImpoTech মিডিয়া আপলোড লেয়ার (Supabase Storage)
 * ------------------------------------------------------------
 * আগে অ্যাডমিন থেকে ভিডিও আপলোড করলে ফাইলটা base64 `data:` URL হয়ে
 * localStorage-এ যেত। ব্রাউজারের কোটা প্রায় ৫MB — তাই যেকোনো আসল ভিডিও
 * সেভ হওয়ার আগেই `setItem` ফেল করত, আর ডিপ্লয়ে সার্ভ করার কোনো উপায়ই
 * ছিল না। এখন ফাইলটা Supabase Storage-এ যায় এবং প্রোডাক্টে শুধু
 * পাবলিক URL টা সেভ হয়।
 *
 * Supabase কনফিগার না থাকলে (ডেমো মোড) আপলোড করা যায় না — তখন
 * MediaManager ইউজারকে হোস্ট করা URL দিতে বলে, চুপচাপ ভিডিও হারায় না।
 */
import { supabase, isSupabaseConfigured } from './supabase.js';
import { formatBytes } from '../utils/format.js';

/** Storage bucket-এর নাম (supabase/storage.sql দেখুন)। */
export const MEDIA_BUCKET = 'product-media';

/** সর্বোচ্চ ফাইল সাইজ। */
export const MAX_VIDEO_BYTES = 50 * 1024 * 1024; // 50 MB
export const MAX_IMAGE_BYTES = 8 * 1024 * 1024; // 8 MB

export const VIDEO_TYPES = [
  'video/mp4',
  'video/webm',
  'video/ogg',
  'video/quicktime',
  'video/x-m4v',
];

export const IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
];

/** Supabase Storage ব্যবহার করা যাবে কি না। */
export const isStorageReady = () => Boolean(isSupabaseConfigured && supabase);

const EXT_BY_MIME = {
  'video/mp4': 'mp4',
  'video/webm': 'webm',
  'video/ogg': 'ogv',
  'video/quicktime': 'mov',
  'video/x-m4v': 'm4v',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/avif': 'avif',
};

const extFor = (file) => {
  const fromName = String(file.name || '')
    .split('.')
    .pop()
    ?.toLowerCase();
  if (fromName && /^[a-z0-9]{2,5}$/.test(fromName)) return fromName;
  return EXT_BY_MIME[file.type] || (file.type.startsWith('video/') ? 'mp4' : 'jpg');
};

const slug = (s) =>
  String(s || 'file')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40) || 'file';

/**
 * ফাইল ভ্যালিডেট করে। ঠিক থাকলে null, নাহলে বাংলা এরর মেসেজ।
 * @param {File} file
 * @param {'video'|'image'} kind
 */
export const validateMediaFile = (file, kind = 'video') => {
  if (!file) return 'ফাইল পাওয়া যায়নি';

  const isVideo = kind === 'video';
  const max = isVideo ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
  const allowed = isVideo ? VIDEO_TYPES : IMAGE_TYPES;

  const typeOk =
    allowed.includes(file.type) ||
    (isVideo ? file.type.startsWith('video/') : file.type.startsWith('image/'));

  if (!typeOk) {
    return isVideo
      ? 'শুধু MP4 / WebM ভিডিও আপলোড করুন'
      : 'শুধু JPG / PNG / WebP ছবি আপলোড করুন';
  }

  if (file.size > max) {
    return `ফাইল অনেক বড় (${formatBytes(file.size)}) — সর্বোচ্চ ${formatBytes(max)}`;
  }

  return null;
};

/**
 * একটা ফাইল Supabase Storage-এ আপলোড করে পাবলিক URL ফেরত দেয়।
 * @returns {Promise<{ok:true,url:string,path:string}|{ok:false,reason:string,message:string}>}
 */
export const uploadMedia = async (file, { kind = 'video', folder = 'products' } = {}) => {
  const invalid = validateMediaFile(file, kind);
  if (invalid) return { ok: false, reason: 'invalid', message: invalid };

  if (!isStorageReady()) {
    return {
      ok: false,
      reason: 'not-configured',
      message:
        'Supabase Storage কনফিগার করা নেই — ফাইল আপলোড করা যাবে না। .env-এ Supabase URL/key দিন, অথবা হোস্ট করা ভিডিওর URL পেস্ট করুন।',
    };
  }

  try {
    const ext = extFor(file);
    const base = slug(String(file.name || 'file').replace(/\.[^.]+$/, ''));
    const path = `${folder}/${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}-${base}.${ext}`;

    const { error } = await supabase.storage.from(MEDIA_BUCKET).upload(path, file, {
      cacheControl: '31536000',
      upsert: false,
      contentType: file.type || undefined,
    });

    if (error) throw error;

    const { data } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path);
    if (!data?.publicUrl) throw new Error('পাবলিক URL পাওয়া যায়নি');

    return { ok: true, url: data.publicUrl, path };
  } catch (err) {
    return {
      ok: false,
      reason: 'upload-failed',
      message: err?.message || String(err),
    };
  }
};
