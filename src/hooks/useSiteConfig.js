// ============================================================
// ফাইল: src/hooks/useSiteConfig.js
// কাজ: শুধু fetchRemoteSiteConfig ফাংশনটা বদলান। বাকি কিছু ছোঁবেন না।
//
// কীভাবে বদলাবেন:
// ১. ফাইলে এই লাইনটা খুঁজুন:
//      /** Supabase থেকে সেটিংস পড়ে। না পেলে / ফেল করলে null। */
// ২. ওই লাইন থেকে শুরু করে ফাংশনের শেষের `};` পর্যন্ত
//    (যেটা "/** সেটিংস Supabase-এ লেখে" লাইনের ঠিক আগে) সব মুছুন।
// ৩. মোছা জায়গায় নিচের কোডটা বসান।
// ============================================================

/** Supabase থেকে সেটিংস পড়ে। না পেলে / ফেল করলে null।
 *
 *  site_settings টেবিলে সেটিংস দুই ভাবে থাকতে পারে:
 *   ক) আলাদা সারি: checkout, theme, contact, identity
 *   খ) একটি বড় সারি: key = 'site'
 *  এখন দুটোই পড়া হয়। অগ্রাধিকার (কম → বেশি):
 *   ডিফল্ট  <  আলাদা সারি  <  'site' সারি (খালি না হলে)
 */
export const fetchRemoteSiteConfig = async () => {
  if (!isSupabaseConfigured || !supabase) return null;
  try {
    const { data, error } = await supabase
      .from(SITE_TABLE)
      .select('key, value');
    if (error) throw error;
    if (!Array.isArray(data) || data.length === 0) return null;

    const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v);

    const rows = {};
    data.forEach((r) => {
      if (r && isObj(r.value)) rows[r.key] = r.value;
    });

    // আলাদা সারিগুলো থেকে একটি প্যাচ বানাই
    const fromRows = {};
    // identity-র ফিল্ডগুলো (siteName, logo, tagline ...) কনফিগে সরাসরি উপরের স্তরে থাকে
    if (isObj(rows.identity)) Object.assign(fromRows, rows.identity);
    ['checkout', 'theme', 'contact'].forEach((k) => {
      if (isObj(rows[k])) fromRows[k] = rows[k];
    });

    const hasRows = Object.keys(fromRows).length > 0;
    const hasSite = isObj(rows.site) && Object.keys(rows.site).length > 0;

    /* কিছুই না থাকলে রিমোট নেই ধরে নাও — নাহলে লোকাল সেটিং মুছে যেত */
    if (!hasRows && !hasSite) return null;

    const merged = mergeDeep(DEFAULT_SITE, fromRows);
    return hasSite ? mergeDeep(merged, rows.site) : merged;
  } catch (err) {
    console.warn('[site] Supabase থেকে পড়া যায়নি — localStorage ব্যবহার হচ্ছে', err);
    return null;
  }
};
