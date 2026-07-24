import React, { useMemo } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { useFeatureIsOn } from '@growthbook/growthbook-react'
import { useQuery } from '@tanstack/react-query'
import { ColumnDef } from '@tanstack/react-table'
import Meta from '#components/layouts/Meta'
import Container from '#components/layouts/PageContainer'
import { BOOLEAN } from '#constants/common'
import { usePermission } from '#hooks/usePermission'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'
import useSmileRouter from '#hooks/useSmileRouter'
import AssetManagementsDeviceRelation from '#pages/asset-managements/components/AssetManagementsDeviceRelationTable'
import Error403Page from '#pages/error/Error403Page'
import Error404Page from '#pages/error/Error404Page'
import { ErrorResponse } from '#types/common'
import { numberFormatter } from '#utils/formatter'
import { AxiosError } from 'axios'
import { useTranslation } from 'react-i18next'

import { RELATION_TYPE } from '../../asset-managements/asset-managements.constants'
import { TRelationData } from '../../asset-managements/asset-managements.types'
import { TAssetInventory } from '../list/libs/asset-inventory-list.types'
import { detailAsset } from '../services/asset-inventory.services'
import AssetInventoryDetailInformation, {
  DetailInformationType,
} from './components/AssetInventoryDetailInformation'
import AssetInventoryDetailContext from './libs/asset-inventory-detail.context'

const sections: DetailInformationType[] = [
  'detail-information',
  'entity',
  'ownership',
  'budget',
  'electricity',
  'warranty',
  'calibration',
  'maintenance',
]

const AssetInventoryDetailPage = () => {
  usePermission('asset-inventory-view')
  const {
    t,
    i18n: { language },
  } = useTranslation(['common', 'assetInventory'])

  const router = useSmileRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const isFromDetail = searchParams.get('fromPage') === 'detail'
  const detailPath = isFromDetail && params?.id ? params.id : ''
  const backUrl = () => {
    return router.pushGlobal(
      `/v5/global-asset/management/operational-asset-inventory/${detailPath}`
    )
  }
  const { id } = router.query

  const { data, isLoading, isFetching, error } = useQuery<
    TAssetInventory,
    AxiosError<ErrorResponse>
  >({
    queryKey: ['detail-asset-inventory', id],
    queryFn: () => detailAsset(Number(id)),
    enabled: !!id,
  })

  useSetLoadingPopupStore(isLoading || isFetching)

  const contextValue = useMemo(() => ({ data: data ?? null }), [data])
  const isWarehouse = useMemo(
    () => data?.asset_type?.is_warehouse === BOOLEAN.TRUE,
    [data]
  )

  const activeThreshold = useMemo(() => {
    return data?.asset_type?.temperature_thresholds?.find(
      (threshold) => threshold.is_active
    )
  }, [data])

  const isEnabledProgramIdView = useFeatureIsOn(
    'operational_asset_inventory.program_ids'
  )

  const permissions = {
    enable_program_ids: isEnabledProgramIdView,
  }

  const customColumns: Array<ColumnDef<TRelationData>> = useMemo(
    () => [
      ...(isWarehouse
        ? ([
            {
              accessorKey: 'description',
              header: t('assetInventory:device_relation.table.description'),
              size: 200,
              minSize: 200,
              cell: ({ row }) => row.original?.description,
            },
          ] as Array<ColumnDef<TRelationData>>)
        : ([
            {
              accessorKey: 'sensor',
              header: t('assetInventory:device_relation.table.sensor'),
              size: 100,
              minSize: 100,
              cell: ({ row }) =>
                numberFormatter(row.original?.sensor_qty, language),
            },
          ] as Array<ColumnDef<TRelationData>>)),
      {
        accessorKey: 'asset_type',
        header: t('assetInventory:device_relation.table.asset_type'),
        size: 250,
        minSize: 200,
        cell: ({ row }) => row.original?.asset_type?.name,
      },
    ],
    [data, isWarehouse, activeThreshold]
  )

  if (error?.response?.status === 403) return <Error403Page />
  if (error?.response?.status === 404) return <Error404Page />
  if (error?.response?.status === 422) return <Error404Page />

  return (
    <Container
      title={t('assetInventory:asset_inventory_detail')}
      withLayout
      backButton={{
        show: true,
        onClick: backUrl,
      }}
    >
      <Meta title={`SMILE | ${t('assetInventory:asset_inventory_detail')}`} />
      <AssetInventoryDetailContext.Provider value={contextValue}>
        <AssetInventoryDetailInformation
          isLoading={isLoading && isFetching}
          type="detail-information"
          permissions={permissions}
          sections={sections}
        />
        <AssetManagementsDeviceRelation
          detailId={Number(id)}
          type={RELATION_TYPE.RTMDS}
          detailData={data as TAssetInventory}
          isWarehouse={isWarehouse}
          customColumns={customColumns}
          withActionColumn
          withAddButton
        />
      </AssetInventoryDetailContext.Provider>
    </Container>
  )
}

export default AssetInventoryDetailPage
