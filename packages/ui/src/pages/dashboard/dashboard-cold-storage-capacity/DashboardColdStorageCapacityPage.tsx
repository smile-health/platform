import Meta from '#components/layouts/Meta'
import { generateMetaTitle } from '#utils/strings'
import { useTranslation } from 'react-i18next'

import { DashboardColdStorageCapacityProvider } from './DashboardColdStorageCapacityContext'
import AnnualCapacityColdStorageBox from './use-cases/annual-capacity-of-cold-storage/AnnualCapacityColdStorageBox'
import AnnualTargetCoverage from './use-cases/annual-capacity-of-cold-storage/AnnualTargetCoverage'
import FacilitiesByCapacityStatusDistInterval from './use-cases/annual-capacity-of-cold-storage/FacilitiesByCapacityStatusDistInterval'
import FacilitiesByCapacityStatusTemp from './use-cases/annual-capacity-of-cold-storage/FacilitiesByCapacityStatusTemp'
import { ColdStorageDetailBody } from './use-cases/detail/ColdStorageDetailBody'
import { ColdStorageDetailBox } from './use-cases/detail/ColdStorageDetailBox'
import ColdStorageDetailFilter from './use-cases/detail/ColdStorageDetailFilter'
import { ColdStorageDetailHeader } from './use-cases/detail/ColdStorageDetailHeader'
import FunctionalStatus from './use-cases/detail/FunctionalStatus'
import RemainingCapacity from './use-cases/detail/RemainingCapacity'
import StockOfMaterials from './use-cases/detail/StockOfMaterials'
import StoredMaterials from './use-cases/detail/StoredMaterials'
import { DashboardColdStorageCapacityFilter } from './use-cases/filter/DashboardColdStorageCapacityFilter'
import AverageMonthlyConsumption from './use-cases/overview/AverageMonthlyConsumption'
import AverageOrderLeadTime from './use-cases/overview/AverageOrderLeadTime'
import ColdStorageCapacityStatus from './use-cases/overview/ColdStorageCapacityStatus'
import DayOfSupply from './use-cases/overview/DayOfSupply'
import NumberOfEntity from './use-cases/overview/NumberOfEntity'

export const DashboardColdStorageCapacityPage = () => {
  const { t } = useTranslation(['dashboardColdStorageCapacity'])

  return (
    <DashboardColdStorageCapacityProvider>
      <Meta
        title={generateMetaTitle(t('dashboardColdStorageCapacity:title.page'))}
      />
      <DashboardColdStorageCapacityFilter />

      <div className="ui-grid ui-grid-cols-2 ui-gap-6">
        <ColdStorageCapacityStatus />
        <NumberOfEntity />
      </div>
      <div className="ui-grid ui-grid-cols-3 ui-gap-6 ui-mt-6">
        <AverageOrderLeadTime />
        <AverageMonthlyConsumption />
        <DayOfSupply />
      </div>

      <div className="ui-mt-6">
        <ColdStorageDetailBox>
          <ColdStorageDetailHeader />
          <ColdStorageDetailBody>
            <ColdStorageDetailFilter />
            <div className="ui-grid ui-grid-cols-2 ui-gap-6">
              <FunctionalStatus />
              <RemainingCapacity />
            </div>
            <StoredMaterials />
            <StockOfMaterials />
          </ColdStorageDetailBody>
        </ColdStorageDetailBox>
      </div>
      <div className="ui-mt-6">
        <AnnualCapacityColdStorageBox>
          <div className="ui-grid ui-grid-cols-2 ui-gap-6">
            <FacilitiesByCapacityStatusDistInterval />
            <FacilitiesByCapacityStatusTemp />
          </div>
          <AnnualTargetCoverage />
        </AnnualCapacityColdStorageBox>
      </div>
    </DashboardColdStorageCapacityProvider>
  )
}
