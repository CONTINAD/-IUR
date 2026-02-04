/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyan: {
          400: '#22d3ee',
          500: '#06b6d4',
          DEFAULT: '#00eaff',
        },
        gold: {
          400: '#facc15',
          500: '#eab308',
          DEFAULT: '#ffd700',
        },
        dark: {
          900: '#050a14',
          800: '#0b1221',
        }
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 3s ease-in-out infinite alternate',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        glow: {
          'from': { boxShadow: '0 0 20px -10px #00eaff' },
          'to': { boxShadow: '0 0 50px 10px #00eaff' },
        }
      }
    },
  },
  plugins: [],
}
