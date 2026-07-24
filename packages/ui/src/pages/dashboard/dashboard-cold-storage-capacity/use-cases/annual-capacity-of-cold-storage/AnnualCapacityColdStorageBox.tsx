import { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import DashboardColdStorageCapacityBox from '../../components/DashboardColdStorageCapacityBox'
import { useDashboardColdStorageCapacity } from '../../DashboardColdStorageCapacityContext'

type Props = Readonly<{
  children?: ReactNode
}>

export default function AnnualCapacityColdStorageBox({ children }: Props) {
  const { t } = useTranslation('dashboardColdStorageCapacity')
  const { filter } = useDashboardColdStorageCapacity()
  const periodYear = new Date(filter.getValues().period?.end).getFullYear()

  return (
    <DashboardColdStorageCapacityBox
      id="annual-capacity-cold-storage"
      title={t('section.annual_capacity.title')}
      subtitle={t('section.annual_capacity.subtitle', {
        year: periodYear,
      })}
      showConfig={false}
      headerClassName="ui-bg-gray-200 ui-pt-6"
      bodyClassName="ui-bg-gray-100 ui-py-6"
    >
      <div className="ui-space-y-4 ui-w-full">{children}</div>
    </DashboardColdStorageCapacityBox>
  )
}
