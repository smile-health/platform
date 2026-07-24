'use client'

import React, { useMemo } from 'react'
import { useParams } from 'next/navigation'
import { Button } from '#components/button'
import {
  FilterFormBody,
  FilterFormRoot,
  FilterResetButton,
  FilterSubmitButton,
  UseFilter,
  useFilter,
} from '#components/filter'
import Export from '#components/icons/Export'
import Meta from '#components/layouts/Meta'
import { ModalConfirmation } from '#components/modules/ModalConfirmation'
import { ModalImport } from '#components/modules/ModalImport'
import { usePermission } from '#hooks/usePermission'
import useSmileRouter from '#hooks/useSmileRouter'
import ProgramPlanListDetailContainer from '#pages/program-plan/list/components/ProgramPlanListDetailContainer'
import { CommonType } from '#types/common'
import { getProgramStorage } from '#utils/storage/program'
import { parseAsInteger, useQueryStates } from 'nuqs'
import { useTranslation } from 'react-i18next'

import {
  AddRatioButton,
  DownloadTemplateRatioButton,
  ImportRatioButton,
} from './components/AnnualPlanningRatioButton'
import ProgramPlanRatioListTable from './components/ProgramPlanRatioListTable'
import useDeleteMaterialRatio from './hooks/useDeleteMaterialRatio'
import useDownloadMaterialRatio from './hooks/useDownloadMaterialRatio'
import useExportMaterialRatio from './hooks/useExportMaterialRatio'
import useImportMaterialRatio from './hooks/useImportMaterialRatio'
import { useProgramPlanRatioData } from './hooks/useProgramPlanRatioData'
import { programPlanRatioFilterSchema } from './libs/program-plan-ratio-list.filter'
import { useAnnualPlanningEnabled } from '#hooks/useAnnualPlanningEnabled'
import Container from '#components/layouts/PageContainer'

const ProgramPlanRatioListPage: React.FC<CommonType> = ({
  isGlobal = false,
}) => {
  usePermission('program-plan-material-ratio-view')
  const { isDisabledAnnual } = useAnnualPlanningEnabled(isGlobal)
  if (isDisabledAnnual) return <Container title="" withLayout />

  const { t } = useTranslation([
    'common',
    'programPlan',
    'programPlanMaterialRatio',
  ])
  const { showImport, setShowImport, handleImport } = useImportMaterialRatio()
  const { downloadTemplate } = useDownloadMaterialRatio()
  const { handleExport } = useExportMaterialRatio()
  const {
    showDelete,
    setShowDelete,
    handleDeleteMaterialRatio,
    handleDeleteButton,
  } = useDeleteMaterialRatio()

  const programId = getProgramStorage()

  const filterSchema = useMemo<UseFilter>(
    () =>
      programPlanRatioFilterSchema({
        programId: programId.id,
      }),
    [programId]
  )
  const filter = useFilter(filterSchema)

  const [pagination, setPagination] = useQueryStates(
    {
      page: parseAsInteger.withDefault(1),
      paginate: parseAsInteger.withDefault(10),
    },
    { history: 'push' }
  )

  const { rows, pagination: ratioPagination } = useProgramPlanRatioData({
    page: pagination.page,
    paginate: pagination.paginate,
    materialId: filter?.query?.material,
  })

  const params = useParams()
  const programPlanId = params.id
  const router = useSmileRouter()

  return (
    <ProgramPlanListDetailContainer isGlobal={isGlobal}>
      <ModalImport
        open={showImport}
        setOpen={setShowImport}
        onSubmit={handleImport}
        handleClose={() => setShowImport(false)}
        accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
        description={t('programPlanMaterialRatio:import.description')}
      />

      <ModalConfirmation
        type="delete"
        description={t('programPlanMaterialRatio:delete.description')}
        open={showDelete}
        setOpen={setShowDelete}
        onSubmit={handleDeleteMaterialRatio}
      />

      <Meta title={`SMILE | ${t('programPlan:status.material_ratio')}`} />

      <div className="ui-my-6 ui-flex ui-justify-between ui-items-center">
        <h5 className="ui-font-bold ui-text-xl">
          {t('programPlan:status.material_ratio')}
        </h5>
        <AddRatioButton
          href={router.getAsLink(
            `/v5/program-plan/${programPlanId}/ratio/create`
          )}
        />
      </div>

      <div className="ui-space-y-4 ui-mt-6">
        <FilterFormRoot collapsible={false} onSubmit={filter.handleSubmit}>
          <FilterFormBody className="ui-grid-cols-1">
            <div className="ui-flex ui-items-end ui-gap-10">
              <div className="ui-flex-1">{filter.renderField()}</div>
              <div className="ui-flex ui-gap-2">
                <ImportRatioButton onClick={() => setShowImport(true)} />
                <Button
                  variant="subtle"
                  type="button"
                  leftIcon={<Export className="ui-size-5" />}
                  onClick={() => handleExport(filter.query)}
                >
                  {t('common:export')}
                </Button>
                <DownloadTemplateRatioButton
                  onClick={() => downloadTemplate()}
                />
                <div className="ui-w-px ui-h-auto ui-bg-neutral-300" />
                <FilterResetButton onClick={filter.reset} variant="subtle" />
                <FilterSubmitButton
                  className="ui-w-[202px]"
                  variant="outline"
                  onClick={() => setPagination({ page: 1 })}
                />
              </div>
            </div>
          </FilterFormBody>
          {filter.renderActiveFilter()}
        </FilterFormRoot>
      </div>

      <div className="ui-space-y-6 ui-my-5 ui-rounded">
        <ProgramPlanRatioListTable
          data={rows}
          pagination={ratioPagination}
          onChangePage={(page) => setPagination({ page })}
          onChangePaginate={(paginate) => setPagination({ paginate, page: 1 })}
          onClickDelete={handleDeleteButton}
        />
      </div>
    </ProgramPlanListDetailContainer>
  )
}

export default ProgramPlanRatioListPage
