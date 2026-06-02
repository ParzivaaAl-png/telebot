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
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', '"SF Pro Display"', '"SF Pro Text"', '"Segoe UI"', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
      },
      boxShadow: {
        'ios-card': '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
        'ios-popup': '0 12px 40px 0 rgba(0, 0, 0, 0.4)',
        'glow-blue': '0 0 12px rgba(0, 163, 255, 0.25)',
        'glow-purple': '0 0 12px rgba(123, 97, 255, 0.25)',
        'glow-green': '0 0 12px rgba(0, 196, 140, 0.25)',
      }
    },
  },
  plugins: [],
}
