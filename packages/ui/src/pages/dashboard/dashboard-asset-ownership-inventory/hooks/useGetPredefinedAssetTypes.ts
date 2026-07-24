import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'

import { getCoreAssetType } from '../../../asset-type/asset-type.service'
import { DASHBOARD_TYPE } from '../dashboard-asset-ownership-inventory.constant'

export const useGetPredefinedAssetTypes = () => {
  const {
    data: assetTypes,
    isLoading: isLoadingAssetTypes,
    refetch: refetchAssetTypes,
  } = useQuery({
    queryKey: ['asset-types'],
    queryFn: () =>
      getCoreAssetType(
        {
          page: 1,
          paginate: 10,
          dashboard_filter: DASHBOARD_TYPE.AssetInventory,
        },
        true
      ),
  })

  const predefinedAssetTypes = useMemo(
    () =>
      assetTypes?.data?.map((item) => ({
        label: item?.name,
        value: item?.id,
      })),
    [assetTypes]
  )

  return {
    predefinedAssetTypes,
    assetTypes,
    isLoadingAssetTypes,
    refetchAssetTypes,
  }
}
