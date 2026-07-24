import { InformationCircleIcon } from '@heroicons/react/24/solid'
import { PieChart } from '#components/chart'
import { H5 } from '#components/heading'
import DashboardBox from '#pages/dashboard/components/DashboardBox'
import { parseDateTime } from '#utils/date'
import { t } from 'i18next'
import { useTranslation } from 'react-i18next'

import { DASHBOARD_INVENTORY_COLOR_MAP } from '../dashboard-inventory-overview.constant'
import { getLabelOptions } from '../dashboard-inventory-overview.helper'
import { TChartOverview, TPieChart } from '../dashboard-inventory-overview.type'
import DashoardInventoryOverviewInformation from './DashoardInventoryOverviewInformation'

type Props = Readonly<{
  id: string
  data?: TChartOverview[]
  title: string
  color: string[]
  lastUpdated?: string
  isLoading?: boolean
  onClick: (item: TPieChart) => void
  information?: {
    description: string
    details: string[]
  }
}>

export default function DashboardInventoryChart({
  id,
  data,
  title,
  color,
  isLoading,
  lastUpdated,
  onClick,
  information,
}: Props) {
  const { t } = useTranslation('dashboardInventoryOverview')

  const chart = data?.map((item) => ({
    name: item.label,
    value: item.value,
    selected: item.is_selected,
    type: item.type,
    label: item?.value
      ? getLabelOptions(DASHBOARD_INVENTORY_COLOR_MAP[item.type])
      : { show: false },
    tooltip: {
      confine: true,
      formatter: `<span class="ui-whitespace-pre-wrap">${item.tooltip}</span>`,
    },
  }))

  const isEmpty = !data?.length || data.every((item) => !item.value)

  return (
    <DashboardBox.Root id={id}>
      <DashboardBox.Header
        bordered
        className="ui-flex ui-items-center ui-justify-center ui-space-y-0"
      >
        <H5>{title}</H5>
        {information && (
          <DashboardBox.InfoModal title={title}>
            <DashoardInventoryOverviewInformation
              description={information.description}
              details={information.details}
            />
          </DashboardBox.InfoModal>
        )}
      </DashboardBox.Header>
      <DashboardBox.Body>
        <DashboardBox.Config
          download={{
            targetElementId: id,
            fileName: `Dashboard Inventory - ${title}`,
          }}
        />
        <DashboardBox.Content
          className="ui-relative ui-h-96"
          isLoading={isLoading}
          isEmpty={isEmpty}
        >
          <PieChart
            data={chart || []}
            color={color}
            onClick={onClick}
            radius="40%"
            center={['50%', '35%']}
          />
          <p className="ui-absolute ui-bottom-12 ui-w-full ui-text-sm ui-text-center">
            {t('last_updated')} {parseDateTime(lastUpdated)}
          </p>
        </DashboardBox.Content>
      </DashboardBox.Body>
    </DashboardBox.Root>
  )
}
