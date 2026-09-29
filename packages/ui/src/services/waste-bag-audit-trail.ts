import wmsAxios from '#lib/wms-axios'

export type WasteBagAuditTrailItem = {
  id: number
  createdAt: string
  updatedBy?: string
  wasteBagId: string
  event: string
  wasteBagStatus: string
  transportStatus: string | null
  healthcareFacilityId: number
  transporterId: number | null
  thirdPartyProviderId: number | null
  source: string
  isGroup?: boolean
  isFailed?: boolean
  remarks: string | null
}

export type ListWasteBagAuditTrailParams = {
  page: number
  limit: number
  search?: string
  wasteBagId?: string
  healthcareFacilityId?: string
  transporterId?: string
  thirdPartyProviderId?: string
}

export type ListWasteBagAuditTrailResult = {
  data: WasteBagAuditTrailItem[]
  pagination: {
    total: number
    pages: number
    currentPage: number
    perPage: number
  }
}

/**
 * `GET {WMS_API_URL}/audit-trail` (WMS_API_URL already ends in /api/v1) — kontrak dari `wasteBagAuditTrailController.ts`
 * (repo smile-platform/wms/backend). Guard `authenticate` biasa, bukan
 * superadmin-only seperti endpoint SMILE. Response dibungkus dua lapis
 * (`{ status, data: { data, pagination } }`) karena `res.success()` WMS
 * menaruh seluruh hasil use-case di field `data`.
 */
export async function listWasteBagAuditTrail(
  params: ListWasteBagAuditTrailParams
): Promise<ListWasteBagAuditTrailResult> {
  const response = await wmsAxios.get('/audit-trail', { params })
  return response?.data?.data
}
