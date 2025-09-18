/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: 'rgb(248 250 252)',
          dark: 'rgb(17 24 39)',
        },
        accent: {
          DEFAULT: 'rgb(59 130 246)',
          dark: 'rgb(96 165 250)',
        },
      },
    },
  },
  plugins: [],
};
