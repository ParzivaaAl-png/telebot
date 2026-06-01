/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        space: {
          bg: '#0A1628',
          blue: '#00A3FF',
          purple: '#7B61FF',
          green: '#00C48C',
          white: '#FFFFFF',
          gray: '#8A9BB5',
        }
      }
    },
  },
  plugins: [],
}
