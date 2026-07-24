import { useState } from 'react'
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
import {
  Pagination,
  PaginationContainer,
  PaginationInfo,
  PaginationSelectLimit,
} from '#components/pagination'
import { usePermission } from '#hooks/usePermission'
import useSmileRouter from '#hooks/useSmileRouter'
import { useTranslation } from 'react-i18next'

import GlobalSettings from '../GlobalSettings'
import { ModalImportPopulation } from './components/ModalImportPopulation'
import { columnsListYearPopulation } from './constants/table'
import useDownloadTemplatePopulation from './hooks/useDownloadTemplatePopulation'
import useGetListPopulation from './hooks/useGetListPopulation'

const ListPopulationPage = () => {
  usePermission('population-global-mutate')

  const { t, i18n } = useTranslation(['common', 'population'])
  const router = useSmileRouter()

  const {
    yearsActive,
    dataListPopulation,
    isFetchingListPopulation,
    filter,
    pagination,
    handleChangePage,
    handleChangePaginate,
  } = useGetListPopulation()

  const [showImport, setShowImport] = useState(false)

  const { handleDownloadTemplate } = useDownloadTemplatePopulation()

  const title = `SMILE | ${t('population:title')}`

  return (
    <GlobalSettings title={t('population:title')}>
      <Container title={t('population:title')}>
        <Meta title={title} />

        <ModalImportPopulation
          yearsActive={yearsActive}
          open={showImport}
          setOpen={setShowImport}
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
              data={dataListPopulation?.data}
              columns={columnsListYearPopulation({
                t,
                size: pagination.paginate,
                page: pagination.page,
                lang: i18n.language,
                setLinkGlobal: router.getAsLinkGlobal,
              })}
              isLoading={isFetchingListPopulation}
              className="ui-overflow-x-auto"
            />
            <PaginationContainer>
              <PaginationSelectLimit
                size={pagination.paginate}
                onChange={(paginate) => handleChangePaginate(paginate)}
                perPagesOptions={dataListPopulation?.list_pagination}
              />
              <PaginationInfo
                size={pagination.paginate}
                currentPage={pagination.page}
                total={dataListPopulation?.total_item}
              />
              <Pagination
                totalPages={dataListPopulation?.total_page ?? 0}
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

export default ListPopulationPage
