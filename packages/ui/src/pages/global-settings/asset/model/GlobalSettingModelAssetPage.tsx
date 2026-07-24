'use client'

import useSmileRouter from '#hooks/useSmileRouter'
import ModelAssetListPage from '#pages/model-asset-management/ModelAssetListPage'
import { hasPermission } from '#shared/permission/index'
import { useTranslation } from 'react-i18next'

import GlobalSettings from '../../GlobalSettings'
import { assetChildTabs } from '../assets.constants'

const GlobalSettingModelAssetManagement = () => {
  const router = useSmileRouter()
  const {
    i18n: { t },
  } = useTranslation(['modelAsset'])
  const tabsItems = assetChildTabs(t, router.getAsLinkGlobal)?.filter(
    (v) => v?.isShow
  )

  return (
    <GlobalSettings
      title={t('modelAsset:list.title')}
      showButtonCreate={hasPermission('model-asset-management-global-mutate')}
      buttonCreate={{
        label: t('modelAsset:list.add'),
        onClick: () =>
          router.pushGlobal(`/v5/global-settings/asset/model/create`),
      }}
      childTabs={tabsItems}
    >
      <ModelAssetListPage isGlobal />
    </GlobalSettings>
  )
}

export default GlobalSettingModelAssetManagement
