'use client'

import React, { useMemo, useState } from 'react'
import Link from 'next/link'
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
import Plus from '#components/icons/Plus'
import Meta from '#components/layouts/Meta'
import Container from '#components/layouts/PageContainer'
import { usePermission } from '#hooks/usePermission'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'
import useSmileRouter from '#hooks/useSmileRouter'
import { hasPermission } from '#shared/permission/index'
import { CommonType } from '#types/common'
import { parseAsInteger, useQueryStates } from 'nuqs'
import { useTranslation } from 'react-i18next'

import PeriodOfStockTakingActivePeriodBox from './components/PeriodOfStockTakingActivePeriodBox'
import PeriodOfStockTakingListTable from './components/PeriodOfStockTakingListTable'
import { usePeriodOfStockTakingActiveData } from './hooks/usePeriodOfStockTakingActiveData'
import { usePeriodOfStockTakingListData } from './hooks/usePeriodOfStockTakingListData'
import { usePeriodOfStockTakingListExport } from './hooks/usePeriodOfStockTakingListExport'
import PeriodOfStockTakingListContext from './libs/period-of-stock-taking-list.context'
import { periodOfStockTakingFilterSchema } from './libs/period-of-stock-taking-list.filter'
import { TPeriodOfStockTakingData } from './libs/period-of-stock-taking-list.type'

const PeriodOfStockTakingListPage: React.FC<CommonType> = () => {
  usePermission('period-of-stock-taking-view')
  const { t } = useTranslation(['common', 'periodOfStockTaking'])
  const router = useSmileRouter()

  const [pagination, setPagination] = useQueryStates(
    {
      page: parseAsInteger.withDefault(1),
      paginate: parseAsInteger.withDefault(10),
    },
    {
      history: 'push',
    }
  )
  const [popUpDataRow, setPopUpDataRow] =
    useState<TPeriodOfStockTakingData | null>(null)

  const filterSchema = useMemo<UseFilter>(
    () =>
      periodOfStockTakingFilterSchema({
        t,
      }),
    [t]
  )
  const filter = useFilter(filterSchema)

  const {
    listPeriodOfStockTakingData,
    isLoadingListPeriodOfStockTaking,
    isFetchingListPeriodOfStockTaking,
  } = usePeriodOfStockTakingListData({
    filter,
    pagination,
  })

  const { contextValue, activePeriodData } =
    usePeriodOfStockTakingActiveData('none')

  const contextValueList = useMemo(
    () => ({
      ...contextValue,
      page: pagination.page,
      setPagination,
      popUpDataRow,
      setPopUpDataRow,
    }),
    [
      contextValue,
      setPagination,
      popUpDataRow,
      setPopUpDataRow,
      pagination.page,
    ]
  )

  const { exportQuery } = usePeriodOfStockTakingListExport({
    filter,
  })

  useSetLoadingPopupStore(
    isFetchingListPeriodOfStockTaking || isLoadingListPeriodOfStockTaking
  )

  return (
    <Container title={t('periodOfStockTaking:title')} withLayout>
      <Meta title={`SMILE | ${t('periodOfStockTaking:list_of_period')}`} />
      <PeriodOfStockTakingListContext.Provider value={contextValueList}>
        <div className="ui-my-6 ui-flex ui-justify-end ui-items-center">
          {hasPermission('period-of-stock-taking-mutate') && (
            <Link
              href={router.getAsLink(`/v5/period-of-stock-taking/create`)}
              className="ui-block"
            >
              <Button
                variant="solid"
                type="button"
                leftIcon={<Plus className="ui-size-5" />}
              >
                {t('periodOfStockTaking:add_period')}
              </Button>
            </Link>
          )}
        </div>
        <div className="ui-space-y-4 ui-mt-6">
          <FilterFormRoot collapsible={false} onSubmit={filter.handleSubmit}>
            <FilterFormBody className="ui-grid-cols-1">
              <div className="ui-flex ui-justify-between ui-items-end ui-gap-10">
                <div className="ui-flex-1">{filter.renderField()}</div>
                <div className="ui-flex ui-gap-2 ui-w-1/4">
                  <Button
                    id="btn-export"
                    variant="subtle"
                    type="button"
                    onClick={() => exportQuery.refetch()}
                    leftIcon={<Export className="ui-size-5" />}
                  >
                    {t('common:export')}
                  </Button>
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
        {activePeriodData && (
          <div className="ui-space-y-6 ui-my-5">
            <PeriodOfStockTakingActivePeriodBox />
          </div>
        )}

        <div className="ui-space-y-6 ui-my-5 ui-rounded">
          <PeriodOfStockTakingListTable data={listPeriodOfStockTakingData} />
        </div>
      </PeriodOfStockTakingListContext.Provider>
    </Container>
  )
}

export default PeriodOfStockTakingListPage
