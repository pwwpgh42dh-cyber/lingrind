/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-playfair)', 'Georgia', 'serif'],
        body: ['var(--font-dm-sans)', 'system-ui', 'sans-serif'],
      },
      colors: {
        pink: {
          dusty: '#D4A0A0',
          light: '#F2DEDE',
          medium: '#C88888',
          dark: '#A86060',
        },
        gray: {
          soft: '#F7F5F5',
          muted: '#8A8080',
          border: '#E8E2E2',
        }
      },
      boxShadow: {
        card: '0 2px 24px rgba(180,120,120,0.08)',
        'card-hover': '0 8px 40px rgba(180,120,120,0.14)',
        button: '0 4px 16px rgba(180,120,120,0.25)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      }
    },
  },
  plugins: [],
}
