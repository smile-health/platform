const { headers } = require('next/headers')


module.exports = {
  env: {
    SITE_TITLE: process.env.SITE_TITLE,
    STORAGE_PREFIX: process.env.STORAGE_PREFIX,
    CAPTCHA_SITE_KEY: process.env.CAPTCHA_SITE_KEY,
    CAPTCHA_SECRET_KEY: process.env.CAPTCHA_SECRET_KEY,
    API_URL: process.env.API_URL,
    API_URL_ALT: process.env.API_URL_ALT,
    API_AUTH_URL: process.env.API_AUTH_URL,
    API_ASSET_URL: process.env.API_ASSET_URL,
    API_REPORT_URL: process.env.API_REPORT_URL,
    API_ETL: process.env.API_ETL,
    DEVICE_TYPE: process.env.DEVICE_TYPE,
    DATE_FORMAT: process.env.DATE_FORMAT,
    DATE_TIME_FORMAT: process.env.DATE_TIME_FORMAT,
    FUSIONCHART_LICENSE: process.env.FUSIONCHART_LICENSE,
    API_BIG_DATA_URL: process.env.API_BIG_DATA_URL,
    API_URL_V5: process.env.API_URL_V5,
    CURRENCY: process.env.CURRENCY,
    URL_WMS: process.env.URL_WMS,
    GEOJSON_MAPS_URL: process.env.GEOJSON_MAPS_URL,
    GROWTHBOOK_API_HOST: process.env.GROWTHBOOK_API_HOST,
    GROWTHBOOK_CLIENT_KEY: process.env.GROWTHBOOK_CLIENT_KEY,
    ASSET_VENDOR_TYPE_COMMUNICATION_PROVIDER: process.env.ASSET_VENDOR_TYPE_COMMUNICATION_PROVIDER,
    KESLING_PROGRAM_ID: process.env.KESLING_PROGRAM_ID,
    MAX_HUMIDITY_THRESHOLD: process.env.MAX_HUMIDITY_THRESHOLD,
    MIN_HUMIDITY_THRESHOLD: process.env.MIN_HUMIDITY_THRESHOLD,
  },
  transpilePackages: ['@repo/ui'],
  output: 'standalone',
  eslint: {
    ignoreDuringBuilds: true,
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors 'none';",
          },
        ],
      },
    ]
  }
}
