import { useEffect, useMemo } from "react"
import { ENTITY_TYPE } from "#constants/entity"
import useSmileRouter from "#hooks/useSmileRouter"
import { getUserStorage } from "#utils/storage/user"
import { AnnualPlanningProcessStatus } from "../annual-planning-process.constants"

type TypePages = 'create' | 'draft' | 'review' | 'revision' | 'detail'

// Helper functions to reduce cognitive complexity
const isProvinceOrVendor = (entityType?: number): boolean =>
  entityType === ENTITY_TYPE.PROVINSI || entityType === ENTITY_TYPE.PRIMARY_VENDOR

const isKota = (entityType?: number): boolean =>
  entityType === ENTITY_TYPE.KOTA

const shouldRedirectFromCreate = (entityType?: number): boolean =>
  isProvinceOrVendor(entityType)

const shouldRedirectFromDraft = (entityType?: number, status?: number): boolean => {
  if (isProvinceOrVendor(entityType)) return true
  if (!isKota(entityType)) return false

  return status === AnnualPlanningProcessStatus.DESK ||
    status === AnnualPlanningProcessStatus.APPROVED ||
    status === AnnualPlanningProcessStatus.REVISION
}

const shouldRedirectFromRevision = (entityType?: number, status?: number): boolean => {
  if (isProvinceOrVendor(entityType)) return true
  if (!isKota(entityType)) return false

  return status === AnnualPlanningProcessStatus.DESK ||
    status === AnnualPlanningProcessStatus.APPROVED ||
    status === AnnualPlanningProcessStatus.DRAFT
}

const shouldRedirectFromReview = (entityType?: number, status?: number): boolean => {
  if (isKota(entityType)) return true
  if (!isProvinceOrVendor(entityType)) return false

  return status === AnnualPlanningProcessStatus.DRAFT ||
    status === AnnualPlanningProcessStatus.APPROVED ||
    status === AnnualPlanningProcessStatus.REVISION
}

const shouldRedirectFromDetail = (entityType?: number, status?: number): boolean => {
  if (status === AnnualPlanningProcessStatus.DRAFT) return true
  if (isKota(entityType) && status === AnnualPlanningProcessStatus.REVISION) return true
  if (isProvinceOrVendor(entityType) && status === AnnualPlanningProcessStatus.DESK) return true

  return false
}

export const useAnnualPlanningProcessPermission = (typePages?: TypePages, status?: number) => {
  const user = getUserStorage()
  const { replace } = useSmileRouter()

  const currentStatus = useMemo(() => status ?? 0, [status])

  useEffect(() => {
    if (user?.view_only) {
      replace('/v5/annual-planning')
      return
    }

    const entityType = user?.entity.type
    let shouldRedirect = false

    switch (typePages) {
      case 'create':
        shouldRedirect = shouldRedirectFromCreate(entityType)
        break
      case 'draft':
        shouldRedirect = shouldRedirectFromDraft(entityType, currentStatus)
        break
      case 'revision':
        shouldRedirect = shouldRedirectFromRevision(entityType, currentStatus)
        break
      case 'review':
        shouldRedirect = shouldRedirectFromReview(entityType, currentStatus)
        break
      case 'detail':
        shouldRedirect = shouldRedirectFromDetail(entityType, currentStatus)
        break
    }

    if (shouldRedirect) {
      replace('/v5/annual-planning')
    }
  }, [user, typePages, currentStatus, replace])
}