/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#A5825D',
          hover: '#8F6F4D',
          light: '#F3ECE5',
        },
        black: '#000000',
        white: '#FFFFFF',
        background: '#FFFFFF',
        surface: '#FAFAFA',
        text: {
          primary: '#000000',
          secondary: '#4A4A4A',
          muted: '#777777',
        },
        border: {
          DEFAULT: '#E8E8E8',
          strong: '#A5825D',
        },
        functional: {
          success: '#2E7D32',
          warning: '#C68A15',
          error: '#C62828',
          info: '#2F6FA3',
        },
        pixel: {
          navy: {
            950: '#000000',
            900: '#000000',
            800: '#000000',
            700: '#1A1A1A',
          },
          gold: {
            600: '#8F6F4D',
            500: '#A5825D',
            400: '#A5825D',
            300: '#F3ECE5',
          },
          black: '#000000',
          white: '#ffffff',
          neutral: {
            50: '#FAFAFA',
            100: '#F8F8F8',
            200: '#E8E8E8',
            500: '#777777',
            700: '#4A4A4A',
            900: '#000000',
          }
        },
        brand: {
          teal: '#A5825D',
          copper: '#A5825D',
          lightBlue: '#FAFAFA',
          grayBlue: '#E8E8E8'
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
        'grad-inst': 'linear-gradient(135deg, #000000 0%, #1A1A1A 100%)',
        'grad-premium': 'linear-gradient(135deg, #000000 0%, #1A1A1A 70%, #A5825D 140%)',
      }
    },
  },
  plugins: [],
}
