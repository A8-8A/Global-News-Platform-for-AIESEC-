/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // AIESEC brand blue
        aiesec: {
          DEFAULT: '#037EF3',
          dark: '#0264C2',
          light: '#E6F2FE',
        },
      },
    },
  },
  plugins: [],
};
