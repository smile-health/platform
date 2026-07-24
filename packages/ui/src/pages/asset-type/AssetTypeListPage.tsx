'use client'

import React from 'react'
import { Button } from '#components/button'
import {
  FilterFormBody,
  FilterFormRoot,
  FilterResetButton,
  FilterSubmitButton,
} from '#components/filter'
import Download from '#components/icons/Download'
import Export from '#components/icons/Export'
import Import from '#components/icons/Import'
import Meta from '#components/layouts/Meta'
import Container from '#components/layouts/PageContainer'
import { ButtonWithDropdown } from '#components/modules/ButtonGroupFilter'
import ModalError from '#components/modules/ModalError'
import { ModalImportV2 } from '#components/modules/ModalImportV2'
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
import { useAssetTypeList } from './hooks/useAssetTypeList'
import useAssetTypeTable from './hooks/useAssetTypeTable'

const AssetTypeListPage: React.FC<CommonType> = ({ isGlobal }) => {
  usePermission(isGlobal ? 'asset-type-global-view' : 'asset-type-view')
  const {
    datasource,
    isLoading,
    exportQuery,
    handleChangeLimit,
    importType,
    dropdownList,
    t,
    filter,
    pagination,
    setPagination,
    setSorting,
    sorting,
    import: {
      setImportType,
      hideModal,
      onImport,
      modalImportErrors,
      setModalImportErrors,
    },
  } = useAssetTypeList({ isGlobal })
  const { schema: tableSchema } = useAssetTypeTable({
    isGlobal,
    page: pagination.page,
    size: pagination.paginate,
  })
  useSetLoadingPopupStore(isLoading)
  return (
    <Container
      title={t('assetType:list.list')}
      hideTabs={isGlobal}
      withLayout={!isGlobal}
    >
      <Meta
        title={`Smile | ${isGlobal ? 'Global' : ''} ${t('assetType:list.title')}`}
      />
      <div className="ui-mt-6 ui-space-y-6">
        <FilterFormRoot onSubmit={filter.handleSubmit}>
          <ModalImportV2
            open={Boolean(importType)}
            onSubmit={onImport}
            handleClose={hideModal}
            popupImportData={importType}
            setOpen={setImportType}
          />
          <ModalError
            errors={modalImportErrors.errors}
            open={modalImportErrors.open}
            handleClose={() =>
              setModalImportErrors({ open: false, errors: undefined })
            }
          />
          <FilterFormBody className="ui-flex ui-items-end">
            <div className="ui-grow ui-grid ui-grid-cols-1 ui-items-end ui-gap-4">
              {filter.renderField()}
            </div>
            <div className="ui-flex ui-gap-5">
              {isGlobal && (
                <ButtonWithDropdown
                  id="btn-import"
                  variant="subtle"
                  leftIcon={<Import className="ui-size-5" />}
                  label={t('common:import')}
                  dropdownList={dropdownList}
                />
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
                <ButtonWithDropdown
                  id="btn-download-template"
                  variant="subtle"
                  label={t('common:download_template')}
                  dropdownList={dropdownList}
                  leftIcon={<Download className="ui-size-5" />}
                  isDownloadTemplate
                />
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

export default AssetTypeListPage
