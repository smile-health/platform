import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from '#components/toast'
import { useTranslation } from 'react-i18next'

import {
  ProcurementRecapitulationParams,
  SaveRemainingStockPayload,
} from '../libs/procurement-recapitulation.type'
import {
  getProcurementRecapitulation,
  saveRemainingStock,
} from '../services/procurement-recapitulation.service'

// ─── Query ────────────────────────────────────────────────────────────────────

interface UseProcurementRecapitulationProps {
  params: ProcurementRecapitulationParams
  enabled?: boolean
}

export const useProcurementRecapitulation = ({
  params,
  enabled = true,
}: UseProcurementRecapitulationProps) =>
  useQuery({
    queryKey: ['bmhp-procurement-recapitulation', params],
    queryFn: () => getProcurementRecapitulation(params),
    enabled: enabled && !!params.program_plan_id,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  })

// ─── Mutation ─────────────────────────────────────────────────────────────────

export const useSaveRemainingStock = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation(['bmhpApproval'])

  const mutation = useMutation({
    mutationFn: (body: SaveRemainingStockPayload) => saveRemainingStock(body),
    onSuccess: () => {
      toast.success({
        title: t(
          'bmhpApproval:procurement_recapitulation.mutations.save_success_title'
        ),
        description: t(
          'bmhpApproval:procurement_recapitulation.mutations.save_success_desc'
        ),
      })
      queryClient.invalidateQueries({
        queryKey: ['bmhp-procurement-recapitulation'],
      })
    },
    onError: (error: unknown) => {
      const msg =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ??
        (error as { message?: string })?.message ??
        t('bmhpApproval:procurement_recapitulation.mutations.save_error')
      toast.danger({ title: 'Error', description: msg })
    },
  })

  return {
    save: mutation.mutate,
    isSaving: mutation.isPending,
  }
}
