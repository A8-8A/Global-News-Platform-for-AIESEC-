/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        aiesec: {
          DEFAULT: '#037EF3',
          dark: '#0264c2',
          darker: '#024a91',
          light: '#e8f3fe',
          tint: '#f4f9ff',
        },
        ink: { DEFAULT: '#0d1b2a', soft: '#4a5a6a' },
        line: '#e4ebf2',
      },
      fontFamily: {
        sans: ['Lato', 'system-ui', 'sans-serif'],
        display: ['Raleway', 'system-ui', 'sans-serif'],
      },
      maxWidth: { feed: '600px' },
      boxShadow: {
        glow: '0 12px 28px -10px rgba(3,126,243,0.28)',
        'glow-lg': '0 24px 56px -16px rgba(3,126,243,0.45)',
      },
    },
  },
  plugins: [],
};
