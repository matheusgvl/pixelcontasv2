/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        pixel: {
          navy: {
            950: '#071329',
            900: '#0b1b3f',
            800: '#102752',
            700: '#183564',
          },
          gold: {
            600: '#b88735',
            500: '#d0a354',
            400: '#ddb96f',
            300: '#ecd39d',
          },
          black: '#050505',
          white: '#ffffff',
          neutral: {
            50: '#f8f8f6',
            100: '#f1f1ed',
            200: '#e5e5df',
            500: '#737373',
            700: '#404040',
            900: '#171717',
          }
        }
      },
      fontFamily: {
        sans: ['Inter', 'Geist', 'sans-serif'],
        title: ['Plus Jakarta Sans', 'Manrope', 'sans-serif'],
      },
      borderRadius: {
        'premium': '16px',
        'soft': '14px',
        'large': '18px',
      },
      boxShadow: {
        'premium': '0 8px 30px rgba(7, 19, 41, 0.08)',
        'premium-hover': '0 12px 30px -4px rgba(11, 31, 51, 0.08), 0 4px 12px -2px rgba(11, 31, 51, 0.04)',
      },
      backgroundImage: {
        'grad-inst': 'linear-gradient(135deg, #071329 0%, #0b1b3f 55%, #102752 100%)',
        'grad-premium': 'linear-gradient(135deg, #0b1b3f 0%, #102752 70%, #d0a354 140%)',
      }
    },
  },
  plugins: [],
}
