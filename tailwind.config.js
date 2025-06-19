/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        nb: {
          100: '#23272e', // lightest panel
          200: '#1a1d23', // sidebar
          300: '#181a20', // card bg
          400: '#14161b', // terminal bg
          500: '#101216', // deepest bg
          border: '#23272e', // border color
          accent: '#facc15', // yellow accent
          text: '#e5e7eb', // light text
          subtext: '#a1a1aa', // muted texts
        },
      shadows: {
        'nb-accent': '0 0 10px 0 rgba(250, 204, 21, 0.5)',
      }
      }
    },
  },
  plugins: [],
}

