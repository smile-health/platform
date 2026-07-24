import React from 'react'
import Meta from '#components/layouts/Meta'
import Container from '#components/layouts/PageContainer'
import { usePermission } from '#hooks/usePermission'
import useSmileRouter from '#hooks/useSmileRouter'
import { CommonType } from '#types/common'
import { useTranslation } from 'react-i18next'

import AssetTypeForm from './components/AssetTypeForm'

const BudgetSourceCreatePage: React.FC<CommonType> = ({ isGlobal }) => {
  usePermission('asset-type-global-mutate')
  const { t } = useTranslation(['assetType', 'common'])
  const { pushGlobal } = useSmileRouter()

  return (
    <Container
      withLayout
      title={
        isGlobal ? t('assetType:form.title.add') : t('assetType:list.list')
      }
      hideTabs={isGlobal}
      backButton={{
        show: true,
        onClick: () => pushGlobal('v5/global-settings/asset/type'),
      }}
    >
      <Meta
        title={`Smile | ${isGlobal ? 'Global' : ''} ${t('assetType:form.title.add')}`}
      />
      <AssetTypeForm />
    </Container>
  )
}

export default BudgetSourceCreatePage
