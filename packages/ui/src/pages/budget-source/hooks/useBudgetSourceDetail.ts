import { useParams } from 'next/navigation'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from '#components/toast'
import { CommonType, ErrorResponse } from '#types/common'
import { AxiosError } from 'axios'
import { useTranslation } from 'react-i18next'

import { getBudgetSource, updateStatusBudgetSourceInProgram } from '../budget-source.service'
import { CreateBudgetSourceBody, ParamData } from '../budget-source.type'

export const useBudgetSourceDetail = ({
  isGlobal = false,
}: CommonType = {}) => {
  const { t } = useTranslation(['common', 'budgetSource'])
  const params = useParams()
  const queryClient = useQueryClient()

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['budget-source-detail', params?.id],
    queryFn: () => getBudgetSource(Number(params?.id), isGlobal),
    enabled: Boolean(params?.id),
    refetchOnWindowFocus: false,
  })

  const defaultValue: CreateBudgetSourceBody = {
    name: data?.name,
    description: data?.description,
    program_ids: data?.programs?.map((item) => item.id),
    is_restricted: data?.is_restricted,
  }

  const { mutate: onUpdateStatus, isPending: isUpdateStatus } = useMutation({
    mutationFn: (data:ParamData) => updateStatusBudgetSourceInProgram(data?.id,data?.status),
    onSuccess: async() => {
      await queryClient.invalidateQueries({
        queryKey: ['budget-source-detail'],
      })
      toast.success({
        description: t('common:message.success.update', {
          type: t('budgetSource:list.status')?.toLowerCase(),
        }),
      })
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        const response = error.response?.data as ErrorResponse
        toast.danger({
          description: response.message || t('common:message.common.error'),
        })
      }
    },
  })

  return {
    data,
    isLoading: isLoading || isFetching,
    defaultValue,
    t,
    onUpdateStatus,
    isUpdateStatus,
  }
}
