'use client'

import React, { useMemo, useState } from 'react'
import { Button } from '#components/button'
import {
  FilterFormBody,
  FilterFormRoot,
  FilterResetButton,
  FilterSubmitButton,
  UseFilter,
  useFilter,
} from '#components/filter'
import Download from '#components/icons/Download'
import Export from '#components/icons/Export'
import Import from '#components/icons/Import'
import Meta from '#components/layouts/Meta'
import ModalError from '#components/modules/ModalError'
import { ModalImport } from '#components/modules/ModalImport'
import { usePermission } from '#hooks/usePermission'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'
import ProgramPlanListDetailContainer from '#pages/program-plan/list/components/ProgramPlanListDetailContainer'
import { hasPermission } from '#shared/permission/index'
import { CommonType } from '#types/common'
import { parseAsInteger, useQueryStates } from 'nuqs'
import { useTranslation } from 'react-i18next'

import AnnualPlanningTargetGroupAddButton from './components/AnnualPlanningTargetGroupAddButton'
import AnnualPlanningTargetGroupListTable from './components/AnnualPlanningTargetGroupListTable'
import { useAnnualPlanningTargetGroupListData } from './hooks/useAnnualPlanningTargetGroupListData'
import { useAnnualPlanningTargetGroupListDownloadTemplate } from './hooks/useAnnualPlanningTargetGroupListDownloadTemplate'
import { useAnnualPlanningTargetGroupListExport } from './hooks/useAnnualPlanningTargetGroupListExport'
import { useAnnualPlanningTargetGroupListImport } from './hooks/useAnnualPlanningTargetGroupListImport'
import AnnualPlanningTargetGroupListContext from './libs/annual-planning-target-group-list.context'
import { annualPlanningTargetGroupFilterSchema } from './libs/annual-planning-target-group-list.filter'
import { TAnnualPlanningTargetGroupData } from './libs/annual-planning-target-group-list.type'
import { useAnnualPlanningEnabled } from '#hooks/useAnnualPlanningEnabled'
import Container from '#components/layouts/PageContainer'

