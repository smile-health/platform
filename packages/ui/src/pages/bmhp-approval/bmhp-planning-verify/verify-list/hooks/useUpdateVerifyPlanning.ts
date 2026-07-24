import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from '#components/toast'
import { useTranslation } from 'react-i18next'

import { UpdateVerifyPlanningRequest } from '../libs/verify-planning.type'
import { updateVerifyPlanningData } from '../services/verify-planning.service'

/**
 * Hook to handle updating verify planning data
 */
export const useUpdateVerifyPlanning = () => {
  const { t } = useTranslation(['common', 'bmhpPlanning'])
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (data: UpdateVerifyPlanningRequest) =>
      updateVerifyPlanningData(data),
    onSuccess: () => {
      toast.success({
        title: 'Success',
        description: t('verify.update_success', 'Data berhasil disimpan'),
      })

      // Invalidate and refetch the verify planning data
      queryClient.invalidateQueries({
        queryKey: ['verify-bmhp-planning'],
      })
    },
    onError: (error: unknown) => {
      const errorMessage =
        (
          error as {
            response?: { data?: { message?: string } }
            message?: string
          }
        )?.response?.data?.message ||
        (error as { message?: string })?.message ||
        t('verify.update_error', 'Gagal menyimpan data')

      toast.danger({
        title: 'Error',
        description: errorMessage,
      })
    },
  })

  return {
    updateData: mutation.mutate,
    isUpdating: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
  }
}
