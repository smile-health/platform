import React, { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import Meta from '#components/layouts/Meta'
import Container from '#components/layouts/PageContainer'
import { usePermission } from '#hooks/usePermission'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'
import useSmileRouter from '#hooks/useSmileRouter'
import { useTranslation } from 'react-i18next'

import AssetTitleBlock from '../list/components/AssetTitleBlock'
import { detailAsset, detailAssetChild } from '../services/asset.services'
import AssetDetailInformation from './components/AssetDetailInformation'
import AssetDetailLoggerActivity from './components/AssetDetailLoggerActivity'
import AssetDetailRelationToLoggerTable from './components/AssetDetailRelationToLoggerTable'
import AssetDetailTemperatureTable from './components/AssetDetailTemperatureTable'
import AssetDetailContext from './libs/asset-detail.context'

const AssetDetailPage = () => {
  usePermission('asset-temperature-view')
  const { t } = useTranslation(['common', 'asset'])

  const router = useSmileRouter()
  const { id } = router.query

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['detail-asset-temperature', id],
    queryFn: () => detailAsset(Number(id)),
    enabled: !!id,
  })

  const {
    data: childData,
    isLoading: isLoadingChild,
    isFetching: isFetchingChild,
  } = useQuery({
    queryKey: ['detail-asset-temperature-child', id],
    queryFn: () => detailAssetChild(Number(id)),
    enabled: !!id,
  })

  useSetLoadingPopupStore(
    isLoading || isFetching || isLoadingChild || isFetchingChild
  )
  const assetModelName = data?.asset_model
    ? ` - ${data?.asset_model?.name}`
    : ''
  const manufactureName = data?.manufacture
    ? ` - (${data?.manufacture?.name})`
    : ''

  const contextValue = useMemo(
    () => ({ data: data ?? null, childData: childData ?? null }),
    [data, childData]
  )

  return (
    <Container
      title={t('asset:asset_temperature_detail')}
      withLayout
      backButton={{
        label: t('common:back_to_list'),
        show: true,
        onClick: () => {
          router.push('/v5/asset')
        },
      }}
    >
      <Meta title={`SMILE | ${t('asset:asset_temperature_detail')}`} />
      <AssetDetailContext.Provider value={contextValue}>
        <div className="ui-mx-24">
          <div className="ui-my-6 ui-border ui-border-gray-300 ui-rounded ui-p-4">
            <AssetTitleBlock
              arrText={[
                {
                  label: `${data?.serial_number}${assetModelName}${manufactureName}`,
                  className: 'ui-text-sm ui-font-bold ui-text-dark-teal',
                },
                {
                  label: data?.entity?.name as string,
                  className:
                    'ui-text-sm ui-font-normal ui-text-gray-400 ui-my-1',
                },
              ]}
            />
            <div className="ui-h-1 ui-border-b ui-border-gray-300 ui-my-4" />
            <AssetDetailInformation />
            <div className="ui-h-1 ui-border-b ui-border-gray-300 ui-my-4" />
            <AssetDetailTemperatureTable />
          </div>
          <div className="ui-my-6 ui-border ui-border-gray-300 ui-rounded ui-p-4">
            <AssetDetailLoggerActivity />
          </div>
          <div className="ui-my-6 ui-border ui-border-gray-300 ui-rounded ui-p-4">
            <AssetDetailRelationToLoggerTable />
          </div>
        </div>
      </AssetDetailContext.Provider>
    </Container>
  )
}

export default AssetDetailPage
