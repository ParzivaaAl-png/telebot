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
      },
      fontFamily: {
        orbitron: ['Orbitron', 'sans-serif'],
        rajdhani: ['Rajdhani', 'sans-serif'],
        space: ['Space Grotesk', 'sans-serif'],
        exo: ['Exo 2', 'sans-serif'],
      },
      boxShadow: {
        'glow-blue': '0 0 15px rgba(0, 163, 255, 0.5)',
        'glow-purple': '0 0 15px rgba(123, 97, 255, 0.5)',
        'glow-green': '0 0 15px rgba(0, 196, 140, 0.5)',
      }
    },
  },
  plugins: [],
}
