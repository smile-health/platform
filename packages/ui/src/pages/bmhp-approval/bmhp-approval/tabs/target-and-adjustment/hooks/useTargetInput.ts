import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from '#components/toast'
import { useTranslation } from 'react-i18next'

import {
  GetTargetInputParams,
  UpdateTargetInputPayload,
} from '../libs/target-adjustment.type'
import {
  getTargetInput,
  updateTargetInput,
} from '../services/target-adjustment.service'

// ─── Query ────────────────────────────────────────────────────────────────────

interface UseGetTargetInputProps {
  params: GetTargetInputParams
  enabled?: boolean
}

export const useGetTargetInput = ({
  params,
  enabled = true,
}: UseGetTargetInputProps) =>
  useQuery({
    queryKey: ['bmhp-target-input', params],
    queryFn: () => getTargetInput(params),
    enabled: enabled && !!params.program_plan_id && !!params.entity_id,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    staleTime: 0,
  })

// ─── Mutation ─────────────────────────────────────────────────────────────────

export const useUpdateTargetInput = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation(['bmhpApproval'])

  const mutation = useMutation({
    mutationFn: (body: UpdateTargetInputPayload) => updateTargetInput(body),
    onSuccess: () => {
      toast.success({
        title: t(
          'bmhpApproval:target_adjustment.mutations.target_input_success_title'
        ),
        description: t(
          'bmhpApproval:target_adjustment.mutations.target_input_success_desc'
        ),
      })
      // Invalidate both the drawer query and the main table
      queryClient.invalidateQueries({ queryKey: ['bmhp-target-input'] })
      queryClient.invalidateQueries({ queryKey: ['bmhp-target-adjustment'] })
    },
    onError: (error: unknown) => {
      const msg =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ||
        (error as { message?: string })?.message ||
        t('bmhpApproval:target_adjustment.mutations.target_input_error')
      toast.danger({ title: 'Error', description: msg })
    },
  })

  return {
    saveTargetInput: mutation.mutate,
    isSaving: mutation.isPending,
  }
}
