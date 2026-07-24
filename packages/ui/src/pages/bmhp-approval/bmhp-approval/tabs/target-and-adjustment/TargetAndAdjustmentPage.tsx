'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { ModalConfirmation } from '#components/modules/ModalConfirmation'
import ModalError from '#components/modules/ModalError'
import { ModalImport } from '#components/modules/ModalImport'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'
import useSmileRouter from '#hooks/useSmileRouter'
import { useTranslation } from 'react-i18next'

import BmhpApprovalTabs from '../BmhpApprovalTabs'
import AddTargetDrawer from './components/AddTargetDrawer'
import PreviewDrawer from './components/PreviewDrawer'
import TargetAdjustmentTable from './components/TargetAdjustmentTable'
import { useDownloadTemplateTargetAdjustment } from './hooks/useDownloadTemplateTargetAdjustment'
import { useImportTargetAdjustment } from './hooks/useImportTargetAdjustment'
import { useTargetAdjustmentData } from './hooks/useTargetAdjustmentData'
import {
  usePatchVerificationStatus,
  useReviewProgramPlan,
  useUpdateVerificationStatus,
} from './hooks/useTargetAdjustmentMutations'
import {
  BmhpEntityData,
  TargetAdjustmentParams,
} from './libs/target-adjustment.type'

// ─── Page ─────────────────────────────────────────────────────────────────────

const toggleEntityTargetStatus = (
  entity: BmhpEntityData,
  entityId: number,
  targetGroupId: number,
  examinationId: number,
  status: boolean
): BmhpEntityData => {
  if (entity.entity_name.id !== entityId) return entity

  return {
    ...entity,
    target: entity.target.map((t) =>
      t.target_id === targetGroupId && t.examination_id === examinationId
        ? { ...t, status: t.id ? status : false }
        : t
    ),
  }
}

const updateAllTargetsStatus = (
  entity: BmhpEntityData,
  status: boolean
): BmhpEntityData => {
  return {
    ...entity,
    target: entity.target.map((t) => ({
      ...t,
      // Skip verif=0 rows — BE bulk action intentionally skips them (hotfix B4DR-657)
      status: t.id && t.verification_status !== 0 ? status : t.status,
    })),
  }
}

