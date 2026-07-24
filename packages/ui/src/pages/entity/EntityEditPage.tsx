import React from 'react'
import AppLayout from '#components/layouts/AppLayout/AppLayout'
import Meta from '#components/layouts/Meta'
import { CommonType } from '#types/common'
import { useTranslation } from 'react-i18next'

import EntityForm from './components/EntityForm'
import { usePermission } from '#hooks/usePermission'

const EntityEditPage: React.FC<CommonType> = ({ isGlobal }) => {
  usePermission(isGlobal ? 'entity-global-mutate' : 'entity-mutate')
  const { t } = useTranslation('entity')

  return (
    <AppLayout title={isGlobal ? t('form.title.edit') : t('list.list')}>
      <Meta title={`SMILE | ${isGlobal ? 'Global Entity' : 'Entity'}`} />
      <EntityForm isGlobal />
    </AppLayout>
  )
}

export default EntityEditPage
