import { GrowthBook } from '@growthbook/growthbook-react'

export const growthbook = new GrowthBook({
  apiHost: process.env.NEXT_PUBLIC_GROWTHBOOK_API_HOST || process.env.GROWTHBOOK_API_HOST, // Get this from GrowthBook dashboard
  clientKey: process.env.NEXT_PUBLIC_GROWTHBOOK_CLIENT_KEY || process.env.GROWTHBOOK_CLIENT_KEY, // Get this from GrowthBook dashboard
  enableDevMode: true,
})
