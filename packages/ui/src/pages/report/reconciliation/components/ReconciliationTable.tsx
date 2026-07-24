import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Button } from '#components/button'
import { DataTable } from '#components/data-table'
import Export from '#components/icons/Export'
import {
  Pagination,
  PaginationContainer,
  PaginationInfo,
  PaginationSelectLimit,
} from '#components/pagination'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'
import { Values } from 'nuqs'
import { useTranslation } from 'react-i18next'

import { entityColumns } from '../reconciliation.constant'
import { getMonthNamesInRange, handleFilter } from '../reconciliation.helper'
import {
  getReconciliationEntities,
  getReconciliationEntitiesExport,
} from '../reconciliation.service'

type Props = Readonly<{
  filter: Values<Record<string, any>>
}>

export default function ReconciliationTable({ filter }: Props) {
  const { t } = useTranslation('reconciliationReport')
  const [{ page, paginate }, setPagination] = useState({
    page: 1,
    paginate: 10,
  })

  const params = handleFilter({ page, paginate, ...filter })

  const {
    data: entities,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ['reconciliation-activity-entitiy', params],
    queryFn: () => getReconciliationEntities(params),
    enabled: !!params?.year,
  })

  const exportQuery = useQuery({
    queryKey: ['reconciliation-activity-entitiy-export', params],
    queryFn: () => getReconciliationEntitiesExport(params),
    enabled: false,
  })

  const monthColumns = getMonthNamesInRange(
    params?.start_date,
    params?.end_date
  )

  useSetLoadingPopupStore(exportQuery?.isLoading || exportQuery?.isFetching)

  return (
    <div className="ui-space-y-6">
      <div className="ui-flex ui-justify-end">
        <Button
          data-testid="btn-export"
          variant="outline"
          type="button"
          onClick={() => exportQuery?.refetch()}
          leftIcon={<Export className="ui-size-5" />}
        >
          {t('export')}
        </Button>
      </div>
      <DataTable
        key={monthColumns.length}
        isLoading={isLoading || isFetching}
        data={entities?.data}
        columns={entityColumns(t, monthColumns, page, paginate)}
      />
      <PaginationContainer>
        <PaginationSelectLimit
          size={paginate}
          onChange={(paginate) => setPagination({ page: 1, paginate })}
          perPagesOptions={entities?.list_pagination}
        />
        <PaginationInfo
          size={paginate}
          currentPage={page}
          total={entities?.total_item}
        />
        <Pagination
          totalPages={entities?.total_page ?? 1}
          currentPage={page}
          onPageChange={(page) => setPagination((prev) => ({ ...prev, page }))}
        />
      </PaginationContainer>
    </div>
  )
}
