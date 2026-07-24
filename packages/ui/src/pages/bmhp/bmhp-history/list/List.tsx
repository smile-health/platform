import React, { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ModalConfirmation } from '#components/modules/ModalConfirmation'
import MasterListPage from '#pages/bmhp/master/list/MasterListPage'
import { useTranslation } from 'react-i18next'

import BmhpHistoryExportButton from './components/BmhpHistoryExportButton'
import useMasterTable from './hooks/useMasterTable'
import { useTableFilter } from './hooks/useTableFilter'
import {
  GetBmhpHistoryTypeListParams,
  listBmhpHistoryType,
} from './master.service'

type BmhpHistoryListPageProps = {
  withLayout?: boolean
}

const BmhpHistoryListPage: React.FC<BmhpHistoryListPageProps> = ({
  withLayout = true,
}) => {
  const { t } = useTranslation(['masterBmhp', 'common'])
  const basePath = `/v5/bmhp-planning/history/`
  const table = useMasterTable({ basePath })
  const filter = useTableFilter()

  useEffect(() => {
    table.pagination.update({ page: 1 })
  }, [JSON.stringify(filter.filter.query)])

  const params: GetBmhpHistoryTypeListParams = {
    page: table.pagination.page,
    paginate: table.pagination.paginate,
    sort_by: table?.querySorting?.querySorting?.sort_by,
    sort_type: table?.querySorting?.querySorting?.sort_type,
    search: filter.filter.getValues('search'),
    year: filter.filter.getValues('year')?.value,
    examination_id: filter.filter.getValues('examination_id')?.value,
    status: filter.filter.getValues('status')?.value,
    province_id: filter.filter.query.province?.value,
    regency_id: filter.filter.query.regency?.value,
    puskesmas_id: filter.filter.query.puskesmas?.value,
  }
  const { data, isLoading } = useQuery({
    queryKey: ['bmhp-history-list', params],
    queryFn: () => listBmhpHistoryType(params),
  })

  return (
    <>
      <MasterListPage
        permission="bmhp-history-view"
        filter={filter.filter}
        exportButton={<BmhpHistoryExportButton />}
        basePath={basePath}
        filterContainerClassName="ui-flex ui-flex-col"
        filterBodyClassName="ui-grid ui-grid-cols-4"
        title={t('masterBmhp:title.bmhp_history')}
        withLayout={withLayout}
        collapsible
        data={{
          item: data?.data || [],
          total_item: data?.total_item || 0,
          total_page: data?.total_page || 0,
        }}
        noAddButton
        isLoading={isLoading}
        masterTable={{
          columns: table.columns,
          pagination: {
            page: table.pagination.page,
            paginate: table.pagination.paginate,
            update: table.pagination.update,
          },
          querySorting: {
            querySorting: {
              sort_by: table.querySorting.querySorting.sort_by,
              sort_type: table.querySorting.querySorting.sort_type,
            },
            setQuerySorting: table.querySorting.setQuerySorting,
          },
          sorting: {
            sorting: table.sorting.sorting,
            setSorting: table.sorting.setSorting,
          },
        }}
      />
      <ModalConfirmation
        isLoading={isLoading}
        open={table.showDelete.isVisible}
        onSubmit={table.onDeleteTrigger}
        setOpen={() => table.setShowDelete({ isVisible: false, id: null })}
        title={t('masterBmhp:label.delete')}
        description={t('masterBmhp:message.delete')}
      />
    </>
  )
}

export default BmhpHistoryListPage
