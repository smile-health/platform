'use client'

import Link from 'next/link'
import { Button } from '#components/button'
import {
  FilterFormBody,
  FilterFormRoot,
  FilterResetButton,
  FilterSubmitButton,
} from '#components/filter'
import Plus from '#components/icons/Plus'
import Meta from '#components/layouts/Meta'
import Container from '#components/layouts/PageContainer'
import {
  Pagination,
  PaginationContainer,
  PaginationInfo,
  PaginationSelectLimit,
} from '#components/pagination'
import useSmileRouter from '#hooks/useSmileRouter'
import { usePermission } from '#hooks/usePermission'
import { isViewOnly } from '#utils/user'
import { useTranslation } from 'react-i18next'

import AnalysisParameterTable from './components/AnalysisParameterTable'
import { useAnalysisParameterList } from './hooks/useAnalysisParameterList'

export default function AnalysisParameterListPage(): JSX.Element {
  usePermission('analysis-parameter-view')
  const { t } = useTranslation(['common', 'analysisParameter'])
  const router = useSmileRouter()

  const {
    pagination,
    setPagination,
    handleChangeLimit,
    data,
    isLoading,
    filter,
  } = useAnalysisParameterList()

  const totalItems = data?.total_item ?? 0
  const totalPages = data?.total_page ?? 1

  return (
    <Container
      title={t('analysisParameter:title.settings')}
      hideTabs={false}
      withLayout={true}
    >
      <Meta title={`Smile | ${t('analysisParameter:title.list')}`} />
      <div className="ui-my-6 ui-flex ui-justify-end ui-items-center">
        {!isViewOnly() && (
          <Button
            id="create-analysis-parameter"
            asChild
            className="ui-min-w-40"
            leftIcon={<Plus className="ui-size-5" />}
          >
            <Link href={router.getAsLink('/v5/analysis-parameter/create')}>
              {t('analysisParameter:title.create')}
            </Link>
          </Button>
        )}
      </div>
      <div className="mt-6 space-y-6">
        <FilterFormRoot onSubmit={filter.handleSubmit}>
          <FilterFormBody className="ui-flex ui-items-end ui-gap-4">
            <div className="ui-grid ui-grid-cols-1 md:ui-grid-cols-3 ui-gap-4 ui-flex-1">
              {filter.renderField()}
            </div>
            <div className="ui-space-x-3 ui-flex ui-mt-5 ui-mb-1">
              <div className="ui-flex ui-gap-2">
                <FilterResetButton
                  variant="subtle"
                  onClick={filter.reset}
                />
              </div>
              <FilterSubmitButton 
                onClick={() => setPagination({ page: 1 })}
                className="ui-w-48" 
                variant="outline" 
              />
            </div>
          </FilterFormBody>
          {filter.renderActiveFilter()}
        </FilterFormRoot>

        <AnalysisParameterTable
          data={data?.data}
          isLoading={isLoading}
          page={pagination.page}
          size={pagination.paginate}
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
            total={totalItems}
          />
          <Pagination
            totalPages={totalPages}
            currentPage={pagination.page}
            onPageChange={(page) => setPagination({ page })}
          />
        </PaginationContainer>
      </div>
    </Container>
  )
}
