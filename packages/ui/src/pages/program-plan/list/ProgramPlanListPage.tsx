'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useFeatureIsOn } from '@growthbook/growthbook-react'
import { SortingState } from '@tanstack/react-table'
import { Button } from '#components/button'
import {
  FilterFormBody,
  FilterFormRoot,
  FilterResetButton,
  FilterSubmitButton,
  UseFilter,
  useFilter,
} from '#components/filter'
import Plus from '#components/icons/Plus'
import Meta from '#components/layouts/Meta'
import Container from '#components/layouts/PageContainer'
import { useAnnualPlanningEnabled } from '#hooks/useAnnualPlanningEnabled'
import { usePermission } from '#hooks/usePermission'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'
import useSmileRouter from '#hooks/useSmileRouter'
import { hasPermission } from '#shared/permission/index'
import { CommonType } from '#types/common'
import { parseAsInteger, parseAsString, useQueryStates } from 'nuqs'
import { useTranslation } from 'react-i18next'

import ProgramPlanPopUpForm from '../form/components/ProgramPlanPopUpForm'
import ProgramPlanListTable from './components/ProgramPlanListTable'
import { useProgramPlanListData } from './hooks/useProgramPlanListData'
import ProgramPlanListContext from './libs/program-plan-list.context'
import { programPlanFilterSchema } from './libs/program-plan-list.filter'
import { TProgramPlanData } from './libs/program-plan-list.type'

const ProgramPlanListPage: React.FC<CommonType> = () => {
  usePermission('program-plan-view')
  const { t } = useTranslation(['common', 'programPlan'])
  const [popUpDataRow, setPopUpDataRow] = useState<TProgramPlanData | null>(
    null
  )
  const [openCreateModal, setOpenCreateModal] = useState<boolean>(false)
  const router = useSmileRouter()
  const { isDisabledAnnual } = useAnnualPlanningEnabled()
  const isCopyProgramPlan = useFeatureIsOn('annual_planning.copy_program_plan')
  const [pagination, setPagination] = useQueryStates(
    {
      page: parseAsInteger.withDefault(1),
      paginate: parseAsInteger.withDefault(10),
    },
    {
      history: 'push',
    }
  )

  const [querySorting, setQuerySorting] = useQueryStates(
    {
      sort_by: parseAsString.withDefault(''),
      sort_type: parseAsString.withDefault(''),
    },
    {
      history: 'push',
    }
  )
  const [sorting, setSorting] = useState<SortingState>(
    querySorting?.sort_by
      ? [
          {
            desc: querySorting?.sort_type === 'desc',
            id: querySorting?.sort_by,
          },
        ]
      : []
  )
  useEffect(() => {
    setQuerySorting(
      sorting.length
        ? {
            sort_by: sorting[0].id,
            sort_type: sorting[0].desc ? 'desc' : 'asc',
          }
        : { sort_by: null, sort_type: null }
    )
  }, [sorting])

  const filterSchema = useMemo<UseFilter>(
    () =>
      programPlanFilterSchema({
        t,
      }),
    [t]
  )
  const filter = useFilter(filterSchema)

  const {
    listProgramPlanData,
    isLoadingListProgramPlan,
    isFetchingListProgramPlan,
  } = useProgramPlanListData({
    filter,
    pagination,
    querySorting,
  })

  const contextValueList = useMemo(
    () => ({
      page: pagination.page,
      setPagination,
      popUpDataRow,
      setPopUpDataRow,
      openCreateModal,
      setOpenCreateModal,
    }),
    [
      setPagination,
      pagination.page,
      popUpDataRow,
      setPopUpDataRow,
      openCreateModal,
      setOpenCreateModal,
    ]
  )

  useSetLoadingPopupStore(isFetchingListProgramPlan || isLoadingListProgramPlan)
  if (isDisabledAnnual) return <Container title="" withLayout />

  return (
    <Container title={t('programPlan:title')} withLayout>
      <Meta title={`SMILE | ${t('programPlan:title')}`} />
      <ProgramPlanListContext.Provider value={contextValueList}>
        <div className="ui-my-6 ui-flex ui-justify-between ui-items-center">
          <h5 className="ui-font-bold ui-text-xl">
            {t('programPlan:list_program_plan')}
          </h5>
          {hasPermission('program-plan-mutate') &&
            (isCopyProgramPlan ? (
              <Link
                href={router.getAsLink(`/v5/program-plan/create`)}
                className="ui-block"
              >
                <Button
                  variant="solid"
                  type="button"
                  leftIcon={<Plus className="ui-size-5" />}
                >
                  {t('programPlan:add_program_plan')}
                </Button>
              </Link>
            ) : (
              <>
                <ProgramPlanPopUpForm />
                <Button
                  variant="solid"
                  type="button"
                  leftIcon={<Plus className="ui-size-5" />}
                  onClick={() => setOpenCreateModal(true)}
                >
                  {t('programPlan:add_program_plan')}
                </Button>
              </>
            ))}
        </div>
        <div className="ui-space-y-4 ui-mt-6">
          <FilterFormRoot collapsible={false} onSubmit={filter.handleSubmit}>
            <FilterFormBody className="ui-grid-cols-1">
              <div className="ui-flex ui-items-end ui-gap-3">
                <div className="ui-flex-1">{filter.renderField()}</div>
                <div className="ui-flex ui-gap-3">
                  <FilterResetButton onClick={filter.reset} variant="subtle" />
                  <FilterSubmitButton
                    className="ui-w-40"
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
          <ProgramPlanListTable
            data={listProgramPlanData}
            sorting={sorting}
            setSorting={setSorting}
          />
        </div>
      </ProgramPlanListContext.Provider>
    </Container>
  )
}

export default ProgramPlanListPage
