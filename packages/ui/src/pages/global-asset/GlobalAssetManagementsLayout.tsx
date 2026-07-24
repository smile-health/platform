import { ReactNode } from 'react'
import { useFeatureIsOn } from '@growthbook/growthbook-react'
import { FeatureName } from '#shared/permission/features/index'
import { hasPermission } from '#shared/permission/index'
import { TFunction } from 'i18next'
import { useTranslation } from 'react-i18next'

import GlobalSettings from '../../components/global-settings/GlobalSettings'

type TTabsItem = {
  id: string
  label: string
  href: string
  isShow: boolean
}

type TProps = {
  children: ReactNode
  title: string
  subTitle?: string
  showButtonCreate?: boolean
  buttonCreate?: {
    label: string
    onClick: () => void
  }
  childTabs?: TTabsItem[]
  grandChildTabs?: TTabsItem[]
  isSanitary?: boolean
}

const GlobalAssetManagementsLayout: React.FC<TProps> = ({
  children,
  title,
  subTitle,
  showButtonCreate = true,
  buttonCreate,
  childTabs,
  grandChildTabs,
  isSanitary,
}) => {
  const { t } = useTranslation('common')

  const isEnabledDashboardAssetManagement = useFeatureIsOn(
    'dashboard.asset_managements.view'
  )
  const isEnabledMonitoringDeviceInventory = useFeatureIsOn(
    'monitoring_device_inventory'
  )

  const tabs = (t: TFunction, lang: string) => [
    ...(isEnabledDashboardAssetManagement &&
    hasPermission('global-asset-dashboard-view' as FeatureName)
      ? [
          {
            label: t('tab.global_asset_managements.dashboards.label'),
            url: `/${lang}/v5/global-asset/dashboard/asset-ownership-inventory`,
            hasChildTab: true,
            childTab: ['asset-ownership-inventory', 'warehose'],
            featureName: 'global-asset-dashboard-view' as FeatureName,
            grandChildTab: ['cold_chain_equipment', 'cold-satorage-capacity'],
          },
        ]
      : []),
    {
      label: t('tab.global_asset_managements.managements.label'),
      url: `/${lang}/v5/global-asset/management/operational-asset-inventory`,
      hasChildTab: true,
      childTab: [
        'storage-temperature-monitoring',
        'operational-asset-inventory',
        ...(isEnabledMonitoringDeviceInventory
          ? ['monitoring-device-inventory']
          : []),
      ],
      featureName: 'global-asset-management-menu' as FeatureName,
    },
  ]

  return (
    <GlobalSettings
      header={t('dropdown_setting.global_asset_managements')}
      title={title}
      subTitle={subTitle}
      showButtonCreate={showButtonCreate}
      buttonCreate={buttonCreate}
      tabs={isSanitary ? (t: TFunction, lang: string) => [] : tabs}
      tabVariant="pills"
      tabPosition="center"
      childTabPosition="start"
      childTabVariant="default"
      childTabs={childTabs}
      grandChildTabs={grandChildTabs}
    >
      {children}
    </GlobalSettings>
  )
}

export default GlobalAssetManagementsLayout
