// Central product catalogue for the Impotech store.
// Kept in a plain data module (same pattern as the reference project's productsStore/Store.js)
// so components stay presentational and data can be swapped without touching JSX.

import hero1 from '../assets/hero-1.png';
import banner1 from '../assets/banner-1.png';
import banner2 from '../assets/banner-2.png';
import banner3 from '../assets/banner-3.png';
import productWhite from '../assets/product-white.png';
import productRed from '../assets/product-red.png';
import productBlue from '../assets/product-blue.png';

export const categories = [
  { id: 'angel-wings', name: 'অ্যাঞ্জেল উইংস', image: productWhite },
  { id: 'led-light', name: 'LED লাইট', image: productRed },
  { id: 'bike-accessories', name: 'বাইক অ্যাকসেসরিজ', image: productBlue },
  { id: 'riding-gear', name: 'রাইডিং গিয়ার', image: banner2 },
  { id: 'horn-siren', name: 'হর্ন ও সাইরেন', image: hero1 },
  { id: 'phone-holder', name: 'মোবাইল হোল্ডার', image: banner3 },
];

export const slides = [
  {
    id: 1,
    image: hero1,
    tag: 'নতুন কালেকশন ২০২৬',
    title: ['রাতের রাইডে', 'জ্বলে উঠুক ডানা'],
    text: 'মোটরসাইকেলের জন্য প্রিমিয়াম LED অ্যাঞ্জেল উইংস — ৩ রঙে, ওয়াটারপ্রুফ বিল্ড, সহজ ইনস্টলেশন।',
    cta: 'এখনই কিনুন',
  },
  {
    id: 2,
    image: banner1,
    tag: 'সীমিত সময়ের অফার',
    title: ['সব পণ্যে', 'ফ্রি ডেলিভারি'],
    text: 'ঢাকার ভিতরে ২৪ ঘণ্টায় ডেলিভারি। সারা বাংলাদেশে ক্যাশ অন ডেলিভারি সুবিধা।',
    cta: 'অফার দেখুন',
  },
  {
    id: 3,
    image: banner3,
    tag: 'বেস্ট সেলার',
    title: ['রাইডারদের', 'প্রথম পছন্দ'],
    text: '৫০০০+ সন্তুষ্ট কাস্টমার। অরিজিনাল কোয়ালিটি, ৭ দিনের রিপ্লেসমেন্ট গ্যারান্টি।',
    cta: 'কালেকশন দেখুন',
  },
];

export const banners = [
  { id: 1, image: banner1, title: 'ফ্ল্যাশ সেল', text: 'সর্বোচ্চ ৩০% ছাড়', category: 'led-light' },
  { id: 2, image: banner2, title: 'নতুন কালেকশন', text: '২০২৬ রাইডিং গিয়ার', category: 'riding-gear' },
  { id: 3, image: banner3, title: 'প্রিমিয়াম কোয়ালিটি', text: '৭ দিনের রিপ্লেসমেন্ট', category: 'bike-accessories' },
];

