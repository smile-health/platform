import React from 'react'
import Meta from '#components/layouts/Meta'
import Container from '#components/layouts/PageContainer'
import { usePermission } from '#hooks/usePermission'
import useSmileRouter from '#hooks/useSmileRouter'
import { CommonType } from '#types/common'
import { useTranslation } from 'react-i18next'

import ModelAssetForm from './components/ModelAssetForm'

const ModelAssetCreatePage: React.FC<CommonType> = ({ isGlobal }) => {
  usePermission('budget-source-global-mutate')
  const { t } = useTranslation(['modelAsset', 'common'])
  const { pushGlobal } = useSmileRouter()

  return (
    <Container
      withLayout
      title={
        isGlobal ? t('modelAsset:form.title.add') : t('modelAsset:list.list')
      }
      hideTabs={isGlobal}
      backButton={{
        show: true,
        onClick: () => pushGlobal('v5/global-settings/asset/model'),
      }}
    >
      <Meta
        title={`Smile | ${isGlobal ? 'Global' : ''} ${t('modelAsset:form.title.add')}`}
      />
      <ModelAssetForm />
    </Container>
  )
}

export default ModelAssetCreatePage
