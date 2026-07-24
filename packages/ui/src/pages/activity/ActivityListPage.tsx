'use client'

import Link from 'next/link'
import { Button } from '#components/button'
import { DataTable } from '#components/data-table'
import {
  FilterFormBody,
  FilterFormRoot,
  FilterResetButton,
  FilterSubmitButton,
} from '#components/filter'
import Export from '#components/icons/Export'
import Plus from '#components/icons/Plus'
import Meta from '#components/layouts/Meta'
import Container from '#components/layouts/PageContainer'
import ModalError from '#components/modules/ModalError'
import { ModalImport } from '#components/modules/ModalImport'
import {
  Pagination,
  PaginationContainer,
  PaginationInfo,
  PaginationSelectLimit,
} from '#components/pagination'
import { usePermission } from '#hooks/usePermission'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'
import useSmileRouter from '#hooks/useSmileRouter'
import { isViewOnly } from '#utils/user'
import { useTranslation } from 'react-i18next'

import { columns } from './activity.constant'
import { useActivityExport } from './hooks/useActivityExport'
import { useActivityImport } from './hooks/useActivityImport'
import { useActivityList } from './hooks/useActivityList'

export default function ActivityListPage(): JSX.Element {
  usePermission('activity-view')
  const { t } = useTranslation(['common', 'activity'])
  const router = useSmileRouter()

  const {
    pagination,
    setPagination,
    handleChangeLimit,
    data,
    isLoading,
    filter,
    sorting,
    setSorting,
  } = useActivityList()

  const {
    showImport,
    setShowImport,
    modalImportErrors,
    setModalImportErrors,
    onImport,
    isPendingImport,
  } = useActivityImport()

  const { exportQuery } = useActivityExport({ keyword: filter?.query?.keyword })

  const isLoadingPopup = isLoading || isPendingImport
  useSetLoadingPopupStore(isLoadingPopup)

  return (
    <Container
      title={t('activity:title.settings')}
      hideTabs={false}
      withLayout={true}
    >
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
      <Meta title={`Smile | ${t('activity:title.activity')}`} />
      <div className="ui-my-6 ui-flex ui-justify-end ui-items-center">
        {!isViewOnly() && (
          <Button
            id={`create-activity`}
            asChild
            className="ui-min-w-40"
            leftIcon={<Plus className="ui-size-5" />}
          >
            <Link href={router.getAsLink('/v5/activity/create')}>
              {t('activity:title.create')}
            </Link>
          </Button>
        )}
      </div>
      <div className="mt-6 space-y-6">
        <FilterFormRoot onSubmit={filter.handleSubmit}>
          <FilterFormBody className="ui-flex ui-items-end ui-gap-4">
            <div className="ui-flex-1">{filter.renderField()}</div>
            <div className="ui-space-x-3 ui-flex ui-mt-5">
              <Button
                id="btn-export"
                variant="subtle"
                type="button"
                onClick={() => exportQuery.refetch()}
                loading={exportQuery.isFetching || exportQuery.isLoading}
                leftIcon={<Export className="ui-size-5" />}
              >
                {t('export')}
              </Button>
              <span className="ui-w-px ui-bg-neutral-300" />
              <div className="ui-flex ui-gap-2">
                <FilterResetButton variant="subtle" onClick={filter.reset} />
              </div>
              <FilterSubmitButton
                onClick={() => setPagination({ page: 1 })}
                className="ui-w-48"
                variant="outline"
              ></FilterSubmitButton>
            </div>
          </FilterFormBody>

          {filter.renderActiveFilter()}
        </FilterFormRoot>
        <DataTable
          data={data?.data}
          isLoading={isLoading}
          columns={columns(t, {
            page: pagination.page,
            size: pagination.paginate,
            setLink: router.getAsLink,
          })}
          sorting={sorting}
          setSorting={setSorting}
        />
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
            totalPages={data?.total_page ?? 1}
            currentPage={pagination.page}
            onPageChange={(page) => setPagination({ page })}
          />
        </PaginationContainer>
      </div>
    </Container>
  )
}