export const products = [
  {
    id: 'led-angel-wings-white',
    name: 'Motorcycle LED Angel Wings - White',
    bn: 'মোটরসাইকেল LED অ্যাঞ্জেল উইংস — সাদা',
    price: 650,
    oldPrice: 850,
    category: 'angel-wings',
    tag: 'নতুন',
    rating: 5,
    reviews: 42,
    stock: 24,
    images: [productWhite, banner1, hero1],
    colors: ['সাদা', 'নীল', 'বেগুনি'],
    badge: 'bestSeller',
    desc: 'উজ্জ্বল সাদা LED-তে তৈরি অ্যাঞ্জেল উইংস, যা রাতের রাইডে আপনার বাইককে আলাদা করে তোলে। ওয়াটারপ্রুফ বিল্ড ও সহজ ইনস্টলেশন।',
    features: ['IP65 ওয়াটারপ্রুফ', '৩ রঙে পরিবর্তনযোগ্য', '১২V DC, লো পাওয়ার', 'প্লাগ অ্যান্ড প্লে ইনস্টলেশন'],
  },
  {
    id: 'led-angel-wings-red',
    name: 'Motorcycle LED Angel Wings - Red',
    bn: 'মোটরসাইকেল LED অ্যাঞ্জেল উইংস — লাল',
    price: 650,
    oldPrice: 850,
    category: 'angel-wings',
    tag: '',
    rating: 5,
    reviews: 31,
    stock: 18,
    images: [productRed, banner1, hero1],
    colors: ['লাল', 'কমলা'],
    badge: '',
    desc: 'গাঢ় লাল আভার অ্যাঞ্জেল উইংস — স্পোর্টি লুক আর রাতের দৃশ্যমানতা একসাথে। মেটাল ব্র্যাকেট সহ আসে।',
    features: ['IP65 ওয়াটারপ্রুফ', 'মেটাল ব্র্যাকেট ফ্রি', 'লো ব্যাটারি ড্রেন', '১ বছরের সার্ভিস ওয়ারেন্টি'],
  },
  {
    id: 'led-angel-wings-blue',
    name: 'Motorcycle Angel Wings Light Blue',
    bn: 'মোটরসাইকেল অ্যাঞ্জেল উইংস — হালকা নীল',
    price: 650,
    oldPrice: 850,
    category: 'angel-wings',
    tag: '',
    rating: 4,
    reviews: 19,
    stock: 12,
    images: [productBlue, banner3, hero1],
    colors: ['হালকা নীল', 'সায়ান'],
    badge: '',
    desc: 'আইস-ব্লু আলোর অ্যাঞ্জেল উইংস, ক্লিন ও মডার্ন লুকের জন্য পারফেক্ট। সফট গ্লো, চোখে আরামদায়ক।',
    features: ['সফট আইস-ব্লু গ্লো', 'IP65 ওয়াটারপ্রুফ', 'সহজ ক্লিপ অন', 'কম তাপ উৎপাদন'],
  },
  {
    id: 'angel-wings-combo',
    name: 'LED Angel Wings Combo Pack',
    bn: 'LED অ্যাঞ্জেল উইংস কম্বো প্যাক',
    price: 1150,
    oldPrice: 1500,
    category: 'angel-wings',
    tag: 'কম্বো',
    rating: 5,
    reviews: 58,
    stock: 9,
    images: [banner1, productWhite, productRed],
    colors: ['মিক্সড'],
    badge: 'bestSeller',
    desc: 'তিনটি রঙের অ্যাঞ্জেল উইংস একসাথে — এক প্যাকেই পুরো সেট, দামেও সাশ্রয়।',
    features: ['৩টি ইউনিট একসাথে', 'রিমোট কন্ট্রোল', 'IP65 ওয়াটারপ্রুফ', 'ফ্রি ডেলিভারি'],
  },
  {
    id: 'riding-gloves-premium',
    name: 'Riding Gloves Premium',
    bn: 'রাইডিং গ্লাভস প্রিমিয়াম',
    price: 450,
    oldPrice: 600,
    category: 'riding-gear',
    tag: '',
    rating: 4,
    reviews: 27,
    stock: 40,
    images: [banner2, banner3, productBlue],
    colors: ['কালো', 'ব্রাউন'],
    badge: '',
    desc: 'নাকল প্রোটেকশন সহ লেদার রাইডিং গ্লাভস — গ্রিপ আর আরাম দুটোই। টাচস্ক্রিন ফ্রেন্ডলি আঙুল।',
    features: ['হার্ড নাকল প্রোটেকশন', 'টাচস্ক্রিন সাপোর্ট', 'ব্রিদেবল মেশ প্যানেল', 'সাইজ M / L / XL'],
  },
  {
    id: 'night-rider-led-kit',
    name: 'Night Rider LED Kit',
    bn: 'নাইট রাইডার LED কিট',
    price: 890,
    oldPrice: 1100,
    category: 'led-light',
    tag: 'হট',
    rating: 5,
    reviews: 36,
    stock: 15,
    images: [banner3, productRed, hero1],
    colors: ['মাল্টি'],
    badge: 'trending',
    desc: 'বাইকের চারপাশে ফুল LED স্ট্রিপ কিট — ৭টি রঙ, রিমোট কন্ট্রোল ও ব্রেক সিঙ্ক।',
    features: ['৭ কালার মোড', 'রিমোট কন্ট্রোল', 'ব্রেক লাইট সিঙ্ক', '১০ মিটার স্ট্রিপ'],
  },
  {
    id: 'bike-phone-holder',
    name: 'Bike Phone Holder Pro',
    bn: 'বাইক মোবাইল হোল্ডার প্রো',
    price: 380,
    oldPrice: 520,
    category: 'phone-holder',
    tag: '',
    rating: 4,
    reviews: 44,
    stock: 60,
    images: [banner3, productBlue, banner2],
    colors: ['কালো'],
    badge: '',
    desc: 'অ্যালুমিনিয়াম বডির মোবাইল হোল্ডার — ভাইব্রেশন ড্যাম্পার সহ, নেভিগেশনাল রাইডের জন্য আদর্শ।',
    features: ['অ্যালুমিনিয়াম বডি', '৩৬০° রোটেশন', 'ভাইব্রেশন ড্যাম্পার', '৪.৭–৭ ইঞ্চি ফোন'],
  },
  {
    id: 'horn-siren-100db',
    name: 'Dual Horn Siren 100dB',
    bn: 'ডুয়াল হর্ন সাইরেন ১০০dB',
    price: 720,
    oldPrice: 950,
    category: 'horn-siren',
    tag: '',
    rating: 4,
    reviews: 22,
    stock: 21,
    images: [productRed, banner1, productWhite],
    colors: ['লাল', 'কালো'],
    badge: '',
    desc: 'উচ্চ কম্পাঙ্কের ডুয়াল হর্ন — ট্রাফিকে স্পষ্ট শ্রবণযোগ্যতা, ওয়াটারপ্রুফ হাউজিং।',
    features: ['১০০dB সাউন্ড', 'ওয়াটারপ্রুফ হাউজিং', 'ইজি ওয়্যারিং', 'রিলে সহ'],
  },
  {
    id: 'saddle-bag-touring',
    name: 'Touring Saddle Bag',
    bn: 'ট্যুরিং স্যাডল ব্যাগ',
    price: 1290,
    oldPrice: 1690,
    category: 'bike-accessories',
    tag: '',
    rating: 5,
    reviews: 17,
    stock: 7,
    images: [banner2, banner1, productBlue],
    colors: ['কালো', 'অলিভ'],
    badge: 'new',
    desc: 'ওয়াটার রেজিস্ট্যান্ট ট্যুরিং স্যাডল ব্যাগ — লম্বা রাইডে ব্যাগেজের নির্ভরযোগ্য সঙ্গী।',
    features: ['৪০L ক্যাপাসিটি', 'ওয়াটার রেজিস্ট্যান্ট', 'রিফ্লেক্টিভ স্ট্রিপ', 'টুল-ফ্রি মাউন্ট'],
  },
  {
    id: 'led-headlight-bulb',
    name: 'LED Headlight Bulb H4',
    bn: 'LED হেডলাইট বাল্ব H4',
    price: 550,
    oldPrice: 750,
    category: 'led-light',
    tag: '',
    rating: 4,
    reviews: 63,
    stock: 33,
    images: [productWhite, hero1, banner3],
    colors: ['সাদা ৬০০০K'],
    badge: '',
    desc: '৬০০০K ডে-লাইট কালারের H4 LED বাল্ব — স্টক হ্যালোজেনের চেয়ে ৩ গুণ উজ্জ্বল।',
    features: ['৬০০০K কুল হোয়াইট', '৩x ব্রাইটনেস', 'প্লাগ অ্যান্ড প্লে', 'কম তাপ'],
  },
];

