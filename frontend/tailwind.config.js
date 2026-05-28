/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        paper:         'var(--paper)',
        'paper-soft':  'var(--paper-soft)',
        'paper-deep':  'var(--paper-deep)',
        ink:           'var(--ink)',
        'ink-soft':    'var(--ink-soft)',
        'ink-faint':   'var(--ink-faint)',
        line:          'var(--line)',
        'line-strong': 'var(--line-strong)',
        aiesec:        'var(--accent)',     // keep existing alias
        'aiesec-dark': 'var(--accent-deep)',
        accent:        'var(--accent)',
        'accent-deep': 'var(--accent-deep)',
        'accent-soft': 'var(--accent-soft)',
        'accent-light':'var(--accent-light)',
        'accent-tint': 'var(--accent-tint)',
        success: 'var(--success)',
        warn:    'var(--warn)',
        danger:  'var(--danger)',
        live:    'var(--live)',
      },
      fontFamily: {
        display: ['Raleway', 'Helvetica Neue', 'Arial', 'sans-serif'],
        sans:    ['Lato', 'Helvetica Neue', 'Arial', 'sans-serif'],
        mono:    ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      letterSpacing: {
        tightish: '-0.015em',
        tighter2: '-0.02em',
        eyebrow:  '0.16em',
        masthead: '0.2em',
      },
      maxWidth: {
        feed:    '1240px',
        article: '760px',
        body:    '680px',
      },
      borderRadius: {
        DEFAULT: '6px',
        card:    '8px',
        hero:    '10px',
      },
      boxShadow: {
        card:  '0 24px 60px -28px rgba(26,34,51,0.18)',
        admin: '0 30px 80px -20px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.2)',
      },
    },
  },
  plugins: [],
};
