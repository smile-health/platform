import DashboardOverallContainer from '#pages/dashboard/components/DashboardOverallContainer'

import { DashboardAsikTabType } from '../dashboard-asik.constant'
import { TDashboardAsikFilter } from '../dashboard-asik.type'
import DashboardAsikChart from './DashboardAsikChart'
import DashboardAsikDataTable from './DashboardAsikDataTable'

type Props = Readonly<{
  filter: TDashboardAsikFilter
  region: DashboardAsikTabType
  enabled?: boolean
}>

export default function DashboardAsikOverview(props: Props) {
  return (
    <DashboardOverallContainer>
      {(view) => {
        if (view === 'chart') {
          return <DashboardAsikChart {...props} />
        }

        return <DashboardAsikDataTable {...props} />
      }}
    </DashboardOverallContainer>
  )
}
