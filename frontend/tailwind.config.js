/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        aiesec: { DEFAULT: '#037EF3', dark: '#0264c2' },
        ink: { DEFAULT: '#1a1a1a', soft: '#5c6671' },
        line: '#e6e8eb',
      },
      fontFamily: {
        sans: ['Lato', 'system-ui', 'sans-serif'],
        display: ['Raleway', 'system-ui', 'sans-serif'],
      },
      maxWidth: { feed: '600px' },
    },
  },
  plugins: [],
};
