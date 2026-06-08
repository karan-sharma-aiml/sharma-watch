/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        gold: {
          50:  '#FDF8EC',
          100: '#F9EDCC',
          200: '#F2D98A',
          300: '#E8C553',
          400: '#D4AF37',
          500: '#C9A02A',
          600: '#A07820',
          700: '#785616',
          800: '#503A0D',
          900: '#281D06',
        },
        dark: {
          50:  '#2A2A2A',
          100: '#222222',
          200: '#1C1C1C',
          300: '#161616',
          400: '#111111',
          500: '#0D0D0D',
          600: '#0A0A0A',
          700: '#080808',
          800: '#050505',
          900: '#000000',
        },
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans:  ['"Inter"', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in':        'fadeIn 0.5s ease-out forwards',
        'fade-in-up':     'fadeInUp 0.6s ease-out forwards',
        'slide-in-right': 'slideInRight 0.35s ease-out forwards',
        'slide-in-left':  'slideInLeft 0.35s ease-out forwards',
        'pulse-slow':     'pulse 3s ease-in-out infinite',
        shimmer:          'shimmer 2s linear infinite',
        'spin-slow':      'spin 3s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%':   { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%':   { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        slideInLeft: {
          '0%':   { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition:  '200% 0' },
        },
      },
      backgroundImage: {
        'gold-gradient':
          'linear-gradient(135deg, #D4AF37 0%, #F2D98A 50%, #D4AF37 100%)',
        'dark-gradient':
          'linear-gradient(135deg, #111111 0%, #0D0D0D 100%)',
        'hero-gradient':
          'radial-gradient(ellipse at 60% 50%, #1a1400 0%, #0D0D0D 70%)',
      },
    },
  },
  plugins: [],
};