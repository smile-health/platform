import { useMemo } from 'react'
import { DataTable } from '#components/data-table'
import {
  FilterFormBody,
  FilterFormRoot,
  FilterResetButton,
  FilterSubmitButton,
} from '#components/filter'
import HourGlass from '#components/icons/HourGlass'
import Meta from '#components/layouts/Meta'
import { usePermission } from '#hooks/usePermission'
import { EmptyState } from '#pages/global-settings/population/components/EmptyState'
import { columnsDetailPopulation } from '#pages/global-settings/population/constants/table'
import ProgramPlanListDetailContainer from '#pages/program-plan/list/components/ProgramPlanListDetailContainer'
import { useTranslation } from 'react-i18next'

import useDetailPopulation from '../../global-settings/population/hooks/useDetailPopulation'
import { useAnnualPlanningEnabled } from '#hooks/useAnnualPlanningEnabled'
import Container from '#components/layouts/PageContainer'

export default function AnnualPlanningPopulationListPage() {
  usePermission('population-view')
  const { isDisabledAnnual } = useAnnualPlanningEnabled()
  if (isDisabledAnnual) return <Container title="" withLayout />
  const {
    filter,
    isFilterActive,
    isFetchingDetailPopulation,
    dataDetailPopulation,
    targetGroups,
  } = useDetailPopulation()

  const { t } = useTranslation(['common', 'population'])

  const isPopulationExist = useMemo(() => {
    return (
      isFilterActive &&
      dataDetailPopulation?.data &&
      dataDetailPopulation.data.length > 0
    )
  }, [isFilterActive, dataDetailPopulation])

  const isPopulationNotExist = useMemo(() => {
    return (
      isFilterActive &&
      dataDetailPopulation?.data &&
      dataDetailPopulation.data.length === 0
    )
  }, [isFilterActive, dataDetailPopulation])

  return (
    <ProgramPlanListDetailContainer>
      <Meta title={`SMILE | ${t('population:title')}`} />

      <div className="ui-my-6 ui-flex ui-justify-between ui-items-center">
        <h5 className="ui-font-bold ui-text-xl">{t('population:title')}</h5>
      </div>

      <div className="mt-6">
        <FilterFormRoot collapsible onSubmit={filter.handleSubmit}>
          <FilterFormBody className="ui-flex ui-items-end">
            <div className="ui-w-full">{filter.renderField()}</div>
            <div className="ui-flex ui-gap-2">
              <span className="ui-h-auto ui-w-px ui-bg-neutral-300" />
              <FilterResetButton variant="subtle" onClick={filter.reset} />
              <FilterSubmitButton className="ui-w-[200px]" variant="outline" />
            </div>
          </FilterFormBody>
        </FilterFormRoot>

        <div className="ui-space-y-6 ui-my-5 ui-rounded">
          {!isFilterActive && (
            <div className="ui-border ui-border-gray-300 ui-rounded ui-h-80">
              <EmptyState
                emptyIcon={<HourGlass className="ui-size-6" />}
                title={t('population:empty.no_filter.title')}
                description={t('population:empty.no_filter.description')}
              />
            </div>
          )}
          {isPopulationNotExist && (
            <div className="ui-border ui-border-gray-300 ui-rounded ui-h-80">
              <EmptyState
                emptyIcon={<HourGlass className="ui-size-6" />}
                title={t('message.empty.title')}
                description={t('message.empty.description')}
              />
            </div>
          )}
          {isPopulationExist && (
            <DataTable
              firstRowClassName="ui-bg-[#EFF7FF]"
              data={dataDetailPopulation?.data}
              columns={columnsDetailPopulation({ t, targetGroups })}
              isLoading={isFetchingDetailPopulation}
              className="ui-overflow-x-auto"
            />
          )}
        </div>
      </div>
    </ProgramPlanListDetailContainer>
  )
}
