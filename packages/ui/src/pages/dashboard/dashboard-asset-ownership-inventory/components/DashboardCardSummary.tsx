import { useMemo } from 'react'
import DashboardBox from '#pages/dashboard/components/DashboardBox'
import { numberFormatter } from '#utils/formatter'
import { useTranslation } from 'react-i18next'

import {
  AssetOwnershipInventoryChartType,
  AssetOwnershipInventorySummaryType,
} from '../dashboard-asset-ownership-inventory.constant'
import {
  DashboardSummaryDetail,
  DashboardSummaryEntry,
} from '../hooks/useGetAssetSummary'

type Props = Readonly<{
  activeTab?: AssetOwnershipInventoryChartType
  data?: DashboardSummaryEntry[]
  isLoading?: boolean
}>

export default function DashboardCardSummary({
  activeTab,
  data,
  isLoading,
}: Props) {
  const {
    t,
    i18n: { language },
  } = useTranslation(['dashboardAssetOwnershipInventory'])

  const { totalAsset, cards } = useMemo(() => {
    const base = Array.isArray(data) ? data : []
    const isAll =
      (activeTab ?? AssetOwnershipInventoryChartType.All) ===
      AssetOwnershipInventoryChartType.All
    const current = isAll
      ? (base.find(
          (entry: any) =>
            String(entry?.id) === AssetOwnershipInventoryChartType.All
        ) ?? base[0])
      : base.find((entry: any) => String(entry?.id) === String(activeTab))

    const totalAsset = current?.total ?? 0

    const details: DashboardSummaryDetail[] =
      current && Array.isArray(current?.details) ? current.details : []

    const cards = details.filter(
      (c) => c.title !== AssetOwnershipInventorySummaryType.TotalAsset
    )

    return { totalAsset, cards }
  }, [data, activeTab])

  return (
    <DashboardBox.Content
      isLoading={isLoading}
      isEmpty={!cards?.length}
      className="ui-max-h-[524px] ui-overflow-y-auto !ui-px-0"
    >
      <div
        className="ui-pt-1"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(6, minmax(0, 1fr))',
          gap: '1rem',
        }}
      >
        <div className="ui-bg-slate-100 ui-rounded ui-p-4">
          <p className="ui-font-medium ui-text-neutral-700 ui-text-base">
            {t('title.total_asset')}
          </p>
          <p className="ui-text-[18px] ui-font-bold ui-text-neutral-900">
            {numberFormatter(totalAsset ?? 0, language)}
          </p>
        </div>
        {cards?.map((c: any) => (
          <div
            key={c.title}
            className="ui-rounded ui-p-4 ui-h-[131px]"
            style={{ backgroundColor: c.color }}
          >
            <p className="ui-font-medium ui-text-neutral-700 ui-text-base ui-line-clamp-3">
              {c.title}
            </p>
            <p className="ui-text-[18px] ui-font-bold ui-text-neutral-900">
              {numberFormatter(c.total ?? 0, language)}
            </p>
          </div>
        ))}
      </div>
    </DashboardBox.Content>
  )
}
