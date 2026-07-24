import React from 'react'
import Meta from '#components/layouts/Meta'
import Container from '#components/layouts/PageContainer'
import { usePermission } from '#hooks/usePermission'
import useSmileRouter from '#hooks/useSmileRouter'
import { CommonType } from '#types/common'
import { useTranslation } from 'react-i18next'

import PQSForm from './components/PQSForm'

const PQSCreatePage: React.FC<CommonType> = ({ isGlobal = true }) => {
  usePermission('pqs-global-mutate')
  const { t } = useTranslation(['pqs', 'common'])
  const { pushGlobal } = useSmileRouter()

  return (
    <Container
      withLayout
      title={t('pqs:title.add')}
      hideTabs={isGlobal}
      backButton={{
        show: true,
        onClick: () => pushGlobal('v5/global-settings/asset/pqs'),
      }}
    >
      <Meta title={`Smile | Global ${t('pqs:title.add')}`} />
      <PQSForm isGlobal={isGlobal} />
    </Container>
  )
}

export default PQSCreatePage
