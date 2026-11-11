module.exports = {
  plugins: [
    'postcss-import',
    // Utility tanpa prefix untuk class lama, lihat styles/globals.css.
    '@tailwindcss/postcss',
    // Tailwind 4 (di @repo/ui) bergantung pada cascade layers native. Polyfill
    // cascade-layers dari preset-env meratakan @layer sehingga preflight dan CSS
    // global mengalahkan utility ui:*.
    ['postcss-preset-env', { features: { 'cascade-layers': false } }],
  ],
}
