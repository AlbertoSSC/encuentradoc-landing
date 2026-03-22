/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        // Matches the app's blue primitive scale exactly
        primary: {
          50:  '#e8f4fd',
          100: '#c8e6fa',
          200: '#90cdf4',
          300: '#56b3eb',
          400: '#2196d9',
          500: '#038cd1',
          600: '#0274ae',
          700: '#0369a1',
          800: '#024e77',
          900: '#0c4a6e',
        },
        // Brand semantic tokens aligned with app's theme-variables.css
        brand: {
          dark:   '#0C1A2E',  // app dark surface background
          navy:   '#1E3A5F',  // app heading / inverse text
          accent: '#038cd1',  // app --brand (blue-500)
          light:  '#e8f4fd',  // app blue-50 (surface-brand-subtle)
        },
        // App surface tokens
        surface: {
          base:   '#f3f4f6',  // gray-100
          raised: '#ffffff',
          sunken: '#e5e7eb',  // gray-200
          hover:  '#f9fafb',  // gray-50
        },
      },
      fontFamily: {
        sans: ['"IBM Plex Sans"', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'sans-serif'],
      },
      boxShadow: {
        // App shadow scale
        xs: '0 1px 2px rgba(0, 0, 0, 0.05)',
        sm: '0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -1px rgba(0, 0, 0, 0.04)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.03)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 10px 10px -5px rgba(0, 0, 0, 0.03)',
      },
      borderRadius: {
        // App radius scale
        sm:  '0.25rem',
        md:  '0.375rem',
        lg:  '0.5rem',
        xl:  '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      transitionDuration: {
        fast:   '150',
        normal: '250',
        slow:   '400',
      },
    },
  },
  plugins: [],
};
