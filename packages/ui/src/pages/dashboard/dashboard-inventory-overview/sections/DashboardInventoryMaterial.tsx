import { BarChart } from '#components/chart'
import { H5 } from '#components/heading'
import DashboardBox from '#pages/dashboard/components/DashboardBox'
import { wrapText } from '#utils/strings'
import { useTranslation } from 'react-i18next'

import DashboardInventoryCustomLegend from '../components/DashboardInventoryCustomLegend'
import {
  DashboardInventoryMapsColorClass,
  LEGEND_LABELS,
} from '../dashboard-inventory-overview.constant'
import { getBarChartColor } from '../dashboard-inventory-overview.helper'
import { useDashboardInventoryStore } from '../dashboard-inventory-overview.store'
import { TBarChart, TMaterial } from '../dashboard-inventory-overview.type'

type Props = {
  data: TMaterial[]
  isLoading?: boolean
}

export default function DashboardInventoryMaterial({ data, isLoading }: Props) {
  const { t } = useTranslation('dashboardInventoryOverview')
  const { map, setView, setMaterialId } = useDashboardInventoryStore()

  const materials = data?.map((item) => ({
    y: item?.name,
    x: item?.value,
    extra: {
      id: item?.id?.toString(),
      tooltip: item?.tooltip,
    },
  }))

  const color = data?.map((item) => getBarChartColor(item?.value, map?.color))

  const handleClick = (item: TBarChart<{ id: string }>) => {
    setView('entities')
    setMaterialId(item?.extra?.id)
  }

  const legendByColor = DashboardInventoryMapsColorClass?.[map?.color]

  return (
    <DashboardBox.Root
      id="material-activity-chart"
      className="ui-flex ui-flex-col ui-h-full"
    >
      <DashboardBox.Header bordered>
        <H5>{t('title.material')}</H5>
      </DashboardBox.Header>
      <DashboardBox.Body className="ui-flex-1 ui-flex ui-flex-col">
        <DashboardBox.Config
          download={{
            targetElementId: 'material-activity-chart',
            fileName: 'Dashboard Inventory - Material Activity',
          }}
        />
        <DashboardBox.Content
          className="ui-flex-1 ui-max-h-[500px]"
          isEmpty={!data?.length}
          isLoading={isLoading}
        >
          <div className="ui-flex ui-items-center ui-justify-center ui-gap-4 ui-mb-4">
            {LEGEND_LABELS?.map((legend, index) => (
              <DashboardInventoryCustomLegend
                key={legend}
                colorClass={legendByColor?.[index]}
                label={legend}
              />
            ))}
          </div>
          <BarChart
            layout="horizontal"
            rowHeight={40}
            data={materials ?? []}
            anchor="center"
            color={color}
            maxYLabelLength={20}
            onClick={handleClick}
            isDataFormatted={false}
            formatValue={(context) => `${context?.x}%`}
            tooltipFormatter={{
              label: (context) => {
                const item = context?.raw as TBarChart
                const tooltip = item?.extra?.tooltip?.replace(`${item.y}:`, '')

                return wrapText(tooltip, 80)
              },
            }}
          />
        </DashboardBox.Content>
      </DashboardBox.Body>
    </DashboardBox.Root>
  )
}
