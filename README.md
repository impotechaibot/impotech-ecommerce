# ইম্পোটেক ওয়েবসাইট (impotech-website)

ইম্পোটেক স্টোরের **কাস্টমার-ফেসিং ওয়েবসাইট** — React + Vite + Tailwind + Supabase।
অ্যাডমিন অ্যাপের সাথে **একই ডেটা** ব্যবহার করে, তাই অ্যাডমিন থেকে যোগ করা প্রোডাক্ট/সার্ভিস/সেটিংস সাইটে সাথে সাথে দেখা যায়।

> **অ্যাডমিন অ্যাপ আলাদা প্রজেক্ট** (`impotech-admin`) — সেটা দিয়ে সাইট নিয়ন্ত্রণ করা হয়। এই প্রজেক্ট শুধু কাস্টমার যেটা দেখে।

---

## ০. দ্রুত শুরু (ডেমো মোড — Supabase ছাড়াই)

**Supabase কনফিগার না করেই সাইট চলে।** `.env` ফাইলে আসল URL/key না থাকলে সাইট স্বয়ংক্রিয়ভাবে **ডেমো মোডে** চলে:

- সব ডেটা (প্রোডাক্ট, ক্যাটাগরি, সার্ভিস, FAQ, পলিসি, সেটিংস) ব্রাউজারের `localStorage`-এ থাকে
- অ্যাডমিন অ্যাপের সাথে **একই key** (`impotech_admin_db_v1`) ব্যবহার করে — একই ব্রাউজারে অ্যাডমিন ও সাইট খুললে ডেটা শেয়ার হয়
- ১০টি প্রোডাক্ট, ৬টি ক্যাটাগরি, ৫টি সার্ভিস, ৫টি FAQ, ৫টি পলিসি, ২টি কুপন — সব seed করা

```bash
npm install
npm run dev      # http://localhost:5173
```

পরে Supabase যোগ করলে (নিচের ধাপ ২–৪) সাইট স্বয়ংক্রিয়ভাবে আসল ডেটাবেসে চলে যাবে — **কোড বদলাতে হবে না।**

---

## ১. প্রজেক্টে কী আছে

| পেজ | ফাইল | কাজ |
|------|------|-----|
| হোম | `src/pages/Home.jsx` | হিরো স্লাইডার, ক্যাটাগরি, ফিচার্ড, ব্যানার, সার্ভিস, নতুন পণ্য, নিউজলেটার |
| শপ | `src/pages/Shop.jsx` | সার্চ, ক্যাটাগরি ফিল্টার, দামের রেঞ্জ, সর্ট, পেজিনেশন |
| প্রোডাক্ট ডিটেইল | `src/pages/ProductDetail.jsx` | ইমেজ গ্যালারি, **একাধিক ভিডিও (muted অটো-প্লে + সাউন্ড বাটন)**, ভ্যারিয়েন্ট, রিভিউ, রিলেটেড |
| কার্ট | `src/pages/Cart.jsx` | পরিমাণ বদল, রিমুভ, সাবটোটাল |
| চেকআউট | `src/pages/Checkout.jsx` | bKash/Nagad/COD, কুপন, ডেলিভারি চার্জ, অর্ডার প্লেস |
| অর্ডার সফল | `src/pages/OrderSuccess.jsx` | অর্ডার কোড + ট্র্যাক লিংক |
| ট্র্যাক | `src/pages/Track.jsx` | অর্ডার কোড + মোবাইল দিয়ে স্ট্যাটাস |
| অ্যাকাউন্ট | `src/pages/Account.jsx` | লগইন/রেজিস্টার (ডেমো), অর্ডার হিস্টরি |
| উইশলিস্ট | `src/pages/Wishlist.jsx` | পছন্দের পণ্য |
| সার্ভিস | `src/pages/Services.jsx` | সার্ভিস লিস্টিং |
| সার্ভিস ডিটেইল | `src/pages/ServiceDetail.jsx` | সার্ভিসের বিস্তারিত |
| ব্লগ | `src/pages/Blog.jsx` | ব্লগ লিস্টিং |
| FAQ | `src/pages/Faq.jsx` | প্রশ্নোত্তর |
| পলিসি | `src/pages/Policy.jsx` | রিটার্ন/রিফান্ড/শিপিং/প্রাইভেসি/শর্তাবলী |
| যোগাযোগ | `src/pages/Contact.jsx` | ফোন, ইমেইল, ঠিকানা, WhatsApp |
| ল্যান্ডিং পেজ | `src/pages/LandingPage.jsx` | `/lp/{slug}` — অ্যাডমিন থেকে বানানো ক্যাম্পেইন পেজ |
| ৪০৪ | `src/pages/NotFound.jsx` | পেজ না পেলে |

