import { getAuthTokenCookies } from '#utils/storage/auth'
import axios from 'axios'

/**
 * WMS backend (apps/wms-encore) is a separate service, not part of the
 * `apps/core`/`apps/main` gateway behind API_BASE_URL. `WMS_API_URL` is the
 * same env var apps/web/wms-module/lib/axios.ts uses and already ends in
 * `/api/v1`, so request paths here are relative to that (e.g. `/audit-trail`).
 * Reuses the SMILE bearer token — WMS validates it against core.
 */
const wmsAxios = axios.create({
  baseURL: process.env.WMS_API_URL,
})

wmsAxios.interceptors.request.use((config) => {
  const token = getAuthTokenCookies()
  if (token) config.headers['Authorization'] = `Bearer ${token}`
  return config
})

export default wmsAxios