const TargetAndAdjustmentPageContent: React.FC = () => {
  const { t } = useTranslation(['bmhpApproval'])
  const { push, query } = useSmileRouter()
  const programPlanId = query.year_id ? Number(query.year_id) : 0

  // const regencyId = Number.parseInt(profile?.entity?.regency?.id as string) || 0

  const params = useMemo<TargetAdjustmentParams>(
    () => ({
      program_plan_id: programPlanId,
      ...(query.regency_id ? { regency_id: Number(query.regency_id) } : {}),
      // regency_id: regencyId,
    }),
    [programPlanId, query.regency_id]
  )

  const isReady = !!programPlanId

  const { data, isLoading, isFetching, refetch } = useTargetAdjustmentData({
    params,
    // enabled: true,
    enabled: isReady,
  })

  const { updateStatus, isUpdatingStatus } = useUpdateVerificationStatus()
  const { patchStatus, isPatchingStatus } = usePatchVerificationStatus()

  const { downloadTemplateQuery } =
    useDownloadTemplateTargetAdjustment(programPlanId)
  const {
    showImportModal,
    setShowImportModal,
    mutateImport,
    listOfImportErrors,
    setListOfImportErrors,
  } = useImportTargetAdjustment(programPlanId)

  useSetLoadingPopupStore(
    isLoading || isFetching || isUpdatingStatus || isPatchingStatus
  )
  const [localData, setLocalData] = useState<BmhpEntityData[]>([])

  useEffect(() => {
    if (data?.data) {
      const cloned = structuredClone(data.data)
      // Set initial status derived from verification_status, keeping false if id is null
      const initialized = cloned.map((entity) => ({
        ...entity,
        target: entity.target.map((t) => {
          // 0 = Pending (green/true), 1 = Approved (green/true), 2 = Rejected (red/false)
          // id=null means no data yet (Pending) → still show green
          const resolvedStatus =
            t.status !== undefined ? t.status : t.verification_status !== 2
          return { ...t, status: resolvedStatus }
        }),
      }))
      setLocalData(initialized)
    }
  }, [data])

  const targetGroups = data?.target_group ?? []

  // ── Drawer / modal state ───────────────────────────────────────────────────
  const [addTargetEntityId, setAddTargetEntityId] = useState<number | null>(
    null
  )
  const [previewOpen, setPreviewOpen] = useState(false)
  const [sendRevisionConfirmOpen, setSendRevisionConfirmOpen] = useState(false)

  // ── Toggle per-cell status ─────────────────────────────────────────────────
  const handleToggleStatus = useCallback(
    (
      entityId: number,
      targetGroupId: number,
      examinationId: number,
      status: boolean
    ) => {
      setLocalData((prev) => {
        const nextData = prev.map((entity) =>
          toggleEntityTargetStatus(
            entity,
            entityId,
            targetGroupId,
            examinationId,
            status
          )
        )
        return nextData
      })

      patchStatus({
        program_plan_id: programPlanId,
        target_group_id: targetGroupId,
        material_id: examinationId,
        entity_id: entityId,
        status: status ? 1 : 2,
      })
    },
    [patchStatus, programPlanId]
  )

  // ── Batch approve / revise ─────────────────────────────────────────────────
  const applyApproveAllLocally = useCallback(() => {
    setLocalData((prev) =>
      prev.map((entity) => updateAllTargetsStatus(entity, true))
    )
  }, [])

  const applyReviseAllLocally = useCallback(() => {
    setLocalData((prev) =>
      prev.map((entity) => updateAllTargetsStatus(entity, false))
    )
  }, [])

  const handleApproveAll = useCallback(() => {
    updateStatus(
      { program_plan_id: programPlanId, status: 1 },
      { onSuccess: applyApproveAllLocally }
    )
  }, [programPlanId, updateStatus, applyApproveAllLocally])

  const handleReviseAll = useCallback(() => {
    updateStatus(
      { program_plan_id: programPlanId, status: 0 },
      { onSuccess: applyReviseAllLocally }
    )
  }, [programPlanId, updateStatus, applyReviseAllLocally])

  // ── Check if any item has status = false (rejected) ───────────────────────
  // Only consider items where is_not_screening is false and verification_status is 0 (pending)
  const hasRejected = useMemo(
    () =>
      localData.some((entity) =>
        entity.target.some(
          (t) =>
            t.status === false &&
            (t.is_not_screening === false || t.is_not_screening === undefined)
        )
      ),
    [localData]
  )

  // ── Check if Send Revision button should be enabled ───────────────────────
  // Enable when at least one item has verification_status=0 or 2 AND is_not_screening=false
  const canSendRevision = useMemo(
    () => localData.some((entity) =>
      entity.target.some(
        (t) =>
          t.verification_status === 2
      )
    ),
    [localData]
  )

  // ── Build PATCH payload ────────────────────────────────────────────────────

  const { sendRevision, isSending } = useReviewProgramPlan()

  const handleConfirmSendRevision = useCallback(() => {
    sendRevision(
      { program_plan_id: programPlanId },
      {
        onSuccess: () => {
          setSendRevisionConfirmOpen(false)
          push('/v5/bmhp-approval')
        },
      }
    )
  }, [sendRevision, programPlanId, push])

  return (
    <BmhpApprovalTabs>
      <div className="ui-space-y-6 ui-mt-6">
        {isReady && (
          <>
            {/* Main table */}
            <TargetAdjustmentTable
              data={localData}
              targetGroups={targetGroups}
              onAddTarget={(entity) => {
                setAddTargetEntityId(entity.entity_name.id)
              }}
              onToggleStatus={handleToggleStatus}
              onApproveAll={handleApproveAll}
              onReviseAll={handleReviseAll}
              onSendRevision={() => setSendRevisionConfirmOpen(true)}
              onPreview={() => setPreviewOpen(true)}
              onSeeCalculation={() =>
                push(
                  `/v5/bmhp-approval/${programPlanId}/need-calculation-result`
                )
              }
              onDownloadTemplate={() => downloadTemplateQuery.refetch()}
              onImport={() => setShowImportModal(true)}
              hasRejected={hasRejected}
              canSendRevision={canSendRevision}
              seeCalculation={data?.see_calculation ?? false}

            />
          </>
        )}
      </div>

      {/* Add Target bottom drawer */}
      <AddTargetDrawer
        open={!!addTargetEntityId}
        onClose={() => setAddTargetEntityId(null)}
        entityId={addTargetEntityId}
        programPlanYear={programPlanId}
        // regencyId={regencyId}
        onSaved={() => refetch()}
      />

      {/* Preview bottom drawer */}
      <PreviewDrawer
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        data={localData}
        targetGroups={targetGroups}
      />

      {/* Import modals */}
      <ModalError
        errors={listOfImportErrors}
        open={!!listOfImportErrors}
        handleClose={() => setListOfImportErrors(null)}
      />
      <ModalImport
        open={showImportModal}
        setOpen={setShowImportModal}
        onSubmit={mutateImport}
        handleClose={() => setShowImportModal(false)}
        accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
        description={t('bmhpApproval:target_adjustment.page.import')}
      />

      {/* Send Revision confirmation modal */}
      <ModalConfirmation
        open={sendRevisionConfirmOpen}
        setOpen={setSendRevisionConfirmOpen}
        title={t(
          'bmhpApproval:target_adjustment.page.confirm_send_revision_title'
        )}
        description={t(
          'bmhpApproval:target_adjustment.page.confirm_send_revision_desc'
        )}
        onSubmit={handleConfirmSendRevision}
        buttonTitle={t('bmhpApproval:target_adjustment.page.btn_kirim_revisi')}
        isLoading={isSending}
      />
    </BmhpApprovalTabs>
  )
}

export default TargetAndAdjustmentPageContent