export const services = [
  {
    id: 1,
    tone: 'dark',
    title: 'দ্রুত শিপিং ও ডেলিভারি',
    text: 'দ্রুত ও নির্ভরযোগ্যভাবে আপনার ঠিকানায় পৌঁছে দেওয়া হয়।',
  },
  {
    id: 2,
    tone: 'green',
    title: '২৪/৭ কাস্টমার সাপোর্ট',
    text: 'যেকোনো প্রশ্নের জন্য দিনরাত আমাদের সাথে যোগাযোগ করুন।',
  },
  {
    id: 3,
    tone: 'red',
    title: 'সহজ রিটার্ন পলিসি',
    text: 'পণ্য পছন্দ না হলে বা কোনো সমস্যা হলে রিটার্ন দেওয়ার ব্যবস্থা আছে।',
  },
];

export const footerLinks = [
  {
    title: 'কোম্পানি',
    links: ['আমাদের সম্পর্কে', 'যোগাযোগ', 'ক্যারিয়ার', 'ব্লগ'],
  },
  {
    title: 'সহায়তা',
    links: ['অর্ডার ট্র্যাকিং', 'ডেলিভারি তথ্য', 'রিটার্ন পলিসি', 'প্রশ্নোত্তর'],
  },
  {
    title: 'ক্যাটাগরি',
    links: ['অ্যাঞ্জেল উইংস', 'LED লাইট', 'রাইডিং গিয়ার', 'মোবাইল হোল্ডার'],
  },
];

export const STORE_INFO = {
  name: 'ইম্পোটেক',
  nameEn: 'IMPOTECH',
  phone: '01884332067',
  address: 'ঢাকা, বাংলাদেশ',
  hours: 'সকাল ১০টা — রাত ১০টা',
};

export const findProduct = (id) => products.find((p) => p.id === id);

export const productsByCategory = (categoryId) =>
  products.filter((p) => p.category === categoryId);
