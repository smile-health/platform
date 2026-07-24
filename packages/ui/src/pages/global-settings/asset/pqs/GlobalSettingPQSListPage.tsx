'use client'

import useSmileRouter from '#hooks/useSmileRouter'
import PQSListPage from '#pages/pqs/PQSListPage'
import { hasPermission } from '#shared/permission/index'
import { useTranslation } from 'react-i18next'

import GlobalSettings from '../../GlobalSettings'
import { assetChildTabs } from '../assets.constants'

const GlobalSettingPQSListPage = () => {
  const router = useSmileRouter()
  const {
    i18n: { t },
  } = useTranslation(['pqs'])
  const tabsItems = assetChildTabs(t, router.getAsLinkGlobal)?.filter(
    (v) => v?.isShow
  )

  return (
    <GlobalSettings
      title={t('pqs:title.list')}
      showButtonCreate={hasPermission('pqs-global-mutate')}
      buttonCreate={{
        label: t('pqs:title.add'),
        onClick: () =>
          router.pushGlobal(`/v5/global-settings/asset/pqs/create`),
      }}
      childTabs={tabsItems}
    >
      <PQSListPage isGlobal />
    </GlobalSettings>
  )
}

export default GlobalSettingPQSListPage
