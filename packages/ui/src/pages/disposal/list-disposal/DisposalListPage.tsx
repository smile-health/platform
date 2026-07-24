import AppLayout from "#components/layouts/AppLayout/AppLayout"
import { Button } from "#components/button"
import { DataTable } from "#components/data-table"
import Export from "#components/icons/Export"
import {
  FilterExpandButton,
  FilterFormBody,
  FilterFormFooter,
  FilterFormRoot,
  FilterResetButton,
  FilterSubmitButton
} from "#components/filter"
import Meta from "#components/layouts/Meta"
import {
  Pagination,
  PaginationContainer,
  PaginationInfo,
  PaginationSelectLimit
} from "#components/pagination"

import { useDisposalListPage } from "./hooks/useDisposalListPage"
import { columns } from "./constants/table"

const DisposalListPage: React.FC = () => {
  const {
    language,
    t,
    filter,
    pagination,
    setPagination,
    handleChangePage,
    handleChangePaginate,
    handleExport,
    datasource,
    isFetching,
    handleSelectRow,
  } = useDisposalListPage()

  // Handle both new and legacy API response structure
  const dataList = datasource?.data || datasource?.list || []
  const totalItems = datasource?.total_item || datasource?.total || 0
  const totalPages = datasource?.total_page !== undefined ? datasource.total_page : Math.ceil(totalItems / pagination.paginate)

  return (
    <AppLayout title={t('disposalList:title')}>
      <Meta title={t('disposalList:meta')} />

      <div className="mt-6">
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
                leftIcon={<Export className="ui-size-5" />}
                onClick={() => handleExport()}
              >
                {t('export')}
              </Button>
              <span className="ui-h-full ui-w-px ui-bg-neutral-300" />
              <FilterResetButton onClick={filter.reset} variant="subtle" />
              <FilterSubmitButton onClick={() => setPagination({ page: 1 })} className="ui-w-[220px]" variant="outline"></FilterSubmitButton>
            </div>
          </FilterFormFooter>
          {filter.renderActiveFilter()}
        </FilterFormRoot>

        <div className="ui-space-y-6 ui-my-5 ui-rounded">
          <DataTable
            data={dataList}
            columns={columns({
              onClickRow: handleSelectRow,
              t,
              no: (pagination.page - 1) * pagination.paginate,
              language,
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
              total={totalItems}
            />
            <Pagination
              totalPages={totalPages}
              currentPage={pagination.page}
              onPageChange={(page) => handleChangePage(page)}
            />
          </PaginationContainer>
        </div>
      </div>
    </AppLayout>
  )
}

export default DisposalListPage
