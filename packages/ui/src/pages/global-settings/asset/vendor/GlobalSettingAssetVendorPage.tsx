'use client'

import useSmileRouter from '#hooks/useSmileRouter'
import AssetVendorListPage from '#pages/asset-vendor/AssetVendorListPage'
import { hasPermission } from '#shared/permission/index'
import { useTranslation } from 'react-i18next'

import GlobalSettings from '../../GlobalSettings'
import { assetChildTabs } from '../assets.constants'

const GlobalSettingAssetVendorPage = () => {
  const router = useSmileRouter()
  const {
    i18n: { t },
  } = useTranslation(['assetVendor'])
  const tabsItems = assetChildTabs(t, router.getAsLinkGlobal)?.filter(
    (v) => v?.isShow
  )

  return (
    <GlobalSettings
      title={t('assetVendor:list.title')}
      showButtonCreate={hasPermission('asset-vendor-global-mutate')}
      buttonCreate={{
        label: t('assetVendor:list.add'),
        onClick: () =>
          router.pushGlobal(`/v5/global-settings/asset/vendor/create`),
      }}
      childTabs={tabsItems}
    >
      <AssetVendorListPage isGlobal />
    </GlobalSettings>
  )
}

export default GlobalSettingAssetVendorPage
