'use client'

import { useRouter } from 'next/navigation'
import ManufacturerListPage from '#pages/manufacturer/ManufacturerListPage'
import { hasPermission } from '#shared/permission/index'
import { useTranslation } from 'react-i18next'

import GlobalSettings from '../GlobalSettings'

const GlobalSettingManufacturerListPage = () => {
  const router = useRouter()
  const {
    t,
    i18n: { language },
  } = useTranslation('manufacturer')

  return (
    <GlobalSettings
      title={t('title.manufacturer')}
      showButtonCreate={hasPermission('manufacturer-global-mutate')}
      buttonCreate={{
        label: t('title.create'),
        onClick: () =>
          router.push(`/${language}/v5/global-settings/manufacturer/create`),
      }}
    >
      <ManufacturerListPage isGlobal />
    </GlobalSettings>
  )
}

export default GlobalSettingManufacturerListPage
