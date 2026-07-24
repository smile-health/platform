import { useEffect } from 'react'
import useSmileRouter from '#hooks/useSmileRouter'
import { hasPermission } from '#shared/permission/index'
import { getUserStorage } from '#utils/storage/user'

export default function useOrderCreateCentralDistributionPermission() {
  const router = useSmileRouter()

  useEffect(() => {
    const user = getUserStorage()
    const isSuperadmin = hasPermission('order-central-mutate')
    const isManufacturer = hasPermission('order-manufacturer-central-mutate')
    const isHasAccess =
      isSuperadmin || (isManufacturer && user?.manufacture?.type === 1)

    if (!isHasAccess) {
      router.replaceGlobal('/v5/403')
    }
  }, [router])
}
