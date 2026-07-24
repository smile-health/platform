/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo } from 'react'
import { TreeMapChart, TreeMapDataItem } from '#components/chart'
import { numberFormatter } from '#utils/formatter'
import { useTranslation } from 'react-i18next'

import DashboardColdStorageCapacityBox from '../../components/DashboardColdStorageCapacityBox'
import { useExportCceAggregateCapacityRemainingQuery } from '../../dashboard-cold-storage-capacity.queries'
import { useDashboardColdStorageCapacity } from '../../DashboardColdStorageCapacityContext'
import { DashboardColdStorageCapacityFilterParams } from '../filter/useDashboardColdStorageCapacityFilterSchema.types'

const DOWNLOAD_EXTENSIONS = ['png', 'jpg', 'pdf', 'csv']

const GREEN_DARK = { r: 20, g: 83, b: 45 } // #14532D
const GREEN_LIGHT = { r: 187, g: 247, b: 208 } // #BBF7D0

function interpolateGreen(ratio: number): string {
  const r = Math.round(GREEN_DARK.r + (GREEN_LIGHT.r - GREEN_DARK.r) * ratio)
  const g = Math.round(GREEN_DARK.g + (GREEN_LIGHT.g - GREEN_DARK.g) * ratio)
  const b = Math.round(GREEN_DARK.b + (GREEN_LIGHT.b - GREEN_DARK.b) * ratio)
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

function lightenColor(hex: string, amount: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `#${Math.round(r + (255 - r) * amount)
    .toString(16)
    .padStart(2, '0')}${Math.round(g + (255 - g) * amount)
    .toString(16)
    .padStart(2, '0')}${Math.round(b + (255 - b) * amount)
    .toString(16)
    .padStart(2, '0')}`
}

export default function StoredMaterials() {
  const {
    t,
    i18n: { language },
  } = useTranslation('dashboardColdStorageCapacity')

  const { detail, filter } = useDashboardColdStorageCapacity()
  const filterValues = useMemo(
    () => filter.getValues() as DashboardColdStorageCapacityFilterParams,
    [filter]
  )
  const { refetch: exportCSV } = useExportCceAggregateCapacityRemainingQuery(
    filterValues,
    detail.isPqs
  )

  const data =
    detail?.data?.aggregate_capacity_remaining?.materials?.map((item) => ({
      name: item.material_name,
      value: item.volume_material,
      percentage: item.volume_material_percentage,
    })) || []

  const handleDownloadCSV = () => {
    exportCSV()
  }

  const totalValue = data.reduce((sum, item) => sum + (item.value ?? 0), 0)

  const values = data.map((d) => d.value ?? 0)
  const minValue = Math.min(...(values.length ? values : [0]))
  const maxValue = Math.max(...(values.length ? values : [0]))
  const valueRange = maxValue - minValue

  const zeroValueData = data.filter((item) => !Boolean(item.value))
  const treeMapData: TreeMapDataItem[] = data
    .filter((item) => Number(item?.value) > 0)
    .map((item) => {
      const value = item.value ?? 0
      const ratio = valueRange > 0 ? 1 - (value - minValue) / valueRange : 0.5
      const color = interpolateGreen(ratio)

      return {
        name: item.name,
        value,
        labelText: `${item.name}\n${item.percentage}% (${numberFormatter(value, language)} L)`,
        itemStyle: { color },
        percentage: item.percentage,
      } as any
    })

  const lightestRatio = valueRange > 0 ? 1 : 0.5
  const zeroValueBgColor = lightenColor(interpolateGreen(lightestRatio), 0.5)

  const tooltipFormatter = (params: any) => {
    const item = params.data
    if (!item?.name) return ''
    const percentage =
      item.percentage ?? Math.round((item.value / totalValue) * 100)
    return `<strong>${item.name}</strong><br/>${percentage}% (${numberFormatter(item.value, language)} L)`
  }

  return (
    <DashboardColdStorageCapacityBox
      id="stored-materials"
      title={t('section.stored_materials.title')}
      info={<p>{t('section.stored_materials.info')}</p>}
      lastUpdated={detail?.data?.aggregate_capacity_remaining?.last_updated}
      downloadExtensions={DOWNLOAD_EXTENSIONS}
      onDownloadCSV={handleDownloadCSV}
      isLoading={detail?.isLoading}
      isEmpty={data.length === 0}
    >
      <div className="ui-grid ui-grid-cols-[1fr_250px] w-full">
        <div className="ui-w-full ui-bg-primary-50 flex items-center justify-center p-2 text-center text-sm">
          {t('section.stored_materials.has_volume')}
        </div>
        {zeroValueData.length > 0 && (
          <div className="ui-bg-primary-50 flex items-center justify-center border border-white p-2 text-center text-sm">
            {t('section.stored_materials.no_volume')}
          </div>
        )}
        <div className="ui-w-full ui-h-[400px] flex-1">
          <TreeMapChart
            data={treeMapData}
            tooltipFormatter={tooltipFormatter}
          />
        </div>
        {zeroValueData.length > 0 && (
          <div
            className="ui-max-h-[400px] h-full overflow-y-auto border border-white p-4 text-sm"
            style={{ backgroundColor: zeroValueBgColor }}
          >
            <ul className="list-inside list-disc space-y-1">
              {zeroValueData.map((item) => (
                <li key={item.name}>{item.name}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </DashboardColdStorageCapacityBox>
  )
}
