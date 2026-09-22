const { headers } = require('next/headers')
const fs = require('fs')
const path = require('path')

// VitePress renders a markdown link to a folder's index.md as a directory URL
// (href="./interop-layer/"), and its client router puts the same form in the
// address bar. Next strips the trailing slash and public/ has no file at
// /docs/architecture/interop-layer, so reloading or sharing such a URL 404s.
//
// One parameterised rewrite (`/docs/:path(...)` -> `/docs/:path/index.html`)
// would cover this in a single rule, and it does work under `next dev` -- but
// under a production build it 404s: only param-free rewrite destinations reach
// the public/ file handler. So enumerate the folders instead. This runs at
// build time, after docs#build has populated public/docs (turbo orders it
// first), which keeps the list in step with the docs as they grow.
function docsDirectoryRewrites() {
  const docsRoot = path.join(__dirname, 'public', 'docs')
  const rewrites = []

  const walk = (dir) => {
    let entries
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true })
    } catch {
      return // public/docs is absent when the web app is built without the docs package
    }
    for (const entry of entries) {
      if (!entry.isDirectory()) continue
      const sub = path.join(dir, entry.name)
      if (fs.existsSync(path.join(sub, 'index.html'))) {
        const url = '/docs/' + path.relative(docsRoot, sub).split(path.sep).join('/')
        rewrites.push({ source: url, destination: `${url}/index.html` })
      }
      walk(sub)
    }
  }

  walk(docsRoot)
  return rewrites
}

// On staging/prod, every service sits behind one gateway (API_BASE_URL),
// path-routed -- so API_CORE_URL etc. default to API_BASE_URL + a suffix
// and changing environments only means changing API_BASE_URL. Locally,
// though, each service commonly runs standalone on its own port (no
// shared gateway in front), so each of these can also be set directly in
// .env.* to override the derived default -- same escape hatch WMS_API_URL
// already used for the same reason. Example local override:
//   API_CORE_URL=http://localhost:4000
//   API_AUTH_URL=http://localhost:3003
const API_BASE_URL = process.env.API_BASE_URL

module.exports = {
  env: {
    STORAGE_PREFIX: process.env.STORAGE_PREFIX,
    API_BASE_URL,
    API_CORE_URL: process.env.API_CORE_URL || `${API_BASE_URL}/core`,
    API_MAIN_URL: process.env.API_MAIN_URL || `${API_BASE_URL}/main`,
    // Path confirmed against
    // packages/global-tests/test/api/warehouse/auth.setup.ts, which hits
    // `${AUTH_BASE_URL}/auth/login` directly.
    API_AUTH_URL: process.env.API_AUTH_URL || `${API_BASE_URL}/auth`,
    API_BIG_DATA_URL:
      process.env.API_BIG_DATA_URL || `${API_BASE_URL}/warehouse-report`,
    DEVICE_TYPE: process.env.DEVICE_TYPE,
    DATE_FORMAT: process.env.DATE_FORMAT,
    CURRENCY: process.env.CURRENCY,
    GEOJSON_MAPS_URL: process.env.GEOJSON_MAPS_URL,
    GROWTHBOOK_API_HOST: process.env.GROWTHBOOK_API_HOST,
    GROWTHBOOK_CLIENT_KEY: process.env.GROWTHBOOK_CLIENT_KEY,
    ASSET_VENDOR_TYPE_COMMUNICATION_PROVIDER: process.env.ASSET_VENDOR_TYPE_COMMUNICATION_PROVIDER,
    KESLING_PROGRAM_ID: process.env.KESLING_PROGRAM_ID,
    MAX_HUMIDITY_THRESHOLD: process.env.MAX_HUMIDITY_THRESHOLD,
    MIN_HUMIDITY_THRESHOLD: process.env.MIN_HUMIDITY_THRESHOLD,
    // WMS module (apps/web/wms-module, apps/web/pages/wms) — kept as distinct names
    // from this app's own API_URL/STORAGE_PREFIX so the two don't clobber each other's
    // storage keys or backend calls now that they share one bundle. WMS_API_URL still
    // points at the standalone wms backend (not yet merged, see apps/wms-service).
    WMS_API_URL: process.env.WMS_API_URL,
    WMS_STORAGE_PREFIX: process.env.WMS_STORAGE_PREFIX,
    SMILE_STORAGE_PREFIX: process.env.SMILE_STORAGE_PREFIX,
    NEXT_PUBLIC_URL_DASHBOARD_EXECUTIVE: process.env.NEXT_PUBLIC_URL_DASHBOARD_EXECUTIVE,
    NEXT_PUBLIC_DASHBOARD_EXECUTIVE_MENU: process.env.NEXT_PUBLIC_DASHBOARD_EXECUTIVE_MENU,
    YOUTUBE_LATLONG_VIDEO_ID: process.env.YOUTUBE_LATLONG_VIDEO_ID,
  },
  transpilePackages: ['@repo/ui'],
  output: 'standalone',
  images: {
    // Program config.icon_url (see apps/core program.schema.ts) is now a
    // full URL served from wherever this deployment hosts static/program
    // assets, rather than always being one of the locally-bundled
    // /images/icon-programs/*.png files — allow the shared badr.co.id asset
    // hosts next/image is seeing in practice (smile-platform.badr.co.id and
    // siblings), same domain family as API_BASE_URL/GROWTHBOOK_API_HOST above.
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.badr.co.id',
      },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    // The wms-module merge hasn't been through a full tsc pass yet — same escape hatch
    // the standalone wms app's own next.config.mjs used.
    ignoreBuildErrors: true,
  },
  // VitePress builds the docs site into public/docs (see docs/.vitepress/config.ts).
  // Next serves public/ files by exact path, so /docs/ERD.html already works but a
  // bare /docs would fall through to the pages/[lang] dynamic route and render the
  // app shell with lang="docs". beforeFiles runs ahead of both the filesystem and
  // the dynamic routes, so it has to be beforeFiles -- a plain rewrites array
  // (afterFiles) runs too late to win against [lang].
  async rewrites() {
    return {
      beforeFiles: [
        { source: '/docs', destination: '/docs/index.html' },
        { source: '/docs/', destination: '/docs/index.html' },
        ...docsDirectoryRewrites(),
      ],
    }
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
