'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
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
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'
import useSmileRouter from '#hooks/useSmileRouter'
import { parseAsInteger, parseAsString, useQueryStates } from 'nuqs'
import { useTranslation } from 'react-i18next'

import BmhpPlanningPopUpForm from '../form/components/BmhpPlanningPopUpForm'
import BmhpPlanningListTable from './components/BmhpPlanningListTable'
import { useBmhpPlanningListData } from './hooks/useBmhpPlanningListData'
import { BmhpPlanningListContext } from './libs/bmhp-planning-list.context'
import { bmhpPlanningFilterSchema } from './libs/bmhp-planning-list.filter'

const BmhpPlanningListPage: React.FC = () => {
  const { t } = useTranslation(['common', 'bmhpPlanning'])
  const router = useSmileRouter()
  const queryClient = useQueryClient()
  const [openCreateModal, setOpenCreateModal] = useState(false)

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
      bmhpPlanningFilterSchema({
        t,
      }),
    [t]
  )
  const filter = useFilter(filterSchema)

  const { listYearData, isLoadingListYear, isFetchingListYear } =
    useBmhpPlanningListData({
      filter,
      pagination,
      querySorting,
    })

  const refreshData = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['bmhp-planning-years'] })
  }, [queryClient])

  const contextValueList = useMemo(
    () => ({
      page: pagination.page,
      setPagination,
      openCreateModal,
      setOpenCreateModal,
      refreshData,
    }),
    [
      pagination.page,
      setPagination,
      openCreateModal,
      setOpenCreateModal,
      refreshData,
    ]
  )

  useSetLoadingPopupStore(isFetchingListYear || isLoadingListYear)

  return (
    <Container title={t('bmhpPlanning:title')} withLayout>
      <Meta title={`SMILE | ${t('bmhpPlanning:title')}`} />
      <BmhpPlanningListContext.Provider value={contextValueList}>
        <BmhpPlanningPopUpForm />
        <div className="ui-my-6 ui-flex ui-justify-between ui-items-center">
          <h5 className="ui-font-bold ui-text-xl">
            {t('bmhpPlanning:list_title')}
          </h5>
          <Button
            variant="solid"
            type="button"
            leftIcon={<Plus className="ui-size-5" />}
            // onClick={() => setOpenCreateModal(true)}
            onClick={() => router.push('/v5/bmhp-planning/create')}
          >
            {t('bmhpPlanning:add_year')}
          </Button>
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
          <BmhpPlanningListTable
            data={listYearData}
            sorting={sorting}
            setSorting={setSorting}
          />
        </div>
      </BmhpPlanningListContext.Provider>
    </Container>
  )
}

export default BmhpPlanningListPage
