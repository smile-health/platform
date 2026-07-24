'use client'

import React, { useMemo } from 'react'
import { Button } from '#components/button'
import {
  FilterFormBody,
  FilterFormFooter,
  FilterFormRoot,
  FilterResetButton,
  FilterSubmitButton,
} from '#components/filter'
import Download from '#components/icons/Download'
import Export from '#components/icons/Export'
import Import from '#components/icons/Import'
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
import { CommonType } from '#types/common'

import { DataTable } from '../../components/data-table/DataTable'
import { useAssetVendorList } from './hooks/useAssetVendorList'
import useAssetVendorTable from './hooks/useAssetVendorTable'

const AssetVendorListPage: React.FC<CommonType> = ({ isGlobal }) => {
  usePermission(isGlobal ? 'asset-vendor-global-view' : 'asset-vendor-view')
  const {
    datasource,
    isLoading,
    exportQuery,
    downloadQuery,
    handleChangeLimit,
    t,
    filter,
    pagination,
    setPagination,
    setSorting,
    sorting,
    import: { modalImport, showModal, hideModal, onImport, importMutation },
  } = useAssetVendorList({ isGlobal })
  const { schema: tableSchema } = useAssetVendorTable({
    isGlobal,
    page: pagination.page,
    size: pagination.paginate,
  })
  useSetLoadingPopupStore(isLoading)

  const buttonList = useMemo(() => {
    return (
      <div className="ui-flex ui-gap-5 ui-ml-auto">
        {isGlobal && (
          <Button
            id="btn-import"
            variant="subtle"
            type="button"
            onClick={() => showModal('import')}
            loading={importMutation.isPending}
            leftIcon={<Import className="ui-size-5" />}
          >
            {t('common:import')}
          </Button>
        )}
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
        {isGlobal && (
          <Button
            data-testid="btn-download-template"
            variant="subtle"
            type="button"
            onClick={() => downloadQuery.refetch()}
            loading={downloadQuery.isFetching || downloadQuery.isLoading}
            leftIcon={<Download className="ui-size-5" />}
          >
            {t('common:download_template')}
          </Button>
        )}
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
    )
  }, [isGlobal])

  return (
    <Container
      title={t('assetVendor:list.list')}
      hideTabs={isGlobal}
      withLayout={!isGlobal}
    >
      <Meta
        title={`Smile | ${isGlobal ? 'Global' : ''} ${t('assetVendor:list.title')}`}
      />
      <div className="ui-mt-6 ui-space-y-6">
        <FilterFormRoot onSubmit={filter.handleSubmit}>
          <ModalImport
            open={modalImport?.type === 'import'}
            onSubmit={onImport}
            handleClose={hideModal}
          />
          <ModalError
            errors={modalImport?.errors}
            open={modalImport?.type === 'error'}
            handleClose={hideModal}
          />
          <FilterFormBody className="ui-flex ui-items-end">
            <div className="ui-grow ui-grid ui-grid-cols-2 ui-gap-5">
              {filter.renderField()}
            </div>
            {buttonList}
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

export default AssetVendorListPage
