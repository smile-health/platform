import React from 'react'
import Meta from '#components/layouts/Meta'
import Container from '#components/layouts/PageContainer'
import { usePermission } from '#hooks/usePermission'
import { CommonType } from '#types/common'
import { useTranslation } from 'react-i18next'

import MaterialVolumeForm from './components/MaterialVolumeForm'

const MaterialVolumeCreatePage: React.FC<CommonType> = ({
  isGlobal = true,
}) => {
  usePermission('material-volume-management-global-mutate')
  const { t } = useTranslation(['materialVolume', 'common'])

  return (
    <Container
      withLayout
      title={t('materialVolume:title.add')}
      hideTabs={isGlobal}
      backButton={{
        show: true,
      }}
    >
      <Meta title={`Smile | Global ${t('materialVolume:title.add')}`} />
      <MaterialVolumeForm isGlobal={isGlobal} />
    </Container>
  )
}

export default MaterialVolumeCreatePage
