/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Georgia', 'Cambria', 'Times New Roman', 'serif'],
        vazir: ['Vazirmatn', 'Shabnam', 'system-ui', 'sans-serif'],
      },
      colors: {
        paper: '#F1E8D5',
        liberal: '#275E73',
        fascist: '#A84338',
        gold: '#C9A96B',
        ink: '#252525',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'scale(0.97)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.25s ease-out forwards',
      },
    },
  },
  plugins: [],
};

