import React, { useContext, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Button } from '#components/button'
import Plus from '#components/icons/Plus'
import { ModalConfirmation } from '#components/modules/ModalConfirmation'
import MasterListPage from '#pages/bmhp/master/list/MasterListPage'
import { useTranslation } from 'react-i18next'

import TargetGroupPlanModal from '../form/TargetGroupPlanModal'
import useMasterTable from './hooks/useMasterTable'
import { useTableFilter } from './hooks/useTableFilter'
import { GetBmhpMaterialListParams, listBmhpMaterial } from './master.service'
import BmhpPlanningDetailContext from '../../bmhp-planning/list/libs/bmhp-planning-list.context'

type BmhpMaterialListPageProps = {
  withLayout?: boolean
  yearId?: number
  program_plan_id?: number
}

const BmhpMaterialListPage: React.FC<BmhpMaterialListPageProps> = ({
  withLayout = true,
  yearId,
  program_plan_id,
}) => {
  const finalProgramPlanId = program_plan_id ?? yearId
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { t } = useTranslation(['masterBmhp', 'common'])
  const { yearData } = useContext(BmhpPlanningDetailContext)
  const isFinal = !!yearData?.is_final
  const basePath = '/v5/bmhp/bmhp-target-groups/'
  const table = useMasterTable({ basePath })
  const filter = useTableFilter()
  const params: GetBmhpMaterialListParams = {
    page: table.pagination.page,
    paginate: table.pagination.paginate,
    sort_by: table?.querySorting?.querySorting?.sort_by,
    sort_type: table?.querySorting?.querySorting?.sort_type,
    program_plan_id: finalProgramPlanId,
    keyword: filter.filter.getValues('keyword'),
  }
  const { data, isLoading } = useQuery({
    queryKey: ['bmhp-material-list', params],
    queryFn: () => listBmhpMaterial(params),
  })

  const customAddButton = finalProgramPlanId && !isFinal ? (
    <Button
      type="button"
      className="ui-min-w-40"
      leftIcon={<Plus className="ui-size-5" />}
      onClick={() => setIsModalOpen(true)}
    >
      {t('common:add')}
    </Button>
  ) : undefined

  return (
    <>
      <MasterListPage
        withLayout={withLayout}
        noAddButton={isFinal}
        customAddButton={customAddButton}
        filter={filter.filter}
        basePath={basePath}
        title={t('title.bmhp_material_target_group')}
        data={{
          item: data?.data || [],
          total_item: data?.total_item || 0,
          total_page: data?.total_page || 0,
        }}
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

      {finalProgramPlanId && (
        <TargetGroupPlanModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          programPlanId={finalProgramPlanId}
        />
      )}
    </>
  )
}

export default BmhpMaterialListPage
