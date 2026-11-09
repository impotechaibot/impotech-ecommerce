/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#08080a',
        surface: '#101014',
        surface2: '#17171d',
        line: '#26262e',
        ink: '#f4f4f6',
        'ink-muted': '#9a9aa6',
        accent: '#f0b429',
        'accent-dark': '#c9920f',
      },
      borderRadius: {
        card: '18px',
        field: '12px',
      },
      fontFamily: {
        sans: ['Hind Siliguri', 'Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
