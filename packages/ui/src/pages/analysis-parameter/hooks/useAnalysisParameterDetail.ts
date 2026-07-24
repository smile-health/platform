import { useParams } from 'next/navigation'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from '#components/toast'
import useSmileRouter from '#hooks/useSmileRouter'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'
import { useTranslation } from 'react-i18next'

import {
  deleteAnalysisParameter,
  getAnalysisParameter,
} from '../analysis-parameter.service'

export const useAnalysisParameterDetail = () => {
  const params = useParams()
  const queryClient = useQueryClient()
  const router = useSmileRouter()
  const { t } = useTranslation(['analysisParameter', 'common'])

  const { data, isLoading } = useQuery({
    queryKey: ['analysis-parameter-detail', params?.id],
    queryFn: () => getAnalysisParameter(Number(params?.id)),
    enabled: Boolean(params?.id),
    refetchOnWindowFocus: false,
  })

  const { mutate: onDelete, isPending: isLoadingDelete } = useMutation({
    mutationFn: () => deleteAnalysisParameter(data?.id as number),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analysis-parameters'] })
      toast.success({
        description: t('common:message.success.delete', {
          type: t('analysisParameter:title.detail')?.toLowerCase(),
        }),
      })
      router.push('/v5/analysis-parameter')
    },
    onError: () => {
      toast.danger({
        description: t('common:message.failed.delete', {
          type: t('analysisParameter:title.detail')?.toLowerCase(),
        }),
      })
    },
  })

  useSetLoadingPopupStore(isLoading || isLoadingDelete)

  return {
    onDelete,
    isLoadingDelete,
    data,
    isLoading,
  }
}
