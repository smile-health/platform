import { hasPermission } from '#shared/permission/index'
import { TFunction } from 'i18next'

export const assetChildTabs = (
  t: TFunction<['common']>,
  getLink: (url: string) => string
) => [
  {
    id: 'tab-asset-type',
    label: t('tab.assets.tabs.asset_type'),
    href: getLink('/v5/global-settings/asset/type'),
    isShow: hasPermission('asset-type-global-view'),
  },
  {
    id: 'tab-asset-model',
    label: t('tab.assets.tabs.asset_model'),
    href: getLink('/v5/global-settings/asset/model'),
    isShow: hasPermission('model-asset-management-global-view'),
  },
  {
    id: 'tab-asset-vendor',
    label: t('tab.assets.tabs.asset_vendor'),
    href: getLink(`/v5/global-settings/asset/vendor`),
    isShow: hasPermission('asset-vendor-global-view'),
  },
  {
    id: 'tab-pqs-code',
    label: t('tab.assets.tabs.pqs_code'),
    href: getLink(`/v5/global-settings/asset/pqs`),
    isShow: hasPermission('pqs-global-view'),
  },
]
