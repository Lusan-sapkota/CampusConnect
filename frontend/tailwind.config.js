/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: {
          light: '#FAF9F2', // warm ivory for light mode
          dark: '#121212',  // dark mode background
        },
        text: {
          light: '#121212', // dark text for light mode
          dark: '#E0E0E0',  // light text for dark mode
        },
        accent: {
          teal: '#00BFAE',
          pink: '#FF4081',
          mustard: '#FFD600',
          orange: '#FAA968',
          cobalt: '#3D5AFE',
          redOrange: '#F85525',
        },
        primary: {
          50: '#F6DCAC',
          100: '#F8E1B0',
          200: '#FACD85',
          300: '#FBB660',
          400: '#FAA968',
          500: '#F85525',
          600: '#E04B20',
          700: '#C03F1A',
          800: '#A03314',
          900: '#80250F',
        },
        emerald: {
          50: '#ECFDF5',
          100: '#D1FAE5',
          200: '#A7F3D0',
          300: '#6EE7B7',
          400: '#34D399',
          500: '#10B981',
          600: '#059669',
          700: '#047857',
          800: '#065F46',
          900: '#064E3B',
        },
        retro: {
          navy: '#01204E',
          teal: '#028391',
          cream: '#F6DCAC',
          burntOrange: '#FAA968',
          magenta: '#FF4081',
          deepBlue: '#3D5AFE',
          mustard: '#FFD600',
        },
      },
      screens: {
        xs: '475px',
      },
      fontFamily: {
        sans: ['"Euclid Circular A"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};