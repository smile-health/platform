import { Button } from '#components/button'
import { DataTable } from '#components/data-table'
import {
  FilterFormBody,
  FilterFormRoot,
  FilterResetButton,
  FilterSubmitButton,
} from '#components/filter'
import Download from '#components/icons/Download'
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
import { useTranslation } from 'react-i18next'

import GlobalSettings from '../GlobalSettings'
import { columns } from './constants/table'
import useDownloadTemplatePatient from './hooks/useDownloadTemplatePatient'
import useGetListImportPatient from './hooks/useGetListImportPatient'
import useImportPatient from './hooks/useImportPatient'

const PatientBulkListPage = () => {
  usePermission('patient-global-mutate')

  const { t } = useTranslation(['common', 'patient'])
  const {
    dataListImportPatient,
    isFetchingListImportPatient,
    filter,
    pagination,
    handleChangePage,
    handleChangePaginate,
  } = useGetListImportPatient()

  const {
    modalImportErrors,
    showImport,
    setShowImport,
    setModalImportErrors,
    handleImport,
    handleSeeMore,
  } = useImportPatient()

  const { handleDownloadTemplate } = useDownloadTemplatePatient()

  const title = `SMILE | ${t('patient:title')}`

  return (
    <GlobalSettings title={t('patient:title')}>
      <Container title={t('patient:title')}>
        <Meta title={title} />

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
          onSubmit={handleImport}
          handleClose={() => setShowImport(false)}
          accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
        />

        <div className="mt-6">
          <FilterFormRoot collapsible onSubmit={filter.handleSubmit}>
            <FilterFormBody className="ui-flex ui-items-end">
              <div className="ui-w-full">{filter.renderField()}</div>
              <div className="ui-flex ui-gap-2">
                <Button
                  id="btn-import"
                  variant="subtle"
                  type="button"
                  leftIcon={<Import className="ui-size-5" />}
                  onClick={() => setShowImport(true)}
                >
                  {t('common:import')}
                </Button>
                <Button
                  id="btn-download-template"
                  variant="subtle"
                  type="button"
                  leftIcon={<Download className="ui-size-5" />}
                  onClick={() => handleDownloadTemplate()}
                  className="ui-w-[180px]"
                >
                  {t('common:download_template')}
                </Button>
                <span className="ui-h-auto ui-w-px ui-bg-neutral-300" />
                <FilterResetButton variant="subtle" onClick={filter.reset} />
                <FilterSubmitButton
                  className="ui-w-[200px]"
                  variant="outline"
                ></FilterSubmitButton>
              </div>
            </FilterFormBody>
            {filter.renderActiveFilter()}
          </FilterFormRoot>
          <div className="ui-space-y-6 ui-my-5 ui-rounded">
            <DataTable
              data={dataListImportPatient?.data}
              columns={columns(t, handleSeeMore)}
              isLoading={isFetchingListImportPatient}
              className="ui-overflow-x-auto"
            />
            <PaginationContainer>
              <PaginationSelectLimit
                size={pagination.paginate}
                onChange={(paginate) => handleChangePaginate(paginate)}
                perPagesOptions={dataListImportPatient?.list_pagination}
              />
              <PaginationInfo
                size={pagination.paginate}
                currentPage={pagination.page}
                total={dataListImportPatient?.total_item}
              />
              <Pagination
                totalPages={dataListImportPatient?.total_page ?? 0}
                currentPage={pagination.page}
                onPageChange={(page) => handleChangePage(page)}
              />
            </PaginationContainer>
          </div>
        </div>
      </Container>
    </GlobalSettings>
  )
}

export default PatientBulkListPage
