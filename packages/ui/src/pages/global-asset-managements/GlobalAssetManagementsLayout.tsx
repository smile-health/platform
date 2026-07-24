import { ReactNode, useMemo } from 'react'
import { hasPermission } from '#shared/permission/index'
import { useTranslation } from 'react-i18next'

import GlobalSettings from '../../components/global-settings/GlobalSettings'

type TProps = {
  children: ReactNode
  title: string
  showButtonCreate?: boolean
  buttonCreate?: {
    label: string
    onClick: () => void
  }
}

const GlobalAssetManagementsLayout: React.FC<TProps> = ({
  children,
  title,
  showButtonCreate = true,
  buttonCreate,
}) => {
  const {
    t,
    i18n: { language },
  } = useTranslation('common')

  const tabs = useMemo(
    () => [
      {
        label: t('tab.global_asset_managements.asset_inventory'),
        url: `/${language}/v5/global-asset-managements/operational-asset-inventory`,
        hidden: false,
      },
      {
        label: t(
          'tab.global_asset_managements.remote_temperature_monitoring_device'
        ),
        url: `/${language}/v5/global-asset-managements/monitoring-device-inventory`,
        hidden: !hasPermission('monitoring-device-inventory-global-view'),
      },
      {
        label: t('tab.global_asset_managements.storage_temperature_monitoring'),
        url: `/${language}/v5/global-asset-managements/storage-temperature-monitoring`,
        hidden: !hasPermission('storage-temperature-monitoring-global-view'),
      },
    ],
    [t, language]
  )

  return (
    <GlobalSettings
      header={t('dropdown_setting.global_asset_managements')}
      title={title}
      showButtonCreate={showButtonCreate}
      buttonCreate={buttonCreate}
      tabs={() => tabs}
    >
      {children}
    </GlobalSettings>
  )
}

export default GlobalAssetManagementsLayout
