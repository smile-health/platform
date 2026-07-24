import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from '#components/toast'
import { BOOLEAN } from '#constants/common'
import useSmileRouter from '#hooks/useSmileRouter'
import { ErrorResponse } from '#types/common'
import { AxiosError } from 'axios'

import {
  createPeriodOfStockTaking,
  updatePeriodOfStockTaking,
} from '../../services/period-of-stock-taking.services'
import { toastDateFormatter } from '../libs/period-of-stock-taking-form.common'
import {
  PeriodOfStockTakingFormData,
  PeriodOfStockTakingSubmitData,
  TUseSubmitPeriodOfStockTakingReturnProps,
} from '../libs/period-of-stock-taking-form.type'

export const useSubmitPeriodOfStockTaking = ({
  t,
  language,
  setError,
}: TUseSubmitPeriodOfStockTakingReturnProps) => {
  const router = useSmileRouter()
  const queryClient = useQueryClient()
  const createMutation = useMutation({
    mutationFn: createPeriodOfStockTaking,
    onSuccess: async (res) => {
      queryClient.removeQueries()
      if (res?.status === BOOLEAN.TRUE)
        toast.success({
          description: t(
            'periodOfStockTaking:toast.create_and_activate_success',
            {
              period: `${toastDateFormatter(res?.start_date, language)} - ${toastDateFormatter(res?.end_date, language)}`,
            }
          ),
          id: 'toast-success-create-period-of-stock-taking',
        })
      else
        toast.success({
          description: t('periodOfStockTaking:toast.create_success', {
            period: `${toastDateFormatter(res?.start_date, language)} - ${toastDateFormatter(res?.end_date, language)}`,
          }),
          id: 'toast-success-create-period-of-stock-taking',
        })
      router.push('/v5/period-of-stock-taking')
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      if (error instanceof AxiosError) {
        const response = error.response?.data as ErrorResponse
        toast.danger({
          description: error.response?.data?.message,
          id: 'errorChangePassword',
          duration: 3000,
        })
        if (response.errors) {
          for (const item of Object.keys(response.errors)) {
            setError(item as keyof PeriodOfStockTakingFormData, {
              message: response.errors[item][0],
              type: 'min',
            })
          }
        }
      }
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number
      data: PeriodOfStockTakingSubmitData
    }) => updatePeriodOfStockTaking(id, data),
    onSuccess: (res) => {
      queryClient.removeQueries()
      if (res?.status === BOOLEAN.TRUE)
        toast.success({
          description: t(
            'periodOfStockTaking:toast.update_and_activate_success',
            {
              period: `${toastDateFormatter(res?.start_date, language)} - ${toastDateFormatter(res?.end_date, language)}`,
            }
          ),
          id: 'toast-success-update-period-of-stock-taking',
        })
      else
        toast.success({
          description: t('periodOfStockTaking:toast.update_success', {
            period: `${toastDateFormatter(res?.start_date, language)} - ${toastDateFormatter(res?.end_date, language)}`,
          }),
          id: 'toast-success-update-period-of-stock-taking',
        })
      router.push(`/v5/period-of-stock-taking`)
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      if (error instanceof AxiosError) {
        const response = error.response?.data as ErrorResponse
        toast.danger({
          description: error.response?.data?.message,
          id: 'errorChangePassword',
          duration: 3000,
        })
        if (response.errors) {
          for (const item of Object.keys(response.errors)) {
            setError(item as keyof PeriodOfStockTakingFormData, {
              message: response.errors[item][0],
              type: 'min',
            })
          }
        }
      }
    },
  })

  const submitPeriodOfStockTaking = (data: PeriodOfStockTakingSubmitData) => {
    if (data?.id) {
      const { id, ...rest } = data
      updateMutation.mutate({ id: id, data: rest })
    } else {
      createMutation.mutate(data)
    }
  }

  const pendingPeriodOfStockTaking =
    createMutation.isPending || updateMutation.isPending

  return { submitPeriodOfStockTaking, pendingPeriodOfStockTaking }
}
