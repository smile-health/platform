import { createContext, ReactNode, useContext, useMemo, useState } from 'react'
import { useFilter } from '#components/filter'

import DashboardBox from '../components/DashboardBox'
import {
  useGetDashboardCceAnnualQuery,
  useGetDashboardCceMaterialQuery,
  useGetDashboardCceOverviewQuery,
} from './dashboard-cold-storage-capacity.queries'
import { useDashboardColdStorageCapacityFilterSchema } from './use-cases/filter/useDashboardColdStorageCapacityFilterSchema'
import { DashboardColdStorageCapacityFilterParams } from './use-cases/filter/useDashboardColdStorageCapacityFilterSchema.types'

type DashboardColdStorageCapacityContextType = {
  filter: ReturnType<typeof useFilter>
  overview: ReturnType<typeof useGetDashboardCceOverviewQuery>
  detail: ReturnType<typeof useGetDashboardCceMaterialQuery> & {
    isPqs: boolean
    onChangePqs: (value: boolean) => void
    onResetPqs: () => void
  }
  annual: ReturnType<typeof useGetDashboardCceAnnualQuery>
}

const DashboardColdStorageCapacityContext =
  createContext<DashboardColdStorageCapacityContextType | null>(null)

export function useDashboardColdStorageCapacity() {
  const context = useContext(DashboardColdStorageCapacityContext)
  if (!context) {
    throw new Error(
      'useDashboardColdStorageCapacity must be used within DashboardColdStorageCapacityProvider'
    )
  }
  return context
}

type ProviderProps = {
  children: ReactNode
}

export function DashboardColdStorageCapacityProvider({
  children,
}: ProviderProps) {
  const [isPqs, setIsPqs] = useState(true)

  const filterSchema = useDashboardColdStorageCapacityFilterSchema()
  const filter = useFilter(filterSchema)
  const filterValues = useMemo(
    () => filter.getValues() as DashboardColdStorageCapacityFilterParams,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filter.query]
  )

  const overview = useGetDashboardCceOverviewQuery(filterValues)
  const detail = useGetDashboardCceMaterialQuery(filterValues, isPqs)
  const annual = useGetDashboardCceAnnualQuery(filterValues)

  const onChangePqs = (value: boolean) => {
    setIsPqs(value)
  }

  const onResetPqs = () => {
    setIsPqs(true)
  }

  return (
    <DashboardColdStorageCapacityContext.Provider
      value={{
        filter,
        overview,
        detail: {
          isPqs,
          onChangePqs,
          onResetPqs,
          ...detail,
        },
        annual,
      }}
    >
      <DashboardBox.Provider filter={filter?.query} showRegion={false}>
        {children}
      </DashboardBox.Provider>
    </DashboardColdStorageCapacityContext.Provider>
  )
}
