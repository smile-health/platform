import React from 'react'
import Meta from '#components/layouts/Meta'
import Container from '#components/layouts/PageContainer'
import { usePermission } from '#hooks/usePermission'
import useSmileRouter from '#hooks/useSmileRouter'
import { CommonType } from '#types/common'
import { useTranslation } from 'react-i18next'

import AssetVendorForm from './components/AssetVendorForm'

const AssetVendorCreatePage: React.FC<CommonType> = ({ isGlobal }) => {
  usePermission('asset-vendor-global-mutate')
  const { t } = useTranslation(['assetVendor', 'common'])
  const { pushGlobal } = useSmileRouter()

  return (
    <Container
      withLayout
      title={
        isGlobal ? t('assetVendor:form.title.add') : t('assetVendor:list.list')
      }
      hideTabs={isGlobal}
      backButton={{
        show: true,
        onClick: () => pushGlobal('v5/global-settings/asset/vendor'),
      }}
    >
      <Meta
        title={`Smile | ${isGlobal ? 'Global' : ''} ${t('assetVendor:form.title.add')}`}
      />
      <AssetVendorForm isGlobal={isGlobal} />
    </Container>
  )
}

export default AssetVendorCreatePage
