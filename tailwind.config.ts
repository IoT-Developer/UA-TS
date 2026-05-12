import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: '#F4F1EA',  // warm off-white paper
          alt: '#EDE8DD',      // slightly darker variant
          ink: '#0E0E0C',      // near-black
        },
        ink: {
          DEFAULT: '#0E0E0C',
          muted: '#5A564E',
          subtle: '#8A8378',
        },
        accent: {
          DEFAULT: '#FF5A1F',  // industrial orange
          glow: '#FF7A3D',
        },
        rule: '#1A1A17',       // for hairline borders
      },
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        'display-1': ['clamp(3.5rem, 8vw, 7.5rem)', { lineHeight: '0.95', letterSpacing: '-0.03em' }],
        'display-2': ['clamp(2.5rem, 5vw, 4.5rem)', { lineHeight: '1.0', letterSpacing: '-0.025em' }],
        'eyebrow': ['0.7rem', { lineHeight: '1.2', letterSpacing: '0.18em' }],
      },
      opacity: {
        '12': '0.12',
        '15': '0.15',
      },
      animation: {
        'marquee': 'marquee 40s linear infinite',
        'fade-up': 'fadeUp 0.8s ease-out forwards',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
