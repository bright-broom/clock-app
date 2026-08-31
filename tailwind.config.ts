import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: 'hsl(var(--color-bg-primary))',
          overlay: 'hsl(var(--color-bg-overlay))',
          'overlay-strong': 'hsl(var(--color-bg-overlay-strong))',
        },
        foreground: {
          DEFAULT: 'hsl(var(--color-fg-primary))',
          muted: 'hsl(var(--color-fg-muted))',
          disabled: 'hsl(var(--color-fg-disabled))',
        },
        border: {
          DEFAULT: 'hsl(var(--color-border-default))',
        },
        primary: {
          DEFAULT: 'hsl(var(--color-primary))',
          foreground: 'hsl(var(--color-primary-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--color-accent))',
          foreground: 'hsl(var(--color-accent-foreground))',
        },
        ring: {
          DEFAULT: 'hsl(var(--color-ring))',
        },
        status: {
          running: 'hsl(var(--color-status-running))',
        },
      },
      dropShadow: {
        glow: '0 0 1.618rem hsl(var(--color-shadow))',
      },
    },
  },
  plugins: [],
}

export default config
