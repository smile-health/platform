'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Button } from '#components/button'
import {
  FilterFormBody,
  FilterFormRoot,
  FilterResetButton,
  FilterSubmitButton,
  UseFilter,
  useFilter,
} from '#components/filter'
import { ModalConfirmation } from '#components/modules/ModalConfirmation'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'
import useSmileRouter from '#hooks/useSmileRouter'
import { useProfile } from '#shared/auth'
import { useTranslation } from 'react-i18next'

import BmhpApprovalTabs from '../../BmhpApprovalTabs'
import AddTargetDrawer from '../components/AddTargetDrawer'
import PreviewDrawer from '../components/PreviewDrawer'
import TargetAdjustmentTable from '../components/TargetAdjustmentTable'
import { useTargetAdjustmentData } from '../hooks/useTargetAdjustmentData'
import {
  useReviewProgramPlan,
  // useUpdateTargetAdjustment,
} from '../hooks/useTargetAdjustmentMutations'
import { targetAdjustmentFilterSchema } from '../libs/target-adjustment.filter'
import {
  BmhpEntityData,
  TargetAdjustmentParams,
} from '../libs/target-adjustment.type'

// ─── Page ─────────────────────────────────────────────────────────────────────

const TargetAndAdjustmentPageContent: React.FC = () => {
  const { t } = useTranslation(['common', 'bmhpApproval'])
  const { data: profile } = useProfile()
  const { push } = useSmileRouter()
  const provinceId = profile?.entity?.province_id

  // ── Applied filters ────────────────────────────────────────────────────────
  const [appliedFilters, setAppliedFilters] = useState({
    programPlanId: 0,
    regencyId: 0,
    keyword: '',
    examinationId: undefined as number | number[] | undefined,
    // Labels for display in the drawer
    programPlanLabel: '',
    regencyLabel: '',
  })

  const filterSchema = useMemo<UseFilter>(
    () =>
      targetAdjustmentFilterSchema({
        t: t as (key: string) => string,
        provinceId,
      }),
    [t, provinceId]
  )
  const filter = useFilter(filterSchema)

  const params = useMemo<TargetAdjustmentParams>(
    () => ({
      program_plan_id: appliedFilters.programPlanId,
      regency_id: appliedFilters.regencyId,
      keyword: appliedFilters.keyword || undefined,
      examination_id: appliedFilters.examinationId,
    }),
    [appliedFilters]
  )

  const isFiltersReady =
    !!appliedFilters.programPlanId && !!appliedFilters.regencyId

  const { data, isLoading, isFetching } = useTargetAdjustmentData({
    params,
    enabled: isFiltersReady,
  })

  useSetLoadingPopupStore(isLoading || isFetching)

  // ── Local state ────────────────────────────────────────────────────────────
  const [localData, setLocalData] = useState<BmhpEntityData[]>([])

  useEffect(() => {
    if (data?.data) setLocalData(JSON.parse(JSON.stringify(data.data)))
  }, [data])

  const targetGroups = data?.target_group ?? []

  // ── Drawer / modal state ───────────────────────────────────────────────────
  const [addTargetEntityId, setAddTargetEntityId] = useState<number | null>(
    null
  )
  const [previewOpen, setPreviewOpen] = useState(false)
  const [sendRevisionConfirmOpen, setSendRevisionConfirmOpen] = useState(false)

  // ── Filter handlers ────────────────────────────────────────────────────────
  const handleFilterSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      const programPlanOption = filter.getValues('program_plan_id')
      const regencyOption = filter.getValues('regency')
      const examValue = filter.getValues('examination')

      const examinationId = Array.isArray(examValue)
        ? examValue.map((v: { value: number }) => v.value)
        : (examValue as { value: number } | null)?.value

      setAppliedFilters({
        programPlanId: programPlanOption?.value ?? 0,
        regencyId: regencyOption?.value ?? 0,
        keyword: filter.getValues('keyword') || '',
        examinationId: examinationId,
        programPlanLabel: programPlanOption?.label ?? '',
        regencyLabel: regencyOption?.label ?? '',
      })
    },
    [filter]
  )

  const handleFilterReset = useCallback(() => {
    filter.reset()
    setAppliedFilters({
      programPlanId: 0,
      regencyId: 0,
      keyword: '',
      examinationId: undefined,
      programPlanLabel: '',
      regencyLabel: '',
    })
    setLocalData([])
  }, [filter])

  // ── Toggle per-cell status ─────────────────────────────────────────────────
  const handleToggleStatus = useCallback(
    (
      entityId: number,
      targetGroupId: number,
      examinationId: number,
      status: boolean
    ) => {
      setLocalData((prev) =>
        prev.map((entity) => {
          if (entity.entity_name.id !== entityId) return entity
          return {
            ...entity,
            target: entity.target.map((t) =>
              t.target_id === targetGroupId &&
              t.examination_id === examinationId
                ? { ...t, status }
                : t
            ),
          }
        })
      )
    },
    []
  )

  // ── Batch approve / revise ─────────────────────────────────────────────────
  const handleApproveAll = useCallback(() => {
    setLocalData((prev) =>
      prev.map((entity) => ({
        ...entity,
        target: entity.target.map((t) => ({
          ...t,
          // Skip verif=0 rows — BE bulk action intentionally skips them (hotfix B4DR-657)
          status: t.verification_status !== 0 ? true : t.status,
        })),
      }))
    )
  }, [])

  const handleReviseAll = useCallback(() => {
    setLocalData((prev) =>
      prev.map((entity) => ({
        ...entity,
        target: entity.target.map((t) => ({
          ...t,
          // Skip verif=0 rows — BE bulk action intentionally skips them (hotfix B4DR-657)
          status: t.verification_status !== 0 ? false : t.status,
        })),
      }))
    )
  }, [])

  // ── Check if any item has status = false (rejected) ───────────────────────
  const hasRejected = useMemo(
    () =>
      localData.some((entity) => entity.target.some((t) => t.status === false)),
    [localData]
  )

  // ── Build PATCH payload ────────────────────────────────────────────────────
  const buildUpdatePayload = useCallback(() => {
    return localData
      .filter((entity) =>
        entity.target.some((t) => t.status !== undefined && t.status !== null)
      )
      .map((entity) => ({
        planning_id: entity.id ?? undefined,
        entity_id: entity.entity_name.id,
        target: entity.target
          .filter((t) => t.status !== undefined && t.status !== null)
          .map((t) => ({
            id: t.id,
            examination_id: t.examination_id,
            target_id: t.target_id,
            target: t.target,
            adjustment_target: t.adjustment_target,
            status: t.status as boolean,
            revision_note: t.revision_note,
          })),
      }))
  }, [localData])

  // const { updateData, isUpdating } = useUpdateTargetAdjustment()
  const { sendRevision, isSending } = useReviewProgramPlan()

  const handleConfirmSendRevision = useCallback(() => {
    sendRevision(
      { program_plan_id: appliedFilters.programPlanId },
      {
        onSuccess: () => {
          setSendRevisionConfirmOpen(false)
          push('/v5/bmhp-approval')
        },
      }
    )
  }, [sendRevision, appliedFilters, push])

  return (
    <BmhpApprovalTabs>
      <div className="ui-space-y-6 ui-mt-6">
        {/* Filter */}
        <FilterFormRoot collapsible={false} onSubmit={handleFilterSubmit}>
          <FilterFormBody className="ui-grid-cols-4 ui-gap-4">
            {filter.renderField()}
            <div className="ui-col-span-4 ui-flex ui-justify-end ui-gap-3 ui-mt-2">
              <FilterResetButton onClick={handleFilterReset} variant="subtle" />
              <FilterSubmitButton className="ui-w-40" variant="solid" />
            </div>
          </FilterFormBody>
          {filter.renderActiveFilter()}
        </FilterFormRoot>

        {/* Empty prompt */}
        {!isFiltersReady && (
          <div className="ui-mt-8 ui-p-8 ui-bg-neutral-50 ui-rounded-lg ui-text-center ui-text-neutral-500">
            <p className="ui-text-base">
              {t('bmhpApproval:target_adjustment.page.select_filter_prompt')}
            </p>
          </div>
        )}

        {isFiltersReady && (
          <>
            {/* Action bar above table */}
            <div className="ui-flex ui-items-center ui-justify-end ui-flex-wrap ui-gap-3">
              <Button
                variant="outline"
                size="sm"
                disabled={!hasRejected}
                onClick={() => setSendRevisionConfirmOpen(true)}
              >
                {t('bmhpApproval:target_adjustment.page.btn_send_revision')}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPreviewOpen(true)}
              >
                {t('bmhpApproval:target_adjustment.page.btn_preview')}
              </Button>
              <Button variant="outline" size="sm" disabled>
                {t('bmhpApproval:target_adjustment.page.btn_see_calculation')}
              </Button>
            </div>

            {/* Main table */}
            <TargetAdjustmentTable
              data={localData}
              targetGroups={targetGroups}
              onAddTarget={(entity) =>
                setAddTargetEntityId(entity.entity_name.id)
              }
              onToggleStatus={handleToggleStatus}
              onApproveAll={handleApproveAll}
              onReviseAll={handleReviseAll}
              onSendRevision={() => setSendRevisionConfirmOpen(true)}
              onPreview={() => setPreviewOpen(true)}
              hasRejected={hasRejected}
            />
          </>
        )}
      </div>

      {/* Add Target bottom drawer */}
      <AddTargetDrawer
        open={!!addTargetEntityId}
        onClose={() => setAddTargetEntityId(null)}
        entityId={addTargetEntityId}
        programPlanYear={appliedFilters.programPlanId}
        onSaved={() => setAddTargetEntityId(null)}
      />

      {/* Preview bottom drawer */}
      <PreviewDrawer
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        data={localData}
        targetGroups={targetGroups}
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
