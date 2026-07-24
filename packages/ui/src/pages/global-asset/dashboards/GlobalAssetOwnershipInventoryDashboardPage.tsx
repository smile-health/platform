'use client'

import useSmileRouter from '#hooks/useSmileRouter'
import DashboardAssetOwnershipInventoryPage from '#pages/dashboard/dashboard-asset-ownership-inventory/DashboardAssetOwnershipInventoryPage'
import { hasPermission } from '#shared/permission/index'
import { useTranslation } from 'react-i18next'

import { useGetPredefinedAssetTypes } from '../../dashboard/dashboard-asset-ownership-inventory/hooks/useGetPredefinedAssetTypes'
import GlobalAssetManagementsLayout from '../GlobalAssetManagementsLayout'
import { globalAssetDashboardChildTabs } from './dashboards.constants'

const GlobalAssetOwnershipInventoryDashboardPage = () => {
  hasPermission('dashboard-asset-ownership-inventory-view')

  const {
    i18n: { t },
  } = useTranslation(['common', 'dashboardAssetOwnershipInventory'])
  const router = useSmileRouter()

  const childTabs = globalAssetDashboardChildTabs(
    t,
    router.getAsLinkGlobal
  )?.filter((v) => v?.isShow)

  const { predefinedAssetTypes, refetchAssetTypes, isLoadingAssetTypes } =
    useGetPredefinedAssetTypes()

  if (isLoadingAssetTypes) {
    return null
  }

  return (
    <GlobalAssetManagementsLayout
      title={t('dashboardAssetOwnershipInventory:title.page')}
      subTitle={t('dashboardAssetOwnershipInventory:title.sub_title')}
      showButtonCreate={false}
      childTabs={childTabs}
    >
      <DashboardAssetOwnershipInventoryPage
        predefinedAssetTypes={predefinedAssetTypes}
        refetchAssetTypes={refetchAssetTypes}
        isLoadingAssetTypes={isLoadingAssetTypes}
      />
    </GlobalAssetManagementsLayout>
  )
}

export default GlobalAssetOwnershipInventoryDashboardPage
