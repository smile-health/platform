import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  GetNeedsAggregateDetailsResponse,
  GetNeedsAggregatePreviewResponse,
  NeedsAggregateTableParams,
  TNeedsAggregateDetailItem,
  UpdateNeedsAggregateStatusBody,
} from '../libs/needs-aggregate.types'
import {
  exportNeedsAggregateXls,
  getNeedsAggregateDetails,
  getNeedsAggregatePreview,
  updateNeedsAggregateStatus,
} from '../services/need-aggregate.service'

// ── Hook: Get Needs Aggregate Details ─────────────────────────────────────────────

export const useNeedsAggregateDetails = ({
  cityId,
  programPlanId,
  enabled = true,
}: {
  cityId: number | null
  programPlanId: number
  enabled?: boolean
}) => {
  return useQuery<GetNeedsAggregateDetailsResponse>({
    queryKey: ['needs-aggregate-details', cityId, programPlanId],
    queryFn: () => getNeedsAggregateDetails(cityId!, programPlanId),
    enabled: enabled && cityId !== null,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

// ── Hook: Update Needs Aggregate Status ───────────────────────────────────────────

export const useUpdateNeedsAggregateStatus = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      cityId,
      body,
    }: {
      cityId: number
      body: UpdateNeedsAggregateStatusBody
    }) => updateNeedsAggregateStatus(cityId, body),
    onSuccess: () => {
      // Invalidate the list query to refetch updated data
      queryClient.invalidateQueries({
        queryKey: ['needs-aggregate-list'],
      })
    },
  })
}

// ── Hook: Export Needs Aggregate XLS ──────────────────────────────────────────────

export const useExportNeedsAggregateXls = () => {
  return useMutation({
    mutationFn: (params: NeedsAggregateTableParams) =>
      exportNeedsAggregateXls(params),
  })
}

// ── Hook: Get Needs Aggregate Preview ─────────────────────────────────────────────

export const useNeedsAggregatePreview = ({
  programPlanId,
  enabled = true,
}: {
  programPlanId: number
  enabled?: boolean
}) => {
  return useQuery<GetNeedsAggregatePreviewResponse>({
    queryKey: ['needs-aggregate-preview', programPlanId],
    queryFn: () => getNeedsAggregatePreview(programPlanId),
    enabled,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}
