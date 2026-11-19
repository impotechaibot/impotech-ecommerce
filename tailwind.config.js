/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        /* ==========================================================
           v21 — থিম না বদলানোর মূল জায়গা।
           ----------------------------------------------------------
           আগে এখানে হার্ডকোড হেক্স ছিল:
              bg: '#08080a',
              accent: '#f0b429',
           Tailwind এগুলো বিল্ড টাইমে সরাসরি CSS-এ বসিয়ে দেয় —
           অর্থাৎ `.bg-accent` থেকে যায় `background-color: #f0b429`।
           ফলে ThemeLayer :root-এ `--accent` বদলালেও কোনো ক্লাস সেটা
           পড়ত না। এখন সব টোকেন CSS ভেরিয়েবল থেকে আসে, তাই
           অ্যাডমিনে রঙ বদলালে সব জায়গায় বদলায়।

           `var(--x, #fallback)` — fallback রাখা হয়েছে যাতে
           index.css-এর :root ডিফল্ট না পড়লেও সাইট ভাঙবে না।
           ========================================================== */
        bg: 'var(--bg, #08080a)',
        surface: 'var(--surface, #101014)',
        surface2: 'var(--surface-2, #17171d)',
        line: 'var(--line, #26262e)',
        'line-strong': 'var(--line-strong, rgba(255,255,255,0.16))',
        ink: 'var(--text, #f4f4f6)',
        'ink-muted': 'var(--muted, #9a9aa6)',
        'ink-2': 'var(--muted-2, #6e6e78)',
        accent: 'var(--accent, #f0b429)',
        'accent-dark': 'var(--accent-dark, #c9920f)',
        'accent-soft': 'var(--accent-soft, rgba(240,180,41,0.14))',
      },
      borderRadius: {
        /* বাটনের গোলাকারও এখন অ্যাডমিন থেকে নিয়ন্ত্রিত */
        card: 'var(--radius, 18px)',
        field: 'var(--radius-sm, 12px)',
      },
      fontFamily: {
        sans: ['Hind Siliguri', 'Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
