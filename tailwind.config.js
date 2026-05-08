/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '1rem',
    },
    extend: {
      colors: {
        background: { DEFAULT: 'var(--background)' },
        foreground: { DEFAULT: 'var(--foreground)' },
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)',
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          foreground: 'var(--secondary-foreground)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--accent-foreground)',
        },
        cyan: {
          DEFAULT: 'var(--cyan)',
          foreground: 'var(--cyan-foreground)',
        },
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        card: {
          DEFAULT: 'var(--card)',
          foreground: 'var(--card-foreground)',
        },
        border: { DEFAULT: 'var(--border)' },
        input: { DEFAULT: 'var(--input)' },
        ring: { DEFAULT: 'var(--ring)' },
      },
      borderRadius: {
        DEFAULT: 'var(--radius)',
        sm: 'calc(var(--radius) - 2px)',
        md: 'var(--radius)',
        lg: 'calc(var(--radius) + 4px)',
        xl: 'calc(var(--radius) + 8px)',
        '2xl': 'calc(var(--radius) + 16px)',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'hero-gradient': 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(59,130,246,0.2), transparent 70%)',
      },
      animation: {
        'neon-pulse': 'neon-pulse 2s ease-in-out infinite alternate',
        'neon-pulse-purple': 'neon-pulse-purple 2.5s ease-in-out infinite alternate',
        'float': 'float 6s ease-in-out infinite',
        'scan': 'scan 3s linear infinite',
        'shimmer': 'shimmer 1.8s ease-in-out infinite',
        'fade-in': 'fade-in 0.5s ease forwards',
        'slide-up': 'slide-up 0.5s ease forwards',
        'spin-slow': 'spin 8s linear infinite',
      },
      keyframes: {
        'neon-pulse': {
          'from': { boxShadow: '0 0 10px rgba(59,130,246,0.3), 0 0 30px rgba(59,130,246,0.1)', borderColor: 'rgba(59,130,246,0.4)' },
          'to': { boxShadow: '0 0 25px rgba(59,130,246,0.7), 0 0 60px rgba(59,130,246,0.3)', borderColor: 'rgba(59,130,246,0.8)' },
        },
        'neon-pulse-purple': {
          'from': { boxShadow: '0 0 10px rgba(139,92,246,0.3)', borderColor: 'rgba(139,92,246,0.4)' },
          'to': { boxShadow: '0 0 25px rgba(139,92,246,0.7), 0 0 60px rgba(139,92,246,0.3)', borderColor: 'rgba(139,92,246,0.8)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        'scan': {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '10%': { opacity: '1' },
          '90%': { opacity: '1' },
          '100%': { transform: 'translateY(400%)', opacity: '0' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'fade-in': {
          'from': { opacity: '0' },
          'to': { opacity: '1' },
        },
        'slide-up': {
          'from': { opacity: '0', transform: 'translateY(20px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      boxShadow: {
        'glow-blue': '0 0 20px rgba(59,130,246,0.4), 0 0 60px rgba(59,130,246,0.15)',
        'glow-purple': '0 0 20px rgba(139,92,246,0.4), 0 0 60px rgba(139,92,246,0.15)',
        'glow-cyan': '0 0 20px rgba(6,182,212,0.4), 0 0 60px rgba(6,182,212,0.15)',
        'card-dark': '0 4px 24px rgba(0,0,0,0.4), 0 1px 0 rgba(255,255,255,0.06) inset',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};