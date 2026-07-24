import React, { useMemo } from 'react'
import { DataTable } from '#components/data-table'
import { useFilter, UseFilter } from '#components/filter'
import Meta from '#components/layouts/Meta'
import Container from '#components/layouts/PageContainer'
import {
  Pagination,
  PaginationContainer,
  PaginationInfo,
  PaginationSelectLimit,
} from '#components/pagination'
import { generateMetaTitle } from '#utils/strings'
import { useTranslation } from 'react-i18next'

import SelfDisposalFilter from './components/SelfDisposalFilter'
import SelfDisposalListDetail from './components/SelfDisposalListDetail'
import SelfDisposalTab from './components/SelfDisposalTab'
import { useSelfDisposalList } from './hooks/useSelfDisposalList'
import selfDisposalFilterSchema from './schema/SelfDisposalFilterSchema'
import { usePermission } from '#hooks/usePermission'
import { hasPermission } from '#shared/permission/index'
import Link from 'next/link'
import useSmileRouter from '#hooks/useSmileRouter'
import { Button } from '#components/button'
import Plus from '#components/icons/Plus'
import { getProgramStorage } from '#utils/storage/program'

const SelfDisposalListPage = () => {
  usePermission('self-disposal-view')
  const { t } = useTranslation('selfDisposal')
  const router = useSmileRouter()
  const isHierarchical = getProgramStorage()?.config?.material?.is_hierarchy_enabled
  const filterSchema = useMemo<UseFilter>(
    () => selfDisposalFilterSchema({ t, isHierarchical }),
    [t]
  )

  const filter = useFilter(filterSchema)
  const {
    page,
    paginate,
    handleChangePage,
    data,
    tableColumns,
    handleChangePaginate,
    detail,
    showDetail,
    setShowDetail,
  } = useSelfDisposalList(filter?.query)

  return (
    <Container title={t('title')} withLayout>
      <Meta title={generateMetaTitle(t('title'))} />
      <SelfDisposalListDetail
        open={showDetail}
        data={detail}
        onClose={() => {
          setShowDetail(false)
        }}
      ></SelfDisposalListDetail>
      <div className="ui-space-y-6">
        <div className="ui-my-6 ui-flex ui-justify-between ui-items-center">
          <h5 className="ui-font-bold ui-text-xl">
            {t('tab.list')}
          </h5>
          {hasPermission('self-disposal-mutate') && (
            <Link
              href={router.getAsLink(`/v5/self-disposal/create`)}
              className="ui-block"
              id="create-self-disposal-link"
              data-testid="create-self-disposal-link"
            >
              <Button
                id="create-self-disposal"
                data-testid="create-self-disposal"
                type="button"
                className="ui-min-w-40"
                leftIcon={<Plus className="ui-size-5" />}
              >
                {t('tab.create')}
              </Button>
            </Link>
          )}
        </div>
        <SelfDisposalFilter
          page={page}
          filter={filter}
          paginate={paginate}
          handleChangePage={handleChangePage}
        />
        <DataTable data={data?.data} columns={tableColumns} />
        <PaginationContainer>
          <PaginationSelectLimit
            size={paginate}
            onChange={handleChangePaginate}
          />
          <PaginationInfo
            size={paginate}
            currentPage={page}
            total={data?.total_item}
          />
          <Pagination
            totalPages={data?.total_page || 1}
            currentPage={page}
            onPageChange={handleChangePage}
          />
        </PaginationContainer>
      </div>
    </Container>
  )
}

export default SelfDisposalListPage
