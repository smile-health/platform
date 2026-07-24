import { GrowthBook } from '@growthbook/growthbook-react'

export const growthbook = new GrowthBook({
  apiHost: process.env.GROWTHBOOK_API_HOST, // Get this from GrowthBook dashboard
  clientKey: process.env.GROWTHBOOK_CLIENT_KEY, // Get this from GrowthBook dashboard
  enableDevMode: true,
})
