/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        // One consistent family for Persian + Latin (Georgia/monospace have no Persian glyphs)
        sans: ['Vazirmatn', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        serif: ['Vazirmatn', 'system-ui', 'sans-serif'],
        mono: ['Vazirmatn', 'ui-monospace', 'SFMono-Regular', 'monospace'],
        vazir: ['Vazirmatn', 'system-ui', 'sans-serif'],
      },
      colors: {
        paper: '#F1E8D5',
        liberal: '#4aa3c7',
        fascist: '#e5534b',
        gold: '#d9b36a',
        ink: '#0a0d13',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(6px) scale(0.99)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        floaty: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
        glow: {
          '0%,100%': { boxShadow: '0 0 0 0 rgba(217,179,106,0.0)' },
          '50%': { boxShadow: '0 0 0 6px rgba(217,179,106,0.18)' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.3s cubic-bezier(.2,.8,.2,1) forwards',
        floaty: 'floaty 4s ease-in-out infinite',
        glow: 'glow 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
