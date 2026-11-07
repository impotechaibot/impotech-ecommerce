export const formatMoney = (n) =>
  '\u09f3 ' + Number(n || 0).toLocaleString('en-US');

export const formatMoneyBn = (n) =>
  '\u09f3 ' + Number(n || 0).toLocaleString('en-US');

// Neutral placeholder used when an admin-created product has no image yet.
export const PLACEHOLDER_IMAGE =
  'data:image/svg+xml;charset=utf-8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600">' +
      '<rect width="600" height="600" fill="#141418"/>' +
      '<path d="M250 340l40-52 42 56 34-40 44 76H246z" fill="#2a2a31"/>' +
      '<circle cx="300" cy="248" r="26" fill="#f0b429" opacity=".35"/>' +
      '</svg>'
  );

/* ==========================================================
   Media helpers
   A product carries `images` (array) and `videos` (array).
   Older records only had a single `image` string, so every
   reader goes through productImages() which migrates on the fly.
   ========================================================== */

const VIDEO_EXT = /\.(mp4|webm|ogv|ogg|mov|m4v)(\?.*)?$/i;

/** True when a src points at a video (data: URL or file extension). */
export const isVideoUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  if (url.startsWith('data:video/')) return true;
  if (url.startsWith('data:image/')) return false;
  return VIDEO_EXT.test(url);
};

/** Normalised image list \u2014 supports the legacy single `image` field. */
export const productImages = (product) => {
  if (!product) return [];
  const list = Array.isArray(product.images)
    ? product.images.filter(Boolean)
    : [];
  if (list.length) return list;
  if (typeof product.image === 'string' && product.image) return [product.image];
  return [];
};

/** Normalised video list. */
export const productVideos = (product) =>
  product && Array.isArray(product.videos) ? product.videos.filter(Boolean) : [];

/** Image for a product at index i, with a safe fallback. */
export const productImage = (product, i = 0) => {
  const images = productImages(product);
  return images[i] || images[0] || PLACEHOLDER_IMAGE;
};

/** Combined gallery for the detail page: images first, then videos. */
export const productGallery = (product) => [
  ...productImages(product).map((src) => ({ kind: 'image', src })),
  ...productVideos(product).map((src) => ({ kind: 'video', src })),
];

/* ---------- size accounting (localStorage is only ~5MB) ---------- */

export const formatBytes = (bytes) => {
  const n = Number(bytes) || 0;
  if (n < 1024) return n + ' B';
  if (n < 1024 * 1024) return (n / 1024).toFixed(0) + ' KB';
  return (n / (1024 * 1024)).toFixed(2) + ' MB';
};

/** Approximate byte size of a data: URL payload. */
export const dataUrlBytes = (url) => {
  if (typeof url !== 'string' || !url.startsWith('data:')) return 0;
  const comma = url.indexOf(',');
  if (comma < 0) return 0;
  const head = url.slice(0, comma);
  const body = url.slice(comma + 1);
  if (head.includes('base64')) {
    const pad = (body.match(/=+$/) || [''])[0].length;
    return Math.max(0, Math.floor((body.length * 3) / 4) - pad);
  }
  return body.length;
};

export const listBytes = (list) =>
  (Array.isArray(list) ? list : []).reduce(
    (sum, url) => sum + dataUrlBytes(url),
    0
  );

export const productMediaBytes = (product) =>
  listBytes(productImages(product)) + listBytes(productVideos(product));

/** Safe headroom under the browser's ~5MB localStorage quota. */
export const STORAGE_BUDGET_BYTES = 4 * 1024 * 1024;
/** Above this a single video gets a "this is big" warning. */
export const VIDEO_WARN_BYTES = 800 * 1024;

export const slugToLabel = (slug) =>
  slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
