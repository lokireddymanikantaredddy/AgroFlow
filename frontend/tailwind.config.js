/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'agro-green': {
          DEFAULT: '#16A34A',
          light: '#22C55E',
          dark: '#15803D'
        },
        'agro-light': '#388E3C',
        'agro-gray': '#616161',
        'agro-dark': '#212121',
        'agro-white': '#FAFAFA',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
} 