import React from 'react'
import Meta from '#components/layouts/Meta'
import Container from '#components/layouts/PageContainer'
import { CommonType } from '#types/common'
import { useTranslation } from 'react-i18next'

import EntityForm from './components/EntityForm'
import { usePermission } from '#hooks/usePermission'

const EntityCreatePage: React.FC<CommonType> = ({ isGlobal }) => {
  usePermission(isGlobal ? 'entity-global-mutate' : 'entity-mutate')
  const { t } = useTranslation(['entity', 'common'])

  return (
    <Container
      withLayout
      title={isGlobal ? t('entity:form.title.add') : t('entity:list.list')}
      hideTabs={isGlobal}
    >
      <Meta title={`SMILE | ${isGlobal ? 'Global Entity' : 'Entity'}`} />
      <EntityForm isGlobal={isGlobal} />
    </Container>
  )
}

export default EntityCreatePage
