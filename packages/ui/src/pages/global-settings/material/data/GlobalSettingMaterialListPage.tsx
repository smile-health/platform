'use client'

import useSmileRouter from '#hooks/useSmileRouter'
import MaterialListPage from '#pages/material/MaterialListPage'
import { hasPermission } from '#shared/permission/index'
import { useTranslation } from 'react-i18next'

import GlobalSettings from '../../GlobalSettings'
import { materialChildTabs } from '../material.constants'

const GlobalSettingMaterialPage = () => {
  const router = useSmileRouter()
  const { t } = useTranslation(['material', 'common'])
  const tabsItems = materialChildTabs(t, router.getAsLinkGlobal)

  return (
    <GlobalSettings
      title={t('list.title')}
      showButtonCreate={hasPermission('material-global-mutate')}
      buttonCreate={{
        label: t('list.button.add'),
        onClick: () =>
          router.pushGlobal(`/v5/global-settings/material/data/create`),
      }}
      childTabs={tabsItems}
    >
      <MaterialListPage isGlobal={true} />
    </GlobalSettings>
  )
}

export default GlobalSettingMaterialPage
