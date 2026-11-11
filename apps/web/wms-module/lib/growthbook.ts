import { GrowthBook } from '@growthbook/growthbook-react'

const clientKey =
  process.env.NEXT_PUBLIC_GROWTHBOOK_CLIENT_KEY || process.env.GROWTHBOOK_CLIENT_KEY

// GrowthBook 2 melempar "Missing clientKey" saat init/refresh tanpa key, dan
// itu membuat seluruh halaman crash. Tanpa key, flag tetap memakai nilai default.
export const isGrowthbookEnabled = Boolean(clientKey)

export const growthbook = new GrowthBook({
  apiHost: process.env.NEXT_PUBLIC_GROWTHBOOK_API_HOST || process.env.GROWTHBOOK_API_HOST, // Get this from GrowthBook dashboard
  clientKey, // Get this from GrowthBook dashboard
  enableDevMode: true,
})
