import { useMemo } from 'react'
import { BarChart } from '#components/chart'
import DashboardBox from '#pages/dashboard/components/DashboardBox'
import { useTranslation } from 'react-i18next'

import { DataValue } from '../../dashboard.type'

type Props = Readonly<{
  data?: DataValue
  color?: string
  isLoading?: boolean
  materialLevelLabel?: string
}>

export default function DashboardStockMaterialChart({
  data,
  color,
  isLoading,
  materialLevelLabel,
}: Props) {
  const { t } = useTranslation('dashboardStock')

  const materials = useMemo(() => {
    if (data?.length) {
      return data.sort((a, b) => b?.value - a?.value)
    }

    return []
  }, [data])

  return (
    <DashboardBox.Root id="dashboard-stock-material">
      <DashboardBox.Header>
        <h4>
          <strong>{t('title.stock.by', { title: 'Material' })}</strong>
        </h4>
        {materialLevelLabel && (
          <p className="ui-text-base">
            Level KFA Material: {materialLevelLabel}
          </p>
        )}
      </DashboardBox.Header>
      <DashboardBox.Body>
        <DashboardBox.Config
          download={{
            targetElementId: 'dashboard-stock-material',
            fileName: 'Dashboard Stock - By Material',
            isRemoveContainerHeight: true,
            isCompactPdf: true,
          }}
        />
        <DashboardBox.Content
          isLoading={isLoading}
          isEmpty={!data?.length}
          className="ui-max-h-[500px] ui-overflow-y-auto"
        >
          <BarChart
            data={materials}
            layout="horizontal"
            color={color}
            labelColor="#404040"
          />
        </DashboardBox.Content>
      </DashboardBox.Body>
    </DashboardBox.Root>
  )
}
