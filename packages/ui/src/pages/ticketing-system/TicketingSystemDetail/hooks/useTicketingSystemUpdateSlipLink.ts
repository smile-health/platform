import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from '#components/toast'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'
import useSmileRouter from '#hooks/useSmileRouter'
import { AxiosError } from 'axios'
import { TFunction } from 'i18next'

import { updateTicketingSystemLink } from '../ticketing-system-detail.service'

export const useTicketingSystemUpdateSlipLink = (
  t: TFunction<['ticketingSystemDetail', 'common']>,
  language: string
) => {
  const router = useSmileRouter()
  const queryClient = useQueryClient()
  const { id } = router.query

  const { mutate, isPending, isError } = useMutation({
    mutationKey: ['ticketing-system-update-slip-link', { id, language }],
    mutationFn: (link: string) => updateTicketingSystemLink(Number(id), link),
    onSuccess: () => {
      toast.success({
        description: t('common:message.success.update', {
          type: t('ticketingSystemDetail:float_bar.panging_slip_link'),
        }),
      })
    },
    onError: (error: AxiosError) => {
      const { errors } = error.response?.data as {
        message: string
        errors: any
      }
      toast.danger({ description: errors?.link[0] })
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['ticketing-system-detail', { id, language }],
      })
    },
  })

  useSetLoadingPopupStore(isPending)

  return {
    mutate,
    isPending,
    isError,
  }
}
