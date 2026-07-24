'use client'

import { Button } from '#components/button'
import { DataTable } from '#components/data-table'
import {
  FilterExpandButton,
  FilterFormBody,
  FilterFormFooter,
  FilterFormRoot,
  FilterResetButton,
  FilterSubmitButton,
} from '#components/filter'
import Export from '#components/icons/Export'
import {
  Pagination,
  PaginationContainer,
  PaginationInfo,
  PaginationSelectLimit,
} from '#components/pagination'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'
import { useTranslation } from 'react-i18next'

import ReconciliationContainer from '../ReconciliationContainer'
import { useReconciliationList } from './hooks/useReconciliationList'

const ReconciliationListPage = () => {
  const { t } = useTranslation(['reconciliation'])
  const {
    schemaTable,
    filter,
    data,
    isLoading,
    pagination,
    setPagination,
    handleChangeLimit,
    exportQuery,
    handleSearch,
  } = useReconciliationList()
  useSetLoadingPopupStore(
    isLoading || exportQuery.isLoading || exportQuery.isFetching
  )
  return (
    <ReconciliationContainer metaTitle={t('reconciliation:title.list')}>
      <FilterFormRoot
        collapsible
        onSubmit={(e) => {
          e.preventDefault()
          filter.handleSubmit(e)
          handleSearch()
        }}
      >
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
              {t('filter.export')}
            </Button>
            <span className="ui-h-full ui-w-px ui-bg-neutral-300" />
            <FilterResetButton onClick={filter.reset} variant="subtle" />
            <FilterSubmitButton
              className="ui-w-[202px]"
              variant="outline"
              onClick={handleSearch}
            />
          </div>
        </FilterFormFooter>
        {filter.renderActiveFilter()}
      </FilterFormRoot>
      <div className="ui-space-y-6 ui-my-5 ui-rounded">
        <DataTable
          columns={schemaTable}
          data={data?.data}
          id="reconciliation__list__table"
          isLoading={isLoading}
        />
      </div>
      <PaginationContainer>
        <PaginationSelectLimit
          size={pagination.paginate}
          onChange={handleChangeLimit}
          perPagesOptions={data?.list_pagination}
        />
        <PaginationInfo
          size={pagination.paginate}
          currentPage={pagination.page}
          total={data?.total_item}
        />
        <Pagination
          totalPages={data?.total_page || 1}
          currentPage={pagination.page}
          onPageChange={(page) => setPagination({ page })}
        />
      </PaginationContainer>
    </ReconciliationContainer>
  )
}

export default ReconciliationListPage
