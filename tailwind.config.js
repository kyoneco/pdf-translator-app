/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        surface: 'var(--surface)',
        'surface-muted': 'var(--surface-muted)',
        'surface-strong': 'var(--surface-strong)',
        accent: 'var(--accent)',
        'accent-strong': 'var(--accent-strong)'
      },
      boxShadow: {
        panel: '0 1px 3px rgba(15, 23, 42, 0.1)'
      }
    }
  },
  plugins: []
};
