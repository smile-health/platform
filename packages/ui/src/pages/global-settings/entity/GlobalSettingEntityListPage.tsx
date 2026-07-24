'use client'

import { useRouter } from 'next/navigation'
import EntityListPage from '#pages/entity/EntityListPage'
import { hasPermission } from '#shared/permission/index'
import { useTranslation } from 'react-i18next'

import GlobalSettings from '../GlobalSettings'

const GlobalSettingEntityListPage = () => {
  const router = useRouter()
  const { t } = useTranslation('entity')
  const {
    i18n: { language },
  } = useTranslation()

  return (
    <GlobalSettings
      title={t('global.title')}
      showButtonCreate={hasPermission('entity-global-mutate')}
      buttonCreate={{
        label: t('list.tab.create'),
        onClick: () =>
          router.push(`/${language}/v5/global-settings/entity/create`),
      }}
    >
      <EntityListPage isGlobal />
    </GlobalSettings>
  )
}

export default GlobalSettingEntityListPage
