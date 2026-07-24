import { entityTypeList } from '#constants/entity'
import { ProgramIntegrationClient } from '#constants/program'
import { EXTERNAL_USER_ROLE, USER_ROLE, userRoleList } from '#constants/roles'
import { RequestloginResponse } from '#types/auth'

import { getUserStorage } from './storage/user'

export const isViewOnly = (comparison: number = 1) => {
  const user = getUserStorage()

  return user?.view_only === comparison
}

export const getRoleById = (id: number) => {
  const find = userRoleList.find((obj) => obj.value === id)

  return find?.['label'] ?? ''
}

export const getEntityType = (id?: number) => {
  const find = entityTypeList.find((obj) => obj.value === id)

  return find?.['label'] ?? ''
}

export function getDeviceLogin(last_device?: number) {
  if (!last_device) return null

  return last_device === 1 ? 'Web' : 'Mobile'
}

export const isSuperAdmin = (user?: RequestloginResponse | null) => {
  return user ? user?.role === USER_ROLE.SUPERADMIN : false
}

export const asExternalSuperAdmin = (user?: RequestloginResponse | null) => {
  return user
    ? user?.external_properties?.role?.id === EXTERNAL_USER_ROLE.SUPERADMIN
    : null
}

export const asExternalAdmin = (user?: RequestloginResponse | null) => {
  return user
    ? user?.external_properties?.role?.id === EXTERNAL_USER_ROLE.ADMIN
    : null
}

export const isWms = (integrationClientId: number | null) => {
  return integrationClientId === ProgramIntegrationClient.WasteManagement
}

export const isUserWMS = (user?: RequestloginResponse | null) => {
  return user ? isWms(user.integration_client_id) : false
}

export const isUserEntityWMS = (user?: RequestloginResponse | null) => {
  return user ? isWms(user?.entity.integration_client_id) : false
}