**ডেটা লেয়ার:** `src/context/StoreContext.jsx` (কেন্দ্রীয়), `src/lib/localdb.js` (ডেমো DB), `src/lib/supabase.js`, `src/lib/cart.js`, `src/lib/format.js`, `src/lib/seo.js`

---

## ২. সেটআপ

### ধাপ ১ — ডিপেন্ডেন্সি ইনস্টল

```bash
npm install
```

### ধাপ ২ — `.env` ফাইল

```bash
cp .env.example .env
```

তারপর `.env`-এ বসান:

```bash
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9....
VITE_SITE_URL=https://impotech.sellsull.com
```

> `.env` না বানালেও সাইট ডেমো মোডে চলবে।

### ধাপ ৩ — Supabase (অ্যাডমিনের সাথে **একই** প্রজেক্ট)

অ্যাডমিন অ্যাপে যে Supabase প্রজেক্ট ব্যবহার করেছেন, **এখানেও একই URL ও anon key** দিন।
তাহলে অ্যাডমিন থেকে যোগ করা প্রোডাক্ট/সার্ভিস সাইটে দেখা যাবে।

> অ্যাডমিন অ্যাপের `supabase/migrations/000_all_in_one.sql` একবার রান করলেই সব টেবিল তৈরি হবে।

### ধাপ ৪ — চালান

```bash
npm run dev      # http://localhost:5173
```

---

## ৩. বিল্ড ও ডিপ্লয়

```bash
npm run build    # dist/ ফোল্ডার তৈরি হবে
npm run preview  # লোকাল প্রোডাকশন বিল্ড দেখুন
```

**Vercel-এ ডিপ্লয়:**
1. [vercel.com](https://vercel.com) → **Add New → Project** → Git রিপো ইমপোর্ট করুন
2. Framework: **Vite**, Build Command: `npm run build`, Output: `dist`
3. **Environment Variables**-এ `.env`-এর ভেরিয়েবলগুলো যোগ করুন
4. **Deploy** চাপুন

**Netlify:** Build command `npm run build`, Publish directory `dist`।

---

## ৪. অ্যাডমিন ↔ ওয়েবসাইট ডেটা শেয়ার

দুই প্রজেক্ট **একই Supabase প্রজেক্ট** ব্যবহার করলে:

- অ্যাডমিন থেকে প্রোডাক্ট/সার্ভিস/ক্যাটাগরি যোগ করলে → ওয়েবসাইটে সাথে সাথে দেখা যাবে
- অ্যাডমিন থেকে অর্ডার স্ট্যাটাস বদলালে → কাস্টমার ট্র্যাক পেজে আপডেট দেখা যাবে
- অ্যাডমিন থেকে থিম/হোম কনটেন্ট/SEO বদলালে → সাইটে প্রতিফলিত হবে

> Supabase না থাকলে দুই প্রজেক্টই localStorage ডেমো মোডে চলে — একই ব্রাউজারে অ্যাডমিন ও সাইট খুললে ডেটা শেয়ার হয়।

---

## ৫. ফোল্ডার স্ট্রাকচার

```
impotech-website/
├── .env.example
├── .gitignore
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── vercel.json
├── vite.config.js
├── README.md
├── docs/                    # ডিপ্লয় গাইড (বাংলা)
├── public/                  # favicon.svg, robots.txt, sitemap.xml
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── index.css
    ├── lib/                 # supabase.js, localdb.js, cart.js, format.js, seo.js
    ├── context/             # StoreContext.jsx
    ├── components/          # Header, Footer, ProductCard, HeroSlider, Newsletter, Rating, Seo, Loader
    └── pages/               # ১৭টি পেজ
```

---

## ৬. নিরাপত্তা নোট

- **`service_role` key** কখনো ফ্রন্টএন্ডে রাখবেন না — সব RLS বাইপাস করে
- শুধু `anon key` ব্যবহার করুন
- `.env` ফাইল GitHub-এ আপলোড করবেন না — `.gitignore`-এ আছে
- Supabase ফ্রি প্রজেক্ট ১ সপ্তাহ নিষ্ক্রিয় থাকলে pause হয়

---

## ৭. ডিপ্লয় গাইড (বাংলা)

`docs/` ফোল্ডারে ধাপে ধাপে গাইড:

- `01-অ্যাডমিন-ডিপ্লয়.md` — অ্যাডমিন অ্যাপ GitHub → Vercel
- `02-ওয়েবসাইট-ডিপ্লয়.md` — এই ওয়েবসাইট GitHub → Vercel
- `03-অ্যাডমিন-থেকে-পুশ.md` — অ্যাডমিন থেকে সরাসরি GitHub-এ পুশ
- `04-সমস্যা-ও-সমাধান.md` — সাধারণ এরর ও সমাধান
- `05-সুপabase-সেটআপ.md` — Supabase সেটআপ
