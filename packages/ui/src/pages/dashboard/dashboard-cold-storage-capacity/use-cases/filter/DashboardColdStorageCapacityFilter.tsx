import DashboardFilter from '../../../components/DashboardFilter'
import { useDashboardColdStorageCapacity } from '../../DashboardColdStorageCapacityContext'

export const DashboardColdStorageCapacityFilter = () => {
  const { filter } = useDashboardColdStorageCapacity()
  return <DashboardFilter filter={filter} />
}
