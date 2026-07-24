import { useEffect, useMemo, useState } from 'react'
import { useFilter, UseFilter } from '#components/filter'
import Meta from '#components/layouts/Meta'
import { usePermission } from '#hooks/usePermission'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'
import { generateMetaTitle } from '#utils/strings'
import { useTranslation } from 'react-i18next'

import DashboardBox from '../components/DashboardBox'
import DashboardDataTable from '../components/DashboardDataTable'
import DashboardFilter from '../components/DashboardFilter'
import DashboardTabs from '../components/DashboardTabs'
import {
  AssetOwnershipInventoryChartType,
  STOCK_TAB_CONTENT,
} from './dashboard-asset-ownership-inventory.constant'
import useGetAssetSummary from './hooks/useGetAssetSummary'
import useGetAssetTable from './hooks/useGetAssetTable'
import dashboardAssetOwnershipInventoryFilterSchema from './schemas/dashboardAssetOwnershipInventoryFilterSchema'

export default function DashboardAssetOwnershipInventoryPage({
  predefinedAssetTypes,
  refetchAssetTypes,
  isLoadingAssetTypes,
}: Readonly<{
  predefinedAssetTypes?: {
    label: string
    value: number
  }[]
  refetchAssetTypes: () => void
  isLoadingAssetTypes: boolean
}>) {
  usePermission('dashboard-asset-ownership-inventory-view')

  const [tab, setTab] = useState<string>(AssetOwnershipInventoryChartType.All)
  const [isReset, setIsReset] = useState(false)

  const {
    t,
    i18n: { language },
  } = useTranslation(['dashboardAssetOwnershipInventory'])

  const filterSchema = useMemo<UseFilter>(
    () =>
      isLoadingAssetTypes
        ? []
        : dashboardAssetOwnershipInventoryFilterSchema(
            t,
            language,
            predefinedAssetTypes || []
          ),
    [t, language, predefinedAssetTypes, isLoadingAssetTypes]
  )

  const filter = useFilter(filterSchema)

  const {
    data: summaryData,
    isLoading: isLoadingSummary,
    tabs,
  } = useGetAssetSummary(filter?.query, isLoadingAssetTypes, language)

  const {
    data: tableData,
    columns,
    isLoading,
    page,
    paginate,
    exportQuery,
    handleChangePage,
    handleChangePaginate,
  } = useGetAssetTable(filter?.query, isLoadingAssetTypes)

  useEffect(() => {
    if (isReset) {
      filter?.setValue('type_ids', predefinedAssetTypes)
    }
  }, [predefinedAssetTypes, filter?.reset, isReset])

  useEffect(() => {
    setIsReset(false)
  }, [filter?.reset])

  useSetLoadingPopupStore(isLoadingAssetTypes || isLoadingSummary || isLoading)

  const tabList = useMemo(
    () => (Array.isArray(tabs) ? tabs.filter((it) => it.id && it.label) : []),
    [tabs, language]
  )

  return (
    <div>
      <Meta title={generateMetaTitle(t('title.page'))} />
      <DashboardBox.Provider filter={filter?.query} colorClass="ui-bg-gray-100">
        <DashboardFilter
          filter={filter}
          onResetFilter={() => {
            refetchAssetTypes()
            setIsReset(true)
            filter?.reset()
          }}
          onExport={() => {
            exportQuery.refetch()
          }}
        />

        <DashboardTabs<string>
          id="dashboard-asset-ownership-inventory-tab"
          tabList={tabList}
          isNewLayout
          setTab={setTab}
          title={
            <strong>
              {t(
                'dashboardAssetOwnershipInventory:title.asset_ownership_by_entity.total',
                {
                  type: t(
                    'dashboardAssetOwnershipInventory:title.entity.level'
                  ) as string,
                }
              )}
            </strong>
          }
          defaultActiveTab={tab}
          renderChild={(item) => {
            const Component =
              STOCK_TAB_CONTENT?.[item?.id as keyof typeof STOCK_TAB_CONTENT]
            return (
              <Component
                activeTab={tab as AssetOwnershipInventoryChartType}
                data={summaryData || {}}
                isLoading={isLoadingSummary || isLoadingAssetTypes}
              />
            )
          }}
        />

        <DashboardBox.Root id={'dashboard-asset-ownership-inventory-body'}>
          <DashboardBox.Header bordered>
            <h4>
              <strong>
                {t(
                  'dashboardAssetOwnershipInventory:title.asset_ownership_by_entity.detail',
                  {
                    type: t(
                      'dashboardAssetOwnershipInventory:title.entity.tag'
                    ) as string,
                  }
                )}
              </strong>
            </h4>
          </DashboardBox.Header>
          <div className="ui-relative ui-p-4 ui-bg-gray-50">
            {(() => {
              const cols = Array.isArray(columns) ? columns : []
              const sticky = cols.length >= 3 ? [0, 1, cols.length - 1] : []
              return (
                <DashboardDataTable
                  data={tableData?.data || []}
                  columns={cols}
                  page={page}
                  paginate={paginate}
                  onChangePage={handleChangePage}
                  onChangePaginate={handleChangePaginate}
                  totalItem={tableData?.total_item || 0}
                  totalPage={tableData?.total_page || 1}
                  isLoading={isLoading}
                  stickyColumns={sticky}
                />
              )
            })()}
          </div>
        </DashboardBox.Root>
      </DashboardBox.Provider>
    </div>
  )
}
