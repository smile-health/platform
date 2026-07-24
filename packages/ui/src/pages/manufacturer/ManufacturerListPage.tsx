'use client'

import { useMemo } from 'react'
import { DataTable } from '#components/data-table'
import { UseFilter, useFilter } from '#components/filter'
import Meta from '#components/layouts/Meta'
import Container from '#components/layouts/PageContainer'
import {
  Pagination,
  PaginationContainer,
  PaginationInfo,
  PaginationSelectLimit,
} from '#components/pagination'
import { usePermission } from '#hooks/usePermission'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'
import { CommonType } from '#types/common'
import { getReactSelectValue } from '#utils/react-select'
import { generateMetaTitle } from '#utils/strings'
import { useTranslation } from 'react-i18next'

import ManufacturerFilter from './components/ManufacturerFilter'
import useManufacturerTable from './hooks/useManufacturerTable'
import manufacturerFilterFormSchema from './schemas/manufacturerFilterFormSchema'

export type FormFilterManufacturerType = {
  keyword: string
  type: string
}

export default function ManufacturerListPage({
  isGlobal,
}: Readonly<CommonType>) {
  const {
    t,
    i18n: { language },
  } = useTranslation(['common', 'manufacturer'])
  usePermission(isGlobal ? 'manufacturer-global-view' : 'manufacturer-view')

  const filterSchema = useMemo<UseFilter>(
    () => manufacturerFilterFormSchema(t, isGlobal),
    [t, language]
  )

  const filter = useFilter(filterSchema)

  const {
    tableColumns,
    dataSource,
    isLoading,
    page,
    paginate,
    handleChangePage,
    handleChangePaginate,
    sorting,
    setSorting,
  } = useManufacturerTable({
    isGlobal,
    filter: {
      keyword: filter?.query?.keyword,
      type: getReactSelectValue(filter?.query?.type),
      program_ids: getReactSelectValue(filter?.query?.program_ids),
    },
  })

  useSetLoadingPopupStore(isLoading)

  const titlePage = generateMetaTitle(
    t('manufacturer:title.manufacturer'),
    isGlobal
  )

  return (
    <Container
      title={t('manufacturer:title.manufacturer')}
      hideTabs
      withLayout={!isGlobal}
    >
      <Meta title={titlePage} />
      <div className="mt-6 space-y-4">
        <ManufacturerFilter
          page={page}
          paginate={paginate}
          handleChangePage={handleChangePage}
          filter={filter}
          isGlobal={isGlobal}
        />
        <DataTable
          data={dataSource?.data}
          columns={tableColumns}
          isLoading={isLoading}
          sorting={sorting}
          setSorting={setSorting}
        />
        <PaginationContainer>
          <PaginationSelectLimit
            size={paginate}
            onChange={handleChangePaginate}
            perPagesOptions={dataSource?.list_pagination}
          />
          <PaginationInfo
            size={paginate}
            currentPage={page}
            total={dataSource?.total_item}
          />
          <Pagination
            totalPages={dataSource?.total_page ?? 1}
            currentPage={page}
            onPageChange={handleChangePage}
          />
        </PaginationContainer>
      </div>
    </Container>
  )
}
