import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    // lib/ holds class-name maps too (e.g. lib/typing/layouts.ts FINGER_COLORS)
    // — without this line those classes never get generated.
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // Global type scale — readability-first for kids (user rule: regular
      // text is 16px, nothing below 14px anywhere). text-sm IS the regular
      // size; base/lg step up for body/lead copy. 2xl+ keep Tailwind defaults.
      fontSize: {
        xs: ['0.875rem', { lineHeight: '1.3rem' }],   // 14px — smallest allowed (badges/meta)
        sm: ['1rem', { lineHeight: '1.5rem' }],       // 16px — regular
        base: ['1.125rem', { lineHeight: '1.75rem' }], // 18px — body/lead
        lg: ['1.25rem', { lineHeight: '1.85rem' }],   // 20px
        xl: ['1.375rem', { lineHeight: '1.95rem' }],  // 22px
      },
      colors: {
        metaverse: {
          black: '#0A0A0A',
          darkPurple: '#1A0033',
          purple: '#6B46C1',
          lightPurple: '#9333EA',
          pink: '#EC4899',
          red: '#DC2626',
          darkRed: '#991B1B',
          glow: '#F472B6',
        }
      },
      backgroundImage: {
        'metaverse-gradient': 'linear-gradient(135deg, #0A0A0A 0%, #1A0033 25%, #6B46C1 50%, #DC2626 100%)',
        'metaverse-radial': 'radial-gradient(circle at 30% 50%, #6B46C1 0%, #1A0033 50%, #0A0A0A 100%)',
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite alternate',
        'float': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        glow: {
          'from': { textShadow: '0 0 10px #6B46C1, 0 0 20px #6B46C1, 0 0 30px #6B46C1' },
          'to': { textShadow: '0 0 20px #EC4899, 0 0 30px #EC4899, 0 0 40px #EC4899' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' }
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '.5' }
        }
      }
    },
  },
  plugins: [],
};

export default config;