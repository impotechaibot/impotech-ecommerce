/**
 * whatsapp.js — WhatsApp নাম্বার নরমালাইজ + wa.me লিংক তৈরি
 * ------------------------------------------------------------
 * বসানোর পাথ:  src/lib/whatsapp.js
 *
 * কেন দরকার:
 *   WhatsApp-এর wa.me লিংকে নাম্বার **আন্তর্জাতিক ফরম্যাটে** চায় —
 *   কান্ট্রি কোডসহ, শুরুতে কোনো `0` ছাড়া, কোনো `+` / স্পেস / ড্যাশ ছাড়া।
 *
 *     ❌ https://wa.me/01884332067      → "Couldn't look up phone number"
 *     ✅ https://wa.me/8801884332067   → কাজ করে
 *
 *   সাইটে নাম্বার রাখা হয় লোকাল ফরম্যাটে (01884332067), তাই লিংক বানানোর
 *   আগে রূপান্তর জরুরি। এই ফাইলটাই সেই একমাত্র জায়গা — সব পেজ এখান থেকেই নেয়।
 */

/* ডিফল্ট কান্ট্রি কোড (বাংলাদেশ) */
export const DEFAULT_COUNTRY = '880';

/* নাম্বার থেকে সব অ-সংখ্যা বাদ দেয় */
const digitsOf = (value) => String(value ?? '').replace(/[^\d]/g, '');

/**
 * যেকোনো ফরম্যাটের নাম্বার → কান্ট্রি কোডসহ শুধু ডিজিট।
 *
 *   '01884332067'          → '8801884332067'
 *   '01884-332067'         → '8801884332067'
 *   '+880 1884-332067'     → '8801884332067'
 *   '8801884332067'        → '8801884332067'
 *   '008801884332067'      → '8801884332067'
 *   '1884332067'           → '8801884332067'
 *   ''  / null / 'abc'     → ''            (অবৈধ — লিংক বানানো হবে না)
 *
 * @param {string|number} raw       ব্যবহারকারীর দেওয়া নাম্বার
 * @param {string}        country   কান্ট্রি কোড, ডিফল্ট '880'
 * @returns {string} আন্তর্জাতিক ডিজিট, অবৈধ হলে খালি স্ট্রিং
 */
export function toWaNumber(raw, country = DEFAULT_COUNTRY) {
  let d = digitsOf(raw);
  if (!d) return '';

  /* 00880... → 880... (অনেক সময় আন্তর্জাতিক প্রিফিক্স এভাবে আসে) */
  if (d.startsWith('00')) d = d.slice(2);

  /* ইতিমধ্যে কান্ট্রি কোডসহ */
  if (d.startsWith(country)) {
    const local = d.slice(country.length);
    /* বাংলাদেশ: কান্ট্রি কোডের পর ১০ ডিজিট (1XXXXXXXXX) */
    if (local.length === 10) return country + local;
    return ''; // দৈর্ঘ্য ভুল — ভাঙা লিংক বানানোর চেয়ে না বানানো ভালো
  }

  /* লোকাল ফরম্যাট: 01XXXXXXXXX (১১ ডিজিট) */
  if (d.length === 11 && d.startsWith('0')) {
    return country + d.slice(1);
  }

  /* 0 ছাড়া লোকাল: 1XXXXXXXXX (১০ ডিজিট) */
  if (d.length === 10 && d.startsWith('1')) {
    return country + d;
  }

  /* অন্য দেশের নাম্বার — ইতিমধ্যে কান্ট্রি কোডসহ মনে হচ্ছে, যেমন আছে */
  if (!d.startsWith('0') && d.length >= 11 && d.length <= 15) {
    return d;
  }

  return '';
}

/**
 * wa.me লিংক তৈরি করে।
 * নাম্বার অবৈধ হলে খালি স্ট্রিং — কলার তখন বাটনটাই দেখাবে না।
 *
 * @param {string|number} raw
 * @param {string}        text   আগে থেকে লেখা মেসেজ (ঐচ্ছিক)
 * @returns {string}
 */
export function waLink(raw, text = '') {
  const number = toWaNumber(raw);
  if (!number) return '';
  const query = text ? `?text=${encodeURIComponent(text)}` : '';
  return `https://wa.me/${number}${query}`;
}

/**
 * স্ক্রিনে দেখানোর জন্য সুন্দর ফরম্যাট।
 *
 *   '01884332067' → '+880 1884-332067'
 *
 * @param {string|number} raw
 * @returns {string}
 */
export function waDisplay(raw) {
  const number = toWaNumber(raw);
  if (!number) return String(raw ?? '');
  if (number.startsWith('880') && number.length === 13) {
    return `+880 ${number.slice(3, 7)}-${number.slice(7)}`;
  }
  return `+${number}`;
}

/**
 * কল করার জন্য tel: লিংক (লোকাল ফরম্যাটে রাখা ভালো)।
 *
 * @param {string|number} raw
 * @returns {string}
 */
export function telLink(raw) {
  const d = digitsOf(raw);
  return d ? `tel:${d}` : '';
}

export default { toWaNumber, waLink, waDisplay, telLink, DEFAULT_COUNTRY };
