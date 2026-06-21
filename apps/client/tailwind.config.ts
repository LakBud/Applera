import tailwindcssAnimate from 'tailwindcss-animate';

import type { Config } from 'tailwindcss';

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx}'],

  theme: {
    extend: {
      /* ================================================================
         COLORS
         ================================================================ */
      colors: {
        /* ── Typographic voice tokens ──────────────────────────────────
           Prefixed with "tx-" to avoid collision with shadcn's own
           "secondary", "muted", "body" etc. tokens.
           Use as: text-tx-h1, text-tx-body, text-tx-secondary …        */
        'tx-h1': 'var(--text-h1)',
        'tx-h2': 'var(--text-h2)',
        'tx-h3': 'var(--text-h3)',
        'tx-h4': 'var(--text-h4)',
        'tx-body': 'var(--text-body)',
        'tx-secondary': 'var(--text-secondary)',
        'tx-caption': 'var(--text-caption)',
        'tx-label': 'var(--text-label)',
        'tx-muted': 'var(--text-muted)',

        /* ── App semantic surfaces ─────────────────────────────────── */
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        'surface-muted': 'var(--surface-muted)',

        /* ── Green action system ───────────────────────────────────── */
        primary: {
          DEFAULT: '#1fa028',
          hover: '#166534',
          soft: '#dcfce7',
          dim: '#bbf7d0',
        },

        /* ── Status ────────────────────────────────────────────────── */
        success: '#22c55e',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#3b82f6',

        /* ── shadcn HSL bridge (required by shadcn components) ─────── */
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',

        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        shadcn: {
          primary: {
            DEFAULT: 'hsl(var(--primary))',
            foreground: 'hsl(var(--primary-foreground))',
          },
        },

        sidebar: {
          DEFAULT: 'hsl(var(--sidebar))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))',
        },

        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
      },

      /* ================================================================
         BORDER RADIUS
         ================================================================ */
      borderRadius: {
        sm: 'calc(var(--radius) - 4px)',
        md: 'calc(var(--radius) - 2px)',
        lg: 'var(--radius)',
        xl: 'calc(var(--radius) + 4px)',
        '2xl': 'calc(var(--radius) + 8px)',
      },

      /* ================================================================
         TYPOGRAPHY
         ================================================================ */
      fontFamily: {
        sans: ['Geist Variable', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['DM Mono', 'ui-monospace', 'monospace'],
        monda: ['Monda', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },

      /* ================================================================
         BOX SHADOWS
         ================================================================ */
      boxShadow: {
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        green: 'var(--shadow-green)',
      },

      /* ================================================================
         KEYFRAMES & ANIMATIONS
         ================================================================ */
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(6px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-right': {
          from: { opacity: '0', transform: 'translateX(12px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.96)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        'pulse-green': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgb(31 160 40 / 0.4)' },
          '50%': { boxShadow: '0 0 0 8px rgb(31 160 40 / 0)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.25s ease-out',
        'slide-in-right': 'slide-in-right 0.25s ease-out',
        'scale-in': 'scale-in 0.2s ease-out',
        'pulse-green': 'pulse-green 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },

      /* ================================================================
         MISC
         ================================================================ */
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      screens: {
        xs: '480px',
      },
    },
  },

  plugins: [tailwindcssAnimate],
} satisfies Config;
