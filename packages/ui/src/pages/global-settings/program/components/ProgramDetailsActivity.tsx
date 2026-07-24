import { Fragment } from 'react'
import { Button } from '#components/button'
import { DataTable } from '#components/data-table'
import Export from '#components/icons/Export'
import Plus from '#components/icons/Plus'
import Reload from '#components/icons/Reload'
import { InputSearch } from '#components/input'
import ModalError from '#components/modules/ModalError'
import { ModalImport } from '#components/modules/ModalImport'
import {
  Pagination,
  PaginationContainer,
  PaginationInfo,
  PaginationSelectLimit,
} from '#components/pagination'

import { columnsActivity } from '../constants/table'
import { useProgramDetailsActivity } from '../hooks/useProgramDetailsActivity'

const ProgramDetailsActivity: React.FC = () => {
  const {
    t,
    dataActivities,
    isFetching,
    pagination,
    handleChangePage,
    handleChangeLimit,
    router,
    id,
    language,
    showImport,
    setShowImport,
    modalImportErrors,
    setModalImportErrors,
    onImport,
    handleAction,
    exportQuery,
    filter,
    setFilter,
    handleSearch,
    handleReset,
    sort,
    setSort
  } = useProgramDetailsActivity()

  return (
    <Fragment>
      <ModalError
        errors={modalImportErrors.errors}
        open={modalImportErrors.open}
        handleClose={() =>
          setModalImportErrors({ open: false, errors: undefined })
        }
      />
      <ModalImport
        open={showImport}
        setOpen={setShowImport}
        onSubmit={onImport}
        handleClose={() => setShowImport(false)}
      />

      <div className="ui-space-y-6">
        <div className="ui-flex ui-justify-between ui-items-center">
          <h5 className="ui-text-xl ui-font-bold">
            {t('programGlobalSettings:details.title.activity')}
          </h5>
          <Button
            id="btn-program-activity-add"
            variant="solid"
            leftIcon={<Plus className="ui-size-5" />}
            onClick={() =>
              router.push(
                `/${language}/v5/global-settings/program/${id}/activity/create`
              )
            }
            className="ui-min-w-36"
          >
            {t('common:add')}
          </Button>
        </div>
        <form
          className="ui-p-4 ui-border ui-border-gray-300 ui-rounded ui-flex ui-gap-4"
          onSubmit={(e) => {
            e.preventDefault()
          }}
        >
          <div className="ui-flex-1">
            <InputSearch
              id="input-search-activity-program"
              placeholder={t('common:search')}
              value={filter.keyword}
              onChange={(e) =>
                setFilter((prev) => ({
                  ...prev,
                  keyword: e.target.value,
                  resetPage: true,
                }))
              }
            />
          </div>
          <div className="ui-flex ui-items-center ui-gap-2">
            {/* <Button
              id="btn-import"
              variant="subtle"
              type="button"
              onClick={() => setShowImport(true)}
              loading={isPendingImport}
              leftIcon={<Import className="ui-size-5" />}
            >
              {t('import')}
            </Button> */}
            <Button
              id="btn-export"
              variant="subtle"
              type="button"
              className="ui-px-2"
              leftIcon={<Export className="ui-size-5" />}
              onClick={() => exportQuery.refetch()}
            >
              {t('common:export')}
            </Button>
            {/* <Button
              id="btn-download-template"
              variant="subtle"
              type="button"
              onClick={() => refetchTemplate()}
              loading={isDownloadingTemplate}
              leftIcon={<Download className="ui-size-5" />}
            >
              {t('download_template')}
            </Button> */}
            <span className="ui-h-full ui-w-px ui-bg-neutral-300" />
            <Button
              id="btn-activity-refresh"
              data-testid="btn-activity-refresh"
              type="button"
              variant="subtle"
              onClick={() => handleReset()}
              leftIcon={<Reload className="ui-size-5" />}
            >
              Reset
            </Button>
            <Button
              id="btn-activity-submit"
              data-testid="btn-activity-submit"
              type="submit"
              className="ui-w-[220px]"
              variant="outline"
              onClick={() => handleSearch()}
            >
              {t('common:search')}
            </Button>
          </div>
        </form>
        <DataTable
          data={dataActivities?.data ?? []}
          columns={columnsActivity({ t, handleAction, page: pagination.page, size: pagination.paginate, })}
          isLoading={isFetching}
          sorting={sort}
          setSorting={setSort}
        />
        <PaginationContainer>
          <PaginationSelectLimit
            size={pagination.paginate}
            onChange={handleChangeLimit}
            perPagesOptions={dataActivities?.list_pagination}
          />
          <PaginationInfo
            size={dataActivities?.item_per_page}
            currentPage={dataActivities?.page}
            total={dataActivities?.total_item}
          />
          <Pagination
            totalPages={dataActivities?.total_page ?? 0}
            currentPage={pagination.page}
            onPageChange={handleChangePage}
          />
        </PaginationContainer>
      </div>
    </Fragment>
  )
}

export default ProgramDetailsActivity
