/* ==========================================================
   layout.js — প্রোডাক্ট পেজের লেআউট ভ্যারিয়েন্ট
   ----------------------------------------------------------
   বসানোর পাথ:  src/lib/layout.js   (নতুন ফাইল)

   অ্যাডমিনের "লেআউট" ট্যাব থেকে যা বাছা হয়, সেটি
   settings.layout-এ জমা হয় এবং ProductDetail.jsx এখান থেকে
   ক্লাস-নাম বের করে।
   ========================================================== */

export const DEFAULT_LAYOUT = {
  imageRatio: 'square',   // square | wide | tall
  titleStyle: 'stacked',  // stacked | inline | centered
  priceStyle: 'inline',   // inline | stacked | boxed
  buttonStyle: 'split',   // split | stacked | full
  descStyle: 'plain',     // plain | card | bullets
  spacing: 'cozy',        // compact | cozy | roomy
  stickyBar: true,
};

export const LAYOUT_GROUPS = [
  {
    key: 'imageRatio',
    label: 'ছবির অনুপাত',
    options: [
      { value: 'square', label: 'স্কয়ার (১:১)' },
      { value: 'wide', label: 'ওয়াইড (৪:৩)' },
      { value: 'tall', label: 'টল (৩:৪)' },
    ],
  },
  {
    key: 'titleStyle',
    label: 'শিরোনামের বিন্যাস',
    options: [
      { value: 'stacked', label: 'স্ট্যাকড' },
      { value: 'inline', label: 'ইনলাইন' },
      { value: 'centered', label: 'সেন্টারড' },
    ],
  },
  {
    key: 'priceStyle',
    label: 'দামের বিন্যাস',
    options: [
      { value: 'inline', label: 'ইনলাইন' },
      { value: 'stacked', label: 'স্ট্যাকড' },
      { value: 'boxed', label: 'বক্সড' },
    ],
  },
  {
    key: 'buttonStyle',
    label: 'বাটনের বিন্যাস',
    options: [
      { value: 'split', label: 'স্প্লিট' },
      { value: 'stacked', label: 'স্ট্যাকড' },
      { value: 'full', label: 'ফুল' },
    ],
  },
  {
    key: 'descStyle',
    label: 'বর্ণনার স্টাইল',
    options: [
      { value: 'plain', label: 'প্লেইন' },
      { value: 'card', label: 'কার্ড' },
      { value: 'bullets', label: 'বুলেট' },
    ],
  },
  {
    key: 'spacing',
    label: 'স্পেসিং',
    options: [
      { value: 'compact', label: 'কম্প্যাক্ট' },
      { value: 'cozy', label: 'কোজি' },
      { value: 'roomy', label: 'রুমি' },
    ],
  },
];

const ALLOWED = LAYOUT_GROUPS.reduce((acc, g) => {
  acc[g.key] = g.options.map((o) => o.value);
  return acc;
}, {});

/** কখনো ক্র্যাশ করে না — ভুল/খালি ইনপুটে ডিফল্ট ফেরত দেয়। */
export const resolveLayout = (raw) => {
  const src = raw && typeof raw === 'object' ? raw : {};
  const out = { ...DEFAULT_LAYOUT };
  Object.keys(ALLOWED).forEach((k) => {
    if (ALLOWED[k].includes(src[k])) out[k] = src[k];
  });
  out.stickyBar = src.stickyBar !== false;
  return out;
};

/** ProductDetail.jsx-এ ব্যবহারের জন্য ক্লাস-নাম। */
export const layoutClasses = (raw) => {
  const l = resolveLayout(raw);
  return {
    page: `pd-page pd-space-${l.spacing}`,
    grid: 'pd-grid',
    gallery: `pd-gallery pd-ratio-${l.imageRatio}`,
    info: `pd-info pd-title-${l.titleStyle} pd-price-${l.priceStyle}`,
    buy: `pd-buy pd-buy-${l.buttonStyle}`,
    desc: `pd-desc-body pd-desc-${l.descStyle}`,
    sticky: l.stickyBar,
  };
};

/** বর্ণনার টেক্সটকে বুলেট তালিকায় ভাঙে। */
export const toBullets = (text) => {
  if (!text) return [];
  return String(text)
    .split(/\n+/)
    .map((s) => s.replace(/^[\s•\-*]+/, '').trim())
    .filter(Boolean);
};
