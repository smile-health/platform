import { Button } from '#components/button'
import {
  FilterFormBody,
  FilterFormRoot,
  FilterResetButton,
  FilterSubmitButton,
} from '#components/filter'
import Export from '#components/icons/Export'
import Meta from '#components/layouts/Meta'
import {
  Pagination,
  PaginationContainer,
  PaginationInfo,
  PaginationSelectLimit,
} from '#components/pagination'
import { usePermission } from '#hooks/usePermission'
import { hasPermission } from '#shared/permission/index'

import { DataTable } from '../../../components/data-table/DataTable'
import GlobalSettings from '../GlobalSettings'
import { columns } from './constants/table'
import { useGlobalSettingProgramListPage } from './hooks/useGlobalSettingProgramListPage'

const GlobalSettingProgramListPage = () => {
  usePermission('program-global-view')
  const {
    t,
    language,
    router,
    pagination,
    filter,
    sorting,
    handleChangePage,
    handleChangeLimit,
    handleChangeSort,
    isLoading,
    isFetching,
    datasource,
    handleAction,
    refetchExport,
  } = useGlobalSettingProgramListPage()

  return (
    <GlobalSettings
      title={t('programGlobalSettings:title.list')}
      showButtonCreate={hasPermission('program-global-mutate')}
      buttonCreate={{
        label: t('programGlobalSettings:create'),
        onClick: () => {
          router.push(`/${language}/v5/global-settings/program/create`)
        },
      }}
    >
      <Meta title="SMILE | Global Program Management" />

      <div className="ui-space-y-6">
        <FilterFormRoot collapsible onSubmit={filter.handleSubmit}>
          <FilterFormBody className="ui-grid-cols-3 ui-items-end">
            {filter.renderField()}
            <div className="ui-flex ui-gap-2 ui-justify-end">
              <Button
                id="btn-export"
                variant="subtle"
                type="button"
                className="ui-px-2"
                leftIcon={<Export className="ui-size-5" />}
                onClick={() => refetchExport()}
              >
                {t('common:export')}
              </Button>
              <span className="ui-h-auto ui-w-px ui-bg-neutral-300" />
              <FilterResetButton variant="subtle" onClick={filter.reset} />
              <FilterSubmitButton
                onClick={() => handleChangePage(1)}
                variant="outline"
                className="ui-w-[220px]"
              ></FilterSubmitButton>
            </div>
          </FilterFormBody>
          {filter.renderActiveFilter()}
        </FilterFormRoot>

        <DataTable
          data={datasource?.data}
          columns={columns({
            t,
            handleAction,
            page: datasource?.page,
            size: datasource?.item_per_page,
          })}
          isLoading={isLoading || isFetching}
          sorting={[sorting]}
          setSorting={handleChangeSort}
        />
        {datasource?.total_item && (
          <PaginationContainer>
            <PaginationSelectLimit
              size={pagination.paginate}
              onChange={handleChangeLimit}
              perPagesOptions={datasource.list_pagination}
            />
            <PaginationInfo
              size={pagination.paginate}
              currentPage={pagination.page}
              total={datasource?.total_item}
            />
            <Pagination
              totalPages={datasource.total_page}
              currentPage={pagination.page}
              onPageChange={handleChangePage}
            />
          </PaginationContainer>
        )}
      </div>
    </GlobalSettings>
  )
}

export default GlobalSettingProgramListPage
