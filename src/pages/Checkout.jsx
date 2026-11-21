/* CheckoutTheme.css — চেকআউট পেজকে অ্যাডমিনের থিমের সাথে মেলানো
 * কেন: Checkout.jsx-এ bg-white / text-gray-500 / bg-black এর মতো
 * ফিক্সড রঙ আছে। তাই ডার্ক থিমে সাদা কার্ডের ভেতরে সাদা লেখা
 * (দেখা যায় না) হচ্ছিল, আর অ্যাডমিন থেকে রঙ বদলালে চেকআউটে পড়ত না।
 * এখানে ওই রঙগুলো থিমের ভেরিয়েবল (--surface, --text, --accent ...) দিয়ে
 * বদলানো হয়েছে — শুধু .co-page-এর ভেতরে। */

.co-page {
  color: var(--text);
}

/* কার্ডের ব্যাকগ্রাউন্ড */
.co-page .bg-white {
  background: var(--surface-solid);
}
.co-page .bg-gray-50,
.co-page .bg-gray-100 {
  background: var(--surface-2);
}

/* বর্ডার */
.co-page .border-gray-200 {
  border-color: var(--line);
}
.co-page .border-gray-300 {
  border-color: var(--line-strong);
}
.co-page .border-black {
  border-color: var(--accent);
}

/* লেখার রঙ */
.co-page .text-gray-500,
.co-page .text-gray-600 {
  color: var(--muted);
}
