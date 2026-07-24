import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from '#components/toast'
import { useTranslation } from 'react-i18next'
import {
  listProvinceApprovals,
  updateProvinceApprovalStatus,
} from '../../services/bmhp-planning.services'
import { ListBmhpProvinceApprovalParams } from '../libs/bmhp-approval-list.type'

export const useBmhpProvinceApprovalList = ({
  params,
  enabled = false,
}: {
  params: ListBmhpProvinceApprovalParams
  enabled?: boolean
}) => {
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['bmhp-approval-province-list', params],
    queryFn: () => listProvinceApprovals(params),
    refetchOnWindowFocus: false,
    enabled: enabled,
  })

  return { data, isLoading, isFetching }
}

export const useUpdateProvinceApprovalStatus = () => {
  const { t } = useTranslation(['bmhpApproval'])
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: ({
      entity_id,
      program_plan_id,
      status,
    }: {
      entity_id: number
      program_plan_id: number
      status: number
    }) => updateProvinceApprovalStatus(entity_id, program_plan_id, status),
    onSuccess: () => {
      toast.success({
        title: t('bmhpApproval:province_approval.mutations.update_status_success'),
      })
      queryClient.invalidateQueries({ queryKey: ['bmhp-approval-province-list'] })
    },
    onError: (error: unknown) => {
      const msg =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ??
        (error as { message?: string })?.message ??
        t('bmhpApproval:province_approval.mutations.update_status_error')
      toast.danger({ title: 'Error', description: msg })
    },
  })

  return {
    updateStatus: mutation.mutate,
    isLoading: mutation.isPending,
  }
}
