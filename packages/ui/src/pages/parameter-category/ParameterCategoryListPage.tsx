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
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'
import useSmileRouter from '#hooks/useSmileRouter'
import { usePermission } from '#hooks/usePermission'
import { isViewOnly } from '#utils/user'
import { useTranslation } from 'react-i18next'

import ParameterCategoryTable from './components/ParameterCategoryTable'
import { useParameterCategoryList } from './hooks/useParameterCategoryList'

export default function ParameterCategoryListPage(): JSX.Element {
  usePermission('parameter-category-view')
  const { t } = useTranslation(['common', 'parameterCategory'])
  const router = useSmileRouter()

  const {
    pagination,
    setPagination,
    handleChangeLimit,
    data,
    isLoading,
    filter,
  } = useParameterCategoryList()

  useSetLoadingPopupStore(isLoading)

  return (
    <Container
      title={t('parameterCategory:title.settings')}
      hideTabs={false}
      withLayout={true}
    >
      <Meta title={`Smile | ${t('parameterCategory:title.list')}`} />
      <div className="ui-my-6 ui-flex ui-justify-end ui-items-center">
        {!isViewOnly() && (
          <Button
            id={`create-parameter-category`}
            asChild
            className="ui-min-w-40"
            leftIcon={<Plus className="ui-size-5" />}
          >
            <Link href={router.getAsLink('/v5/parameter-category/create')}>
              {t('parameterCategory:title.create')}
            </Link>
          </Button>
        )}
      </div>
      <div className="mt-6 space-y-6">
        <FilterFormRoot onSubmit={filter.handleSubmit}>
          <FilterFormBody className="ui-flex ui-items-end ui-gap-4">
            <div className="ui-flex-1">{filter.renderField()}</div>
            <div className="ui-space-x-3 ui-flex ui-mt-5">
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
        <ParameterCategoryTable
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
