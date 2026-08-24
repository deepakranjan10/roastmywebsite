import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#0a0a0f',
          900: '#0f0f17',
          800: '#16161f',
          700: '#1e1e2a',
          600: '#2a2a38',
        },
        flame: {
          400: '#ff9d5c',
          500: '#ff5c33',
          600: '#ff2d55',
          700: '#e0143c',
        },
        acid: {
          400: '#d4ff3f',
          500: '#c2ff00',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        body: ['"Inter"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      backgroundImage: {
        'flame-gradient': 'linear-gradient(135deg, #ff2d55 0%, #ff5c33 45%, #ff9d5c 100%)',
        'grid-fade':
          'radial-gradient(ellipse at top, rgba(255,45,85,0.15), transparent 60%)',
      },
      animation: {
        flicker: 'flicker 2.5s ease-in-out infinite',
        'rise-in': 'rise-in 0.5s ease-out both',
        'pop-in': 'pop-in 0.35s cubic-bezier(.34,1.56,.64,1) both',
      },
      keyframes: {
        flicker: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.85' },
        },
        'rise-in': {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'pop-in': {
          from: { opacity: '0', transform: 'scale(0.92)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
