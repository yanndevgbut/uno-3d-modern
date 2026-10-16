/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        uno: {
          red: '#EF233C',
          blue: '#0077B6',
          green: '#2A9D8F',
          yellow: '#FFB703',
          dark: '#0B0F19',
          card: '#161F30',
          felt: '#0E1726',
        },
      },
      boxShadow: {
        '3d-card': '0 8px 18px -4px rgba(0, 0, 0, 0.6), 0 2px 6px -1px rgba(255, 255, 255, 0.1) inset',
        '3d-card-hover': '0 16px 32px -6px rgba(0, 0, 0, 0.8), 0 0 20px 2px rgba(255, 255, 255, 0.25)',
        'felt-table': 'inset 0 0 120px 20px rgba(0, 0, 0, 0.8), 0 20px 40px rgba(0, 0, 0, 0.9)',
        'neon-red': '0 0 20px rgba(239, 35, 60, 0.5)',
        'neon-blue': '0 0 20px rgba(0, 119, 182, 0.5)',
        'neon-green': '0 0 20px rgba(42, 157, 143, 0.5)',
        'neon-yellow': '0 0 20px rgba(255, 183, 3, 0.5)',
      },
      keyframes: {
        deal: {
          '0%': { transform: 'scale(0.3) translate(0, -200px) rotate(-30deg)', opacity: '0' },
          '100%': { transform: 'scale(1) translate(0, 0) rotate(0deg)', opacity: '1' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.6', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.05)' },
        },
      },
      animation: {
        deal: 'deal 0.35s cubic-bezier(0.2, 0.8, 0.2, 1) forwards',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