const AnnualPlanningTargetGroupListPage: React.FC<CommonType> = ({
  isGlobal = false,
}) => {
  usePermission('annual-planning-target-group-view')
  const { isDisabledAnnual } = useAnnualPlanningEnabled(isGlobal)
  if (isDisabledAnnual) return <Container title="" withLayout />
  const { t } = useTranslation(['common', 'annualPlanningTargetGroup'])

  const [pagination, setPagination] = useQueryStates(
    {
      page: parseAsInteger.withDefault(1),
      paginate: parseAsInteger.withDefault(10),
    },
    {
      history: 'push',
    }
  )
  const [openCreateModal, setOpenCreateModal] = useState(false)
  const [openCreateProgramModal, setOpenCreateProgramModal] = useState(false)
  const [openedRow, setOpenedRow] =
    useState<TAnnualPlanningTargetGroupData | null>(null)

  const hasGlobalMutatePermission = hasPermission(
    'annual-planning-target-group-global-mutate'
  )

  const filterSchema = useMemo<UseFilter>(
    () =>
      annualPlanningTargetGroupFilterSchema({
        t,
      }),
    [t]
  )
  const filter = useFilter(filterSchema)

  const contextValueList = useMemo(
    () => ({
      page: pagination.page,
      setPagination,
      openCreateModal,
      setOpenCreateModal,
      openCreateProgramModal,
      setOpenCreateProgramModal,
      openedRow,
      setOpenedRow,
      isGlobal,
    }),
    [
      setPagination,
      openCreateModal,
      setOpenCreateModal,
      openCreateProgramModal,
      setOpenCreateProgramModal,
      pagination.page,
      openedRow,
      setOpenedRow,
      isGlobal,
    ]
  )

  const {
    listAnnualPlanningTargetGroupData,
    isLoadingListAnnualPlanningTargetGroup,
    isFetchingListAnnualPlanningTargetGroup,
  } = useAnnualPlanningTargetGroupListData({
    filter,
    pagination,
    isGlobal,
  })

  const { exportQuery } = useAnnualPlanningTargetGroupListExport({
    filter,
    isGlobal,
  })

  const { downloadTemplateQuery } =
    useAnnualPlanningTargetGroupListDownloadTemplate()

  const {
    mutateImport,
    setShowImportModal,
    showImportModal,
    listOfImportErrors,
    setListOfImportErrors,
  } = useAnnualPlanningTargetGroupListImport()

  const handleAddGlobal = () => {
    setOpenCreateModal?.(true)
    setOpenCreateProgramModal(false)
  }

  const handleAddProgram = () => {
    setOpenCreateProgramModal(true)
    setOpenCreateModal?.(false)
  }

  const handleAdd = isGlobal ? handleAddGlobal : handleAddProgram

  useSetLoadingPopupStore(
    isFetchingListAnnualPlanningTargetGroup ||
    isLoadingListAnnualPlanningTargetGroup
  )

  return (
    <ProgramPlanListDetailContainer isGlobal={isGlobal}>
      <Meta title={`SMILE | ${t('annualPlanningTargetGroup:target_group')}`} />
      <AnnualPlanningTargetGroupListContext.Provider value={contextValueList}>
        {hasGlobalMutatePermission && isGlobal && (
          <>
            <ModalError
              errors={listOfImportErrors}
              open={!!listOfImportErrors}
              handleClose={() => {
                setListOfImportErrors(null)
              }}
            />
            <ModalImport
              open={showImportModal}
              setOpen={setShowImportModal}
              onSubmit={mutateImport}
              handleClose={() => setShowImportModal(false)}
              accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
              description={t('common:import')}
            />
          </>
        )}

        <div className="ui-my-6 ui-flex ui-justify-between ui-items-center">
          <h5 className="ui-font-bold ui-text-xl">
            {t('annualPlanningTargetGroup:title')}
          </h5>
          <AnnualPlanningTargetGroupAddButton handleAdd={handleAdd} />
        </div>
        {isGlobal && (
          <div className="ui-space-y-4 ui-mt-6">
            <FilterFormRoot collapsible={false} onSubmit={filter.handleSubmit}>
              <FilterFormBody className="ui-grid-cols-1">
                <div className="ui-flex ui-items-end ui-gap-3">
                  <div className="ui-flex-1">{filter.renderField()}</div>
                  <div className="ui-flex ui-gap-2">
                    {hasGlobalMutatePermission && (
                      <Button
                        id="annual_planning_target_group_import"
                        variant="subtle"
                        type="button"
                        onClick={() => setShowImportModal(true)}
                        leftIcon={<Import className="ui-size-5" />}
                      >
                        {t('common:import')}
                      </Button>
                    )}
                    <Button
                      id="annual_planning_target_group_export"
                      variant="subtle"
                      type="button"
                      onClick={() => exportQuery.refetch()}
                      leftIcon={<Export className="ui-size-5" />}
                    >
                      {t('common:export')}
                    </Button>
                    {hasGlobalMutatePermission && (
                      <Button
                        data-testid="annual_planning_target_group_download_template"
                        id="annual_planning_target_group_download_template"
                        className="ui-shrink-0"
                        variant="subtle"
                        type="button"
                        onClick={() => downloadTemplateQuery.refetch()}
                        leftIcon={<Download className="ui-size-5" />}
                      >
                        {t('common:download_template')}
                      </Button>
                    )}
                    <div className="ui-w-px ui-h-auto ui-bg-neutral-300" />
                    <FilterResetButton
                      onClick={filter.reset}
                      variant="subtle"
                    />
                    <FilterSubmitButton
                      className="ui-w-full"
                      variant="outline"
                      onClick={() => setPagination({ page: 1 })}
                    />
                  </div>
                </div>
              </FilterFormBody>
              {filter.renderActiveFilter()}
            </FilterFormRoot>
          </div>
        )}

        <div className="ui-space-y-6 ui-my-5 ui-rounded">
          <AnnualPlanningTargetGroupListTable
            data={listAnnualPlanningTargetGroupData}
          />
        </div>
      </AnnualPlanningTargetGroupListContext.Provider>
    </ProgramPlanListDetailContainer>
  )
}

export default AnnualPlanningTargetGroupListPage
