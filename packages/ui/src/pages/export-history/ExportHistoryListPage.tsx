import React from 'react'
import { EmptyState } from '#components/empty-state'
import {
  FilterFormBody,
  FilterFormFooter,
  FilterFormRoot,
  FilterResetButton,
  FilterSubmitButton,
} from '#components/filter'
import Meta from '#components/layouts/Meta'
import Container from '#components/layouts/PageContainer'
import {
  Pagination,
  PaginationContainer,
  PaginationInfo,
  PaginationSelectLimit,
} from '#components/pagination'
import { CommonType } from '#types/common'
import { generateMetaTitle } from '#utils/strings'
import { useTranslation } from 'react-i18next'

import DataTableLoader from '../../components/data-table/DataTableLoader'
import ListExportFile from './components/ListExportFile'
import useExportHistoryList from './hooks/useExportHistoryList'

const ExportHistoryListPage = ({ isGlobal = true }: Readonly<CommonType>) => {
  const { t } = useTranslation('exportHistory')
  const titlePage = generateMetaTitle(t('title'), isGlobal)
  const {
    filter,
    pagination,
    setPagination,
    handleChangeLimit,
    data,
    isLoading,
    downloadFile,
  } = useExportHistoryList()
  return (
    <Container title={t('title')} hideTabs withLayout={isGlobal}>
      <Meta title={titlePage} />
      <div className="mt-6 space-y-5">
        <FilterFormRoot collapsible onSubmit={filter.handleSubmit}>
          <FilterFormBody className="ui-grid-cols-3">
            {filter.renderField()}
          </FilterFormBody>
          <FilterFormFooter>
            <div></div>
            <div className="ui-flex ui-gap-2">
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
        <div className="ui-w-full ui-bg-[#F5F5F4] ui-rounded ui-border ui-border-gray-300 ui-h-14 ui-pl-5 ui-pt-4">
          <div className="ui-text-left ui-text-sm ui-text-neutral-500 ui-font-bold">
            {t('note')}
          </div>
        </div>
        {isLoading && (
          <div>
            <DataTableLoader />
          </div>
        )}
        {!isLoading && (
          <div className="ui-flex ui-flex-col ui-space-y-3">
            {!data?.data || data?.total_item === 0 ? (
              <EmptyState
                title={t('empty.title')}
                description={t('empty.description')}
                withIcon
              />
            ) : null}
            {data?.data?.map((item, index) => (
              <ListExportFile
                item={item}
                index={index}
                downloadFile={downloadFile}
              />
            ))}
          </div>
        )}
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
      </div>
    </Container>
  )
}

export default ExportHistoryListPage
