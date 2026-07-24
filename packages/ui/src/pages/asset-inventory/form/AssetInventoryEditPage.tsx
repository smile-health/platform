import React from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import Meta from '#components/layouts/Meta'
import Container from '#components/layouts/PageContainer'
import { usePermission } from '#hooks/usePermission'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'
import useSmileRouter from '#hooks/useSmileRouter'
import { useTranslation } from 'react-i18next'

import { detailAsset } from '../services/asset-inventory.services'
import AssetInventoryForm from './components/AssetInventoryForm'

const AssetInventoryEditPage = () => {
  usePermission('asset-inventory-mutate')
  const { t } = useTranslation(['common', 'assetInventory'])
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

  const {
    query: { id },
  } = router

  const {
    data: assetInventoryData,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ['asset-inventory', id],
    queryFn: () => detailAsset(Number(id)),
    enabled: !!id,
  })

  useSetLoadingPopupStore(isLoading || isFetching)

  if (!assetInventoryData) {
    return null
  }

  return (
    <Container
      title={t('assetInventory:asset_inventory')}
      withLayout
      backButton={{
        show: true,
        onClick: backUrl,
      }}
    >
      <Meta title={`SMILE | ${t('assetInventory:asset_inventory')}`} />
      <AssetInventoryForm data={assetInventoryData} />
    </Container>
  )
}

export default AssetInventoryEditPage
