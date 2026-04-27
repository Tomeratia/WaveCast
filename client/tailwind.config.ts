import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ocean: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0284c7',
          600: '#0369a1',
          700: '#075985',
          800: '#0c4a6e',
          900: '#0a3654',
          950: '#061e30',
        },
        // App dark theme (like surf-forecast.com)
        app: {
          bg:       '#0b1220',
          surface:  '#111827',
          card:     '#1a2235',
          border:   '#1f2d40',
          muted:    '#374151',
        },
        score: {
          flat: '#6b7280',
          poor: '#ef4444',
          fair: '#f59e0b',
          good: '#22c55e',
          epic: '#8b5cf6',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [
    function ({ addUtilities }: { addUtilities: (u: Record<string, Record<string, string>>) => void }) {
      addUtilities({
        '.scrollbar-none': { 'scrollbar-width': 'none', '-ms-overflow-style': 'none' },
      });
    },
  ],
} satisfies Config;
