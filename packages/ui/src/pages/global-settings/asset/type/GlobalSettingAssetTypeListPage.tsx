'use client'

import useSmileRouter from '#hooks/useSmileRouter'
import AssetTypeListPage from '#pages/asset-type/AssetTypeListPage'
import { hasPermission } from '#shared/permission/index'
import { useTranslation } from 'react-i18next'

import GlobalSettings from '../../GlobalSettings'
import { assetChildTabs } from '../assets.constants'

const GlobalSettingAssetTypeListPage = () => {
  const router = useSmileRouter()
  const {
    i18n: { t },
  } = useTranslation(['assetType'])
  const tabsItems = assetChildTabs(t, router.getAsLinkGlobal)?.filter(
    (v) => v?.isShow
  )

  return (
    <GlobalSettings
      title={t('assetType:list.list')}
      showButtonCreate={hasPermission('asset-type-global-mutate')}
      buttonCreate={{
        label: t('assetType:list.add'),
        onClick: () =>
          router.pushGlobal(`/v5/global-settings/asset/type/create`),
      }}
      childTabs={tabsItems}
    >
      <AssetTypeListPage isGlobal />
    </GlobalSettings>
  )
}

export default GlobalSettingAssetTypeListPage
