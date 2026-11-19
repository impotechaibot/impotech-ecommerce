/**
 * layout.js — প্রোডাক্ট পেজের লেআউট ভ্যারিয়েন্ট
 * ------------------------------------------------------------
 * বসানোর পাথ:  src/lib/layout.js   (নতুন ফাইল)
 *
 * অ্যাডমিন → "লেআউট" ট্যাব থেকে যা বেছে নেওয়া হয়, তা
 * localStorage['impotech_site'].layout-এ সেভ হয়।
 * resolveLayout() সেই মান পড়ে নিরাপদ ডিফল্টসহ ফেরত দেয়,
 * আর নিচের ক্লাস-ম্যাপগুলো ProductDetail.jsx-এ প্রয়োগ হয়।
 * ------------------------------------------------------------
 */

/* ---------- ডিফল্ট (কিছু সেট না থাকলে আগের চেহারাই) ---------- */
export const DEFAULT_LAYOUT = {
  gallery: 'square',   // square | wide | tall
  title: 'stacked',    // stacked | inline | centered
  price: 'inline',     // inline | stacked | boxed
  buttons: 'split',    // split | stacked | full
  desc: 'plain',       // plain | card | bullets
  density: 'cozy',     // compact | cozy | roomy
  stickyBar: true,     // মোবাইলে নিচে ভাসমান কার্ট বার
};

const VALID = {
  gallery: ['square', 'wide', 'tall'],
  title: ['stacked', 'inline', 'centered'],
  price: ['inline', 'stacked', 'boxed'],
  buttons: ['split', 'stacked', 'full'],
  desc: ['plain', 'card', 'bullets'],
  density: ['compact', 'cozy', 'roomy'],
};

/** যেকোনো ইনপুট → বৈধ লেআউট অবজেক্ট (কখনো ক্র্যাশ করবে না) */
export function resolveLayout(raw) {
  const src = raw && typeof raw === 'object' ? raw : {};
  const out = { ...DEFAULT_LAYOUT };

  Object.keys(VALID).forEach((key) => {
    const v = src[key];
    if (typeof v === 'string' && VALID[key].includes(v)) out[key] = v;
  });

  if (typeof src.stickyBar === 'boolean') out.stickyBar = src.stickyBar;

  return out;
}

/* ---------- গ্যালারির অনুপাত ---------- */
export const GALLERY_CLASS = {
  square: 'aspect-square',
  wide: 'aspect-[4/3]',
  tall: 'aspect-[3/4]',
};

/* ---------- স্পেসিং ---------- */
export const DENSITY_CLASS = {
  compact: {
    card: 'p-3 sm:p-5',
    gap: 'gap-3 lg:gap-8',
    section: 'mt-2.5',
    info: 'space-y-2.5',
  },
  cozy: {
    card: 'p-3.5 sm:p-6',
    gap: 'gap-4 lg:gap-10',
    section: 'mt-3',
    info: 'space-y-3',
  },
  roomy: {
    card: 'p-4 sm:p-7',
    gap: 'gap-5 lg:gap-12',
    section: 'mt-4',
    info: 'space-y-4',
  },
};

/* ---------- শিরোনাম ---------- */
export const TITLE_CLASS = {
  stacked: 'text-[19px] leading-[1.45] sm:text-2xl sm:leading-snug',
  inline: 'text-[19px] leading-[1.45] sm:text-2xl sm:leading-snug',
  centered: 'text-center text-[19px] leading-[1.45] sm:text-2xl sm:leading-snug',
};

/* ---------- দাম ---------- */
export const PRICE_CLASS = {
  inline: 'flex flex-wrap items-end gap-x-2.5 gap-y-1',
  stacked: 'flex flex-col items-start gap-1',
  boxed: 'flex flex-wrap items-end gap-x-2.5 gap-y-1 rounded-field bg-surface2 px-3 py-2.5',
};

/* ---------- বাটন ---------- */
export const BUTTON_CLASS = {
  split: 'flex gap-2',
  stacked: 'flex flex-col gap-2',
  full: 'flex flex-col gap-2',
};

/* ---------- বর্ণনা ---------- */
export const DESC_CLASS = {
  plain: '',
  card: 'rounded-field bg-surface2 p-3.5',
  bullets: '',
};

/**
 * টেক্সট → বুলেট লাইন
 * ডেটাবেসে বর্ণনা এক প্যারাগ্রাফে লেখা থাকলেও ভেঙে সুন্দর তালিকা হয়।
 */
export function toBullets(text) {
  const raw = String(text || '').trim();
  if (!raw) return [];

  const lines = raw
    .split(/\r?\n|(?<=[।.!?])\s+/)
    .map((s) => s.replace(/^[-•*\d.)\s]+/, '').trim())
    .filter((s) => s.length > 2);

  return lines.length > 1 ? lines : [];
}
