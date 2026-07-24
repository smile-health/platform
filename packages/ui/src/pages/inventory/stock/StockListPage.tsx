import React, { useMemo } from "react"
import { useTranslation } from "react-i18next"

import AppLayout from "#components/layouts/AppLayout/AppLayout"
import { DataTable } from "#components/data-table"

import { StockListContext } from "./context/Provider"

import { columns } from "./constant/table"
import { useStockListPage } from "./hooks/useStockListPage"
import { getProgramStorage } from "#utils/storage/program"
import {
  Pagination,
  PaginationContainer,
  PaginationInfo,
  PaginationSelectLimit
} from "#components/pagination"
import StockFilter from "./component/StockFilter"
import Meta from "#components/layouts/Meta"

const StockListPage: React.FC = () => {
  const { t, i18n: { language } } = useTranslation(['stock', 'common'])
  const isHierarchical = getProgramStorage()?.config?.material?.is_hierarchy_enabled
  const {
    pagination,
    datasource,
    isFetching,
    handleChangePage,
    handleChangePaginate,
    setPagination,
    filter,
    handleExport,
    handleSelectRow,
    createUrlDetail,
  } = useStockListPage(isHierarchical)

  const value = useMemo(() => ({
    setPagination,
    isHierarchical,
    handleExport,
    filter: {
      getValues: filter.getValues,
      handleSubmit: filter.handleSubmit,
      renderActiveFilter: filter.renderActiveFilter,
      renderField: filter.renderField,
      reset: filter.reset,
    }
  }), [
    setPagination,
    isHierarchical,
    handleExport,
    filter.getValues,
    filter.handleSubmit,
    filter.renderActiveFilter,
    filter.renderField,
    filter.reset,
  ])

  return (
    <AppLayout title={t('stock:title')}>
      <Meta title={`SMILE | ${t('stock:meta')}`} />

      <StockListContext.Provider value={value}>
        <div className="mt-6">
          <StockFilter />
          <div className="ui-space-y-6 ui-my-5 ui-rounded">
            <DataTable
              data={datasource?.data}
              columns={columns({
                onClickRow: handleSelectRow,
                isHierarchical,
                t,
                no: (pagination.page - 1) * pagination.paginate,
                language,
                createUrlDetail,
              })}
              isLoading={isFetching}
            />
            <PaginationContainer>
              <PaginationSelectLimit
                size={pagination.paginate}
                onChange={(paginate) => handleChangePaginate(paginate)}
                perPagesOptions={datasource?.list_pagination}
              />
              <PaginationInfo
                size={pagination.paginate}
                currentPage={pagination.page}
                total={datasource?.total_item}
              />
              <Pagination
                totalPages={datasource?.total_page || 0}
                currentPage={pagination.page}
                onPageChange={(page) => handleChangePage(page)}
              />
            </PaginationContainer>
          </div>
        </div>
      </StockListContext.Provider>
    </AppLayout>
  )
}

export default StockListPage
