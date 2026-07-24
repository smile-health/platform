import { useContext } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from '#components/toast'
import { BOOLEAN } from '#constants/common'
import { AxiosError } from 'axios'
import { TFunction } from 'i18next'

import { toastDateFormatter } from '../../form/libs/period-of-stock-taking-form.common'
import { changeStatusPeriodOfStockTaking } from '../../services/period-of-stock-taking.services'
import PeriodOfStockTakingContext from '../libs/period-of-stock-taking-list.context'

export const useSubmitEnableDisableStatus = (
  t: TFunction<['common', 'periodOfStockTaking']>,
  language: string
) => {
  const { setPagination, page } = useContext(PeriodOfStockTakingContext)
  const queryClient = useQueryClient()
  const { mutate: mutateChangeStatus, isPending: isPendingChangeStatus } =
    useMutation({
      mutationFn: (data: { id: number; status: number }) =>
        changeStatusPeriodOfStockTaking(data.id, data.status),
      onSuccess: async (res) => {
        toast.success({
          description: t(
            res?.status === BOOLEAN.TRUE
              ? 'periodOfStockTaking:toast.activate_success'
              : 'periodOfStockTaking:toast.deactivate_success',
            {
              period: `${toastDateFormatter(res?.start_date, language)} - ${toastDateFormatter(res?.end_date, language)}`,
            }
          ),
          id: 'toast-success-update-period-of-stock-taking',
        })

        if (page > 1) {
          setPagination({ page: 1 })
          queryClient.invalidateQueries({
            queryKey: ['list-period-of-stock-taking', { page }],
          })
        } else {
          queryClient.invalidateQueries({
            queryKey: ['list-period-of-stock-taking'],
          })
        }

        queryClient.invalidateQueries({
          queryKey: ['active-period-of-stock-taking'],
        })
      },
      onError: (error: AxiosError) => {
        const { message } = error?.response?.data as { message: string }
        toast.danger({
          description:
            message || t('periodOfStockTaking:toast.change_status_failed'),
          id: 'toast-error-update-period-of-stock-taking',
        })
      },
    })

  return { mutateChangeStatus, isPendingChangeStatus }
}
