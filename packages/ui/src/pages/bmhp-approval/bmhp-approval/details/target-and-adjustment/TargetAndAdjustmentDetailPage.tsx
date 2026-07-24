'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'
import useSmileRouter from '#hooks/useSmileRouter'

import TargetAdjustmentTable from '../../tabs/target-and-adjustment/components/TargetAdjustmentTable'
import { useTargetAdjustmentData } from '../../tabs/target-and-adjustment/hooks/useTargetAdjustmentData'
import {
  BmhpEntityData,
  TargetAdjustmentParams,
} from '../../tabs/target-and-adjustment/libs/target-adjustment.type'
import BmhpApprovalDetailTabs from '../BmhpApprovalDetailTabs'

// ── Page Content ──────────────────────────────────────────────────────────────

const TargetAndAdjustmentDetailPageContent: React.FC = () => {
  const { query } = useSmileRouter()

  const programPlanId = query.year_id ? Number(query.year_id) : 0

  // Optional: only sent when viewing from province route (URL has [regency_id])
  const regencyId = query.regency_id ? Number(query.regency_id) : undefined

  const params = useMemo<TargetAdjustmentParams>(
    () => ({
      program_plan_id: programPlanId,
      ...(regencyId ? { regency_id: regencyId } : {}),
    }),
    [programPlanId, regencyId]
  )

  const isReady = !!programPlanId

  const { data, isLoading, isFetching } = useTargetAdjustmentData({
    params,
    enabled: isReady,
  })

  useSetLoadingPopupStore(isLoading || isFetching)

  const [localData, setLocalData] = useState<BmhpEntityData[]>([])

  useEffect(() => {
    if (data?.data) setLocalData(structuredClone(data.data))
  }, [data])

  const targetGroups = data?.target_group ?? []

  return (
    <div className="ui-mt-6 ui-space-y-4">
      {isReady && (
        <TargetAdjustmentTable
          data={localData}
          targetGroups={targetGroups}
          isPreview
          onAddTarget={() => {}}
          onToggleStatus={() => {}}
          onApproveAll={() => {}}
          onReviseAll={() => {}}
          onSendRevision={() => {}}
          onPreview={() => {}}
        />
      )}
    </div>
  )
}

// ── Wrapped with detail tabs ───────────────────────────────────────────────────

const TargetAndAdjustmentDetailPage: React.FC = () => {
  return (
    <BmhpApprovalDetailTabs>
      <TargetAndAdjustmentDetailPageContent />
    </BmhpApprovalDetailTabs>
  )
}

export default TargetAndAdjustmentDetailPage
