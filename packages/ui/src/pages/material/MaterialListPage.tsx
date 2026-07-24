'use client'

import React, { useState } from 'react'
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
import { ButtonWithDropdown } from '#components/modules/ButtonGroupFilter'
import ModalError from '#components/modules/ModalError'
import { ModalImport, PopupImportType } from '#components/modules/ModalImport'
import {
  Pagination,
  PaginationContainer,
  PaginationInfo,
  PaginationSelectLimit,
} from '#components/pagination'
import { usePermission } from '#hooks/usePermission'
import { hasPermission } from '#shared/permission/index'
import { CommonType } from '#types/common'
import { useTranslation } from 'react-i18next'

import MaterialTable from './components/MaterialTable'
import { useMaterialTable } from './hooks/useMaterialTable'

const MaterialPageList: React.FC<CommonType> = ({ isGlobal = false }) => {
  usePermission(isGlobal ? 'manufacturer-global-view' : 'material-view')
  const isList = true
  const { t } = useTranslation(['common', 'material'])
  const [showImport, setShowImport] = useState(false)
  const [showImportType, setShowImportType] =
    useState<PopupImportType>(undefined)
  const {
    filter,
    program,
    handleChangePage,
    handleChangePaginate,
    setPagination,
    pagination,
    exportQuery,
    downloadQuery,
    handleImport,
    setLevelId,
    programDataSource,
    isLoading,
    globalDataSource,
    modalImportErrors,
    setModalImportErrors,
  } = useMaterialTable({ isGlobal, isList })

  const datasource = isGlobal ? globalDataSource : programDataSource

  const dropdownList = [
    {
      id: 'btn-import-active-substance-strength',
      label: t('material:button.material_active_substance_and_strength'),
      type: ['import', 'download'],
      onClick: () => {
        setShowImport(true)
        setShowImportType('material_active_substance_and_strength')
      },
      onDownloadTemplate: async () => {
        setLevelId(2)
        setTimeout(() => {
          downloadQuery.refetch()
        }, 100)
      },
    },
    {
      id: 'btn-import-trademark',
      label: t('material:button.trademark'),
      type: ['import', 'download'],
      onClick: () => {
        setShowImport(true)
        setShowImportType('trademark')
      },
      onDownloadTemplate: async () => {
        setLevelId(3)
        setTimeout(() => {
          downloadQuery.refetch()
        }, 100)
      },
    },
  ]

  return (
    <Container
      title={t('material:list.title')}
      hideTabs={isGlobal}
      withLayout={!isGlobal}
    >
      <Meta title={`Smile | ${isGlobal ? 'Global' : ''} Material`} />

      <ModalImport
        isGlobal={isGlobal}
        open={showImport}
        popupImportType={showImportType}
        setOpen={setShowImport}
        onSubmit={handleImport}
        handleClose={() => setShowImport(false)}
      />

      <ModalError
        errors={modalImportErrors.errors}
        open={modalImportErrors.open}
        handleClose={() =>
          setModalImportErrors({ open: false, errors: undefined })
        }
      />
      <div className="mt-6">
        <FilterFormRoot onSubmit={filter.handleSubmit}>
          <FilterFormBody className="ui-grid-cols-4">
            {filter.renderField()}
          </FilterFormBody>
          <FilterFormFooter>
            <div className="ui-flex ui-gap-2" />
            <div className="ui-space-x-3 flex">
              {hasPermission('material-mutate') && (
                <>
                  {isGlobal ? (
                    <ButtonWithDropdown
                      id="btn-import"
                      variant="subtle"
                      leftIcon={<Import className="ui-size-5" />}
                      label={t('common:import')}
                      dropdownList={dropdownList}
                    />
                  ) : (
                    <Button
                      id="btn-import"
                      variant="subtle"
                      type="button"
                      leftIcon={<Import className="ui-size-5" />}
                      onClick={() => {
                        setShowImport(true)
                        setShowImportType(
                          !program?.config?.material?.is_hierarchy_enabled ||
                            Number(filter.getValues('material_level_id')) === 3
                            ? 'trademark'
                            : 'material_active_substance_and_strength'
                        )
                      }}
                    >
                      {t('common:import')}
                    </Button>
                  )}
                </>
              )}
              <Button
                id="btn-export"
                variant="subtle"
                type="button"
                leftIcon={<Export className="ui-size-5" />}
                onClick={() => exportQuery.refetch()}
              >
                {t('common:export')}
              </Button>
              {hasPermission('material-mutate') && (
                <>
                  {isGlobal ? (
                    <ButtonWithDropdown
                      id="btn-download-template"
                      variant="subtle"
                      leftIcon={<Download className="ui-size-5" />}
                      label={t('common:download_template')}
                      dropdownList={dropdownList}
                      isDownloadTemplate
                    />
                  ) : (
                    <Button
                      id="btn-export"
                      variant="subtle"
                      type="button"
                      leftIcon={<Download className="ui-size-5" />}
                      onClick={() => {
                        setLevelId(filter.getValues('material_level_id'))
                        setTimeout(() => {
                          downloadQuery.refetch()
                        }, 100)
                      }}
                    >
                      {t('common:download_template')}
                    </Button>
                  )}
                </>
              )}
              <span className="ui-h-full ui-w-px ui-bg-neutral-300" />
              <FilterResetButton variant="subtle" onClick={filter.reset} />
              <FilterSubmitButton
                onClick={() => setPagination({ page: 1 })}
                variant="outline"
                className="ui-w-[220px]"
              ></FilterSubmitButton>
            </div>
          </FilterFormFooter>
          {filter.renderActiveFilter()}
        </FilterFormRoot>
        <div className="ui-space-y-6 ui-my-5 ui-rounded">
          <MaterialTable
            isLoading={isLoading}
            isGlobal={isGlobal}
            size={datasource?.item_per_page}
            page={datasource?.page}
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
              totalPages={datasource?.total_page ?? 0}
              currentPage={pagination.page}
              onPageChange={(page) => handleChangePage(page)}
            />
          </PaginationContainer>
        </div>
      </div>
    </Container>
  )
}

export default MaterialPageList
