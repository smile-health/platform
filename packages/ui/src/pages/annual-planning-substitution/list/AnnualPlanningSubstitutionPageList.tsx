'use client'

import React, { useMemo, useState } from 'react'
import { Button } from '#components/button'
import {
  FilterFormBody,
  FilterFormRoot,
  FilterResetButton,
  FilterSubmitButton,
  UseFilter,
  useFilter,
} from '#components/filter'
import Export from '#components/icons/Export'
import Meta from '#components/layouts/Meta'
import { usePermission } from '#hooks/usePermission'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'
import useSmileRouter from '#hooks/useSmileRouter'
import ProgramPlanListDetailContainer from '#pages/program-plan/list/components/ProgramPlanListDetailContainer'
import { CommonType } from '#types/common'
import { parseAsInteger, useQueryStates } from 'nuqs'
import { useTranslation } from 'react-i18next'

import AnnualPlanningSubstitutionListTable from './components/AnnualPlanningSubstitutionListTable'
import {
  AnnualPlanningAddButton,
  AnnualPlanningDownloadTemplateButton,
  AnnualPlanningImportButton,
} from './components/AnnualPlanningSubstitutionManipulationButtons'
import { useAnnualPlanningSubstitutionListData } from './hooks/useAnnualPlanningSubstitutionListData'
import { useAnnualPlanningSubstitutionListExport } from './hooks/useAnnualPlanningSubstitutionListExport'
import AnnualPlanningSubstitutionListContext from './libs/annual-planning-substitution-list.context'
import { annualPlanningSubstitutionFilterSchema } from './libs/annual-planning-substitution-list.filter'
import { TAnnualPlanningSubstitutionData } from './libs/annual-planning-substitution-list.type'
import { useAnnualPlanningEnabled } from '#hooks/useAnnualPlanningEnabled'
import Container from '#components/layouts/PageContainer'

const AnnualPlanningSubstitutionListPage: React.FC<CommonType> = () => {
  usePermission('annual-planning-substitution-view')
  const { isDisabledAnnual } = useAnnualPlanningEnabled()
  if (isDisabledAnnual) return <Container title="" withLayout />

  const { t } = useTranslation(['common', 'annualPlanningSubstitution'])
  const router = useSmileRouter()
  const { id: planId } = router.query
  const [pagination, setPagination] = useQueryStates(
    {
      page: parseAsInteger.withDefault(1),
      paginate: parseAsInteger.withDefault(10),
    },
    {
      history: 'push',
    }
  )
  const [openedRow, setOpenedRow] =
    useState<TAnnualPlanningSubstitutionData | null>(null)

  const filterSchema = useMemo<UseFilter>(
    () =>
      annualPlanningSubstitutionFilterSchema({
        t,
        planId: Number(planId),
      }),
    [t, planId]
  )
  const filter = useFilter(filterSchema)

  const contextValueList = useMemo(
    () => ({
      page: pagination.page,
      setPagination,
      openedRow,
      setOpenedRow,
    }),
    [setPagination, pagination.page, openedRow, setOpenedRow]
  )

  const {
    listAnnualPlanningSubstitutionData,
    isLoadingListAnnualPlanningSubstitution,
    isFetchingListAnnualPlanningSubstitution,
  } = useAnnualPlanningSubstitutionListData({
    filter,
    pagination,
  })

  const { exportQuery } = useAnnualPlanningSubstitutionListExport({
    filter,
  })

  useSetLoadingPopupStore(
    isFetchingListAnnualPlanningSubstitution ||
    isLoadingListAnnualPlanningSubstitution
  )

  return (
    <ProgramPlanListDetailContainer isGlobal={false}>
      <Meta title={`SMILE | ${t('annualPlanningSubstitution:title')}`} />
      <AnnualPlanningSubstitutionListContext.Provider value={contextValueList}>
        <div className="ui-my-6 ui-flex ui-justify-between ui-items-center">
          <h5 className="ui-font-bold ui-text-xl">
            {t('annualPlanningSubstitution:title')}
          </h5>
          <AnnualPlanningAddButton />
        </div>
        <div className="ui-space-y-4 ui-mt-6">
          <FilterFormRoot collapsible={false} onSubmit={filter.handleSubmit}>
            <FilterFormBody className="ui-grid-cols-1">
              <div className="ui-flex ui-items-end ui-gap-10">
                <div className="ui-flex-1">{filter.renderField()}</div>
                <div className="ui-flex ui-gap-2">
                  <AnnualPlanningImportButton />
                  <Button
                    id="annual_planning_substitution_export"
                    variant="subtle"
                    type="button"
                    onClick={() => exportQuery.refetch()}
                    leftIcon={<Export className="ui-size-5" />}
                  >
                    {t('common:export')}
                  </Button>
                  <AnnualPlanningDownloadTemplateButton />
                  <div className="ui-w-px ui-h-auto ui-bg-neutral-300" />
                  <FilterResetButton onClick={filter.reset} variant="subtle" />
                  <FilterSubmitButton
                    className="ui-w-full"
                    variant="outline"
                    onClick={() => setPagination({ page: 1 })}
                  />
                </div>
              </div>
            </FilterFormBody>
            {filter.renderActiveFilter()}
          </FilterFormRoot>
        </div>
        <div className="ui-space-y-6 ui-my-5 ui-rounded">
          <AnnualPlanningSubstitutionListTable
            data={listAnnualPlanningSubstitutionData}
          />
        </div>
      </AnnualPlanningSubstitutionListContext.Provider>
    </ProgramPlanListDetailContainer>
  )
}

export default AnnualPlanningSubstitutionListPage
