import React, { useMemo, useState } from 'react'
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
import { generateMetaTitle } from '#utils/strings'
import { parseAsInteger, useQueryStates } from 'nuqs'
import { useTranslation } from 'react-i18next'

import LPLPOFilter from './components/LPLPOFilter'
import useLPLPO from './hooks/useLPLPO'
import useLPLPOExport from './hooks/useLPLPOExport'
import { handleFilter } from './lplpo.helper'
import LPLPOFilterSchema from './schemas/LPLPOFilterSchema'
import LPLPOTableSchema from './schemas/LPLPOTableSchema'

const LPLPOPage = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation('lplpo')

  const { t: tDashboard } = useTranslation('dashboard')

  const [enabled, setEnabled] = useState(false)
  const filterSchema = useMemo<UseFilter>(() => LPLPOFilterSchema(t, tDashboard), [t, tDashboard])

  const filter = useFilter(filterSchema)

  const params = handleFilter(filter?.query)
  const paramsExportAll = handleFilter(filter?.watch(), 'all')

  const [pagination, setPagination] = useQueryStates(
    {
      page: parseAsInteger.withDefault(1),
      paginate: parseAsInteger.withDefault(10),
    },
    {
      history: 'push',
    }
  )

  const { dataSource, isLoading } = useLPLPO({
    params: {
      ...params,
      page: pagination.page,
      paginate: pagination.paginate,
    },
    enabled,
  })

  const handleChangeLimit = (paginate: number) =>
    setPagination({ paginate, page: 1 })

  const { onExport, onExportAll } = useLPLPOExport(params, paramsExportAll)

  return (
    <Container title={t('title')} withLayout>
      <Meta title={generateMetaTitle(t('title'))} />
      <div className="ui-space-y-6">
        <LPLPOFilter
          filter={filter}
          onSubmit={() => {
            setEnabled(true)
            setPagination({ page: 1 })
          }}
          onExport={() => onExport()}
          onExportAll={() => onExportAll()}
        />

        <DataTable
          isLoading={isLoading}
          data={dataSource?.data}
          columns={LPLPOTableSchema(t, language)}
        />
        <PaginationContainer>
          <PaginationSelectLimit
            size={pagination.paginate}
            onChange={handleChangeLimit}
            perPagesOptions={dataSource?.list_pagination}
          />
          <PaginationInfo
            size={pagination.paginate}
            currentPage={pagination.page}
            total={dataSource?.total_item}
          />
          <Pagination
            totalPages={dataSource?.total_page ?? 1}
            currentPage={pagination.page}
            onPageChange={(page) => setPagination({ page })}
          />
        </PaginationContainer>
      </div>
    </Container>
  )
}

export default LPLPOPage
