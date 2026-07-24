'use client'

import React, { useMemo } from 'react'
import { Button } from '#components/button'
import {
  FilterExpandButton,
  FilterFormBody,
  FilterFormFooter,
  FilterFormRoot,
  FilterResetButton,
  FilterSubmitButton,
  UseFilter,
  useFilter,
} from '#components/filter'
import Export from '#components/icons/Export'
import Meta from '#components/layouts/Meta'
import Container from '#components/layouts/PageContainer'
import { usePermission } from '#hooks/usePermission'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'
import { hasPermission } from '#shared/permission/index'
import { CommonType } from '#types/common'
import { getProgramStorage } from '#utils/storage/program'
import { parseAsInteger, useQueryStates } from 'nuqs'
import { useTranslation } from 'react-i18next'

import TransactionListTable from './components/TransactionListTable'
import TransactionListTransporterButton from './components/TransactionListTransporterButton'
import TransactionListContext from './helpers/transaction-list.context'
import { transactionFilterSchema } from './helpers/transaction-list.filter'
import { useTransactionListData } from './hooks/useTransactionListData'
import { useTransactionListExport } from './hooks/useTransactionListExport'

const TransactionListPage: React.FC<CommonType> = () => {
  usePermission('transaction-view')
  const { t } = useTranslation(['common', 'transactionList'])
  const { t: tDashboard } = useTranslation('dashboard')

  const program = getProgramStorage()

  const [pagination, setPagination] = useQueryStates(
    {
      page: parseAsInteger.withDefault(1),
      paginate: parseAsInteger.withDefault(10),
    },
    {
      history: 'push',
    }
  )

  const filterSchema = useMemo<UseFilter>(
    () =>
      transactionFilterSchema({
        t,
        tDashboard,
        program,
      }),
    [t, tDashboard, program]
  )
  const filter = useFilter(filterSchema)

  const {
    listTransactionsData,
    contextValue,
    isFetchingListTransactions,
    isLoadingListTransactions,
  } = useTransactionListData({
    filter,
    pagination,
    setPagination,
    program,
  })

  const { exportQuery } = useTransactionListExport({
    filter,
    program,
  })

  useSetLoadingPopupStore(
    isFetchingListTransactions || isLoadingListTransactions
  )

  return (
    <Container title={t('transactionList:title')} withLayout>
      <Meta title={`SMILE | ${t('transactionList:transaction_list')}`} />
      <TransactionListContext.Provider value={contextValue}>
        <div className="ui-my-6 ui-flex ui-justify-between ui-items-center">
          <h5 className="ui-font-bold ui-text-xl">
            {t('transactionList:transaction_list')}
          </h5>
          {hasPermission('transaction-create') && (
            <TransactionListTransporterButton />
          )}
        </div>
        <div className="ui-space-y-4 ui-mt-6">
          <FilterFormRoot collapsible onSubmit={filter.handleSubmit}>
            <FilterFormBody className="ui-grid-cols-4">
              {filter.renderField()}
            </FilterFormBody>
            <FilterFormFooter>
              <FilterExpandButton variant="subtle" />
              <div className="ui-flex ui-gap-2">
                <Button
                  id="btn-export"
                  variant="subtle"
                  type="button"
                  onClick={() => exportQuery.refetch()}
                  leftIcon={<Export className="ui-size-5" />}
                >
                  {t('common:export')}
                </Button>
                <span className="ui-h-full ui-w-px ui-bg-neutral-300" />
                <FilterResetButton onClick={filter.reset} variant="subtle" />
                <FilterSubmitButton
                  className="ui-w-[202px]"
                  variant="outline"
                  onClick={() => setPagination({ page: 1 })}
                />
              </div>
            </FilterFormFooter>
            {filter.renderActiveFilter()}
          </FilterFormRoot>
        </div>
        <div className="ui-space-y-6 ui-my-5 ui-rounded">
          <TransactionListTable data={listTransactionsData} />
        </div>
      </TransactionListContext.Provider>
    </Container>
  )
}

export default TransactionListPage
