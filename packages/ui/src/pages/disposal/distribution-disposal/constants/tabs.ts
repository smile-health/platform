import { hasPermission } from '#shared/permission/index'
import { TFunction } from 'i18next'

export const listTabs = (t: TFunction<['common', 'distributionDisposal']>) => [
  {
    id: 'tab-dd-list-all',
    label: t('distributionDisposal:tab.all'),
    tab: 'all',
    isHidden: !hasPermission('disposal-distribution-enable-select-entity'),
  },
  {
    id: 'tab-dd-list-vendor',
    label: t('distributionDisposal:tab.vendor'),
    tab: 'sender',
    isHidden: false,
  },
  {
    id: 'tab-dd-list-customer',
    label: t('distributionDisposal:tab.customer'),
    tab: 'receiver',
    isHidden: false,
  },
]
