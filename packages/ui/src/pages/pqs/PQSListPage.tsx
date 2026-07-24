'use client'

import React from 'react'
import { Button } from '#components/button'
import {
  FilterFormBody,
  FilterFormFooter,
  FilterFormRoot,
  FilterResetButton,
  FilterSubmitButton,
} from '#components/filter'
import Export from '#components/icons/Export'
import Meta from '#components/layouts/Meta'
import Container from '#components/layouts/PageContainer'
import {
  Pagination,
  PaginationContainer,
  PaginationInfo,
  PaginationSelectLimit,
} from '#components/pagination'
import { usePermission } from '#hooks/usePermission'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'
import { CommonType } from '#types/common'

import { DataTable } from '../../components/data-table/DataTable'
import { usePQSList } from './hooks/usePQSList'
import usePQSTable from './hooks/usePQSTable'

const PQSListPage: React.FC<CommonType> = ({ isGlobal }) => {
  usePermission('pqs-global-view')
  const {
    datasource,
    isLoading,
    exportQuery,
    handleChangeLimit,
    t,
    filter,
    pagination,
    setPagination,
    setSorting,
    sorting,
  } = usePQSList({ isGlobal })
  const { schema: tableSchema } = usePQSTable({
    isGlobal,
    page: pagination.page,
    size: pagination.paginate,
  })
  useSetLoadingPopupStore(isLoading || exportQuery.isFetching)

  return (
    <Container
      title={t('pqs:list.list')}
      hideTabs={isGlobal}
      withLayout={!isGlobal}
    >
      <Meta
        title={`Smile | ${isGlobal ? 'Global' : ''} ${t('pqs:title.list')}`}
      />
      <div className="ui-mt-6 ui-space-y-6">
        <FilterFormRoot onSubmit={filter.handleSubmit}>
          <FilterFormBody className="ui-flex ui-items-end">
            <div className="ui-grow ui-grid ui-grid-cols-1 ui-items-end ui-gap-4">
              {filter.renderField()}
            </div>
            <div className="ui-flex ui-gap-5 w-1/3">
              <Button
                id="btn-export"
                variant="subtle"
                type="button"
                onClick={() => exportQuery.refetch()}
                loading={exportQuery.isFetching || exportQuery.isLoading}
                leftIcon={<Export className="ui-size-5" />}
              >
                {t('common:export')}
              </Button>
              <span className="ui-w-px ui-bg-neutral-300" />
              <div className="ui-flex ui-gap-2">
                <FilterResetButton onClick={filter.reset} variant="subtle" />
              </div>
              <FilterSubmitButton
                onClick={() => setPagination({ page: 1 })}
                variant="outline"
                className="ui-w-[220px]"
              ></FilterSubmitButton>
            </div>
          </FilterFormBody>
          {filter.renderActiveFilter()}
        </FilterFormRoot>
        <DataTable
          data={datasource?.data}
          columns={tableSchema}
          isLoading={isLoading}
          sorting={sorting}
          setSorting={setSorting}
        />
        <PaginationContainer>
          <PaginationSelectLimit
            size={pagination.paginate}
            onChange={handleChangeLimit}
            perPagesOptions={datasource?.list_pagination}
          />
          <PaginationInfo
            size={pagination.paginate}
            currentPage={pagination.page}
            total={datasource?.total_item}
          />
          <Pagination
            totalPages={datasource?.total_page || 1}
            currentPage={pagination.page}
            onPageChange={(page) => setPagination({ page })}
          />
        </PaginationContainer>
      </div>
    </Container>
  )
}

export default PQSListPage
