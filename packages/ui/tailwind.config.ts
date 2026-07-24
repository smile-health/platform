import type { Config } from 'tailwindcss'
import colors from 'tailwindcss/colors'

export default {
  content: ['./src/**/*.tsx', './src/**/*.ts'],
  prefix: 'ui-',
  theme: {
    extend: {
      // adjust color to match brand color here
      colors: {
        //read more: https://tailwindcss.com/docs/customizing-colors
        'primary': {
          '50': 'rgb(var(--color-primary-50) / <alpha-value>)',
          '100': 'rgb(var(--color-primary-100) / <alpha-value>)',
          '200': 'rgb(var(--color-primary-200) / <alpha-value>)',
          '300': 'rgb(var(--color-primary-300) / <alpha-value>)',
          '400': 'rgb(var(--color-primary-400) / <alpha-value>)',
          '500': 'rgb(var(--color-primary-500) / <alpha-value>)',
          '600': 'rgb(var(--color-primary-600) / <alpha-value>)',
          '700': 'rgb(var(--color-primary-700) / <alpha-value>)',
          '800': 'rgb(var(--color-primary-800) / <alpha-value>)',
          '900': 'rgb(var(--color-primary-900) / <alpha-value>)',
          '950': 'rgb(var(--color-primary-950) / <alpha-value>)',
          'contrast': 'rgb(var(--color-primary-contrast) / <alpha-value>)',
          'surface': 'rgb(var(--color-primary-surface) / <alpha-value>)',
        },
        'secondary': {
          ...colors.orange,
          contrast: 'rgb(var(--color-orange-contrast) / <alpha-value>)',
        },
        'success': {
          ...colors.emerald,
          contrast: 'rgb(var(--color-emerald-contrast) / <alpha-value>)',
        },
        'danger': {
          ...colors.red,
          contrast: 'rgb(var(--color-red-contrast) / <alpha-value>)',
        },
        'info': {
          ...colors.blue,
          contrast: 'rgb(var(--color-blue-contrast) / <alpha-value>)',
        },
        'warning': {
          ...colors.yellow,
          contrast: 'rgb(var(--color-yellow-contrast) / <alpha-value>)',
        },
        'gray': {
          ...colors.gray,
          contrast: 'rgb(var(--color-gray-contrast) / <alpha-value>)',
        },
        'slate': {
          ...colors.slate,
          contrast: 'rgb(var(--color-slate-contrast) / <alpha-value>)',
        },
        'dark-teal': '#073B4C',
        'dark-blue': '#0C3045',
        'neutral': colors.neutral,
        'polynesianblue': {
          '50': 'rgb(var(--color-polynesianblue-50) / <alpha-value>)',
          '100': 'rgb(var(--color-polynesianblue-100) / <alpha-value>)',
          '200': 'rgb(var(--color-polynesianblue-200) / <alpha-value>)',
          '300': 'rgb(var(--color-polynesianblue-300) / <alpha-value>)',
          '400': 'rgb(var(--color-polynesianblue-400) / <alpha-value>)',
          '500': 'rgb(var(--color-polynesianblue-500) / <alpha-value>)',
          '600': 'rgb(var(--color-polynesianblue-600) / <alpha-value>)',
          '700': 'rgb(var(--color-polynesianblue-700) / <alpha-value>)',
          '800': 'rgb(var(--color-polynesianblue-800) / <alpha-value>)',
          '900': 'rgb(var(--color-polynesianblue-900) / <alpha-value>)',
          '950': 'rgb(var(--color-polynesianblue-950) / <alpha-value>)',
          'contrast':
            'rgb(var(--color-polynesianblue-contrast) / <alpha-value>)',
        },
      },
      maxWidth: {
        form: '612px',
      },
      // add custom animation
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'enter': {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'leave': {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '100%': { transform: 'scale(0.9)', opacity: '0' },
        },
        'slide-in': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(0)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'enter': 'enter 200ms ease-out',
        'slide-in': 'slide-in 1.2s cubic-bezier(.41,.73,.51,1.02)',
        'leave': 'leave 150ms ease-in forwards',
      },
      height: {
        xs: '10vh', // 10% of viewport height
        sm: '25vh', // 25% of viewport height
        md: '50vh', // 50% of viewport height
        lg: '75vh', // 75% of viewport height
        xl: '90vh', // 90% of viewport height
      },
      maxHeight: {
        xs: '10vh', // 10% of viewport height
        sm: '25vh', // 25% of viewport height
        md: '50vh', // 50% of viewport height
        lg: '75vh', // 75% of viewport height
        xl: '90vh', // 90% of viewport height
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms')({
      strategy: 'class',
    }),
  ],
} satisfies Config
