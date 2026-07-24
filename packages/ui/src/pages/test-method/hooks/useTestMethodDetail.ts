import { useParams } from 'next/navigation'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from '#components/toast'
import useSmileRouter from '#hooks/useSmileRouter'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'
import { useTranslation } from 'react-i18next'

import {
  deleteTestMethod,
  getTestMethod,
} from '../test-method.service'

export const useTestMethodDetail = () => {
  const params = useParams()
  const queryClient = useQueryClient()
  const router = useSmileRouter()
  const { t } = useTranslation(['testMethod', 'common'])

  const { data, isLoading } = useQuery({
    queryKey: ['test-method-detail', params?.id],
    queryFn: () => getTestMethod(Number(params?.id)),
    enabled: Boolean(params?.id),
    refetchOnWindowFocus: false,
  })

  const { mutate: onDelete, isPending: isLoadingDelete } = useMutation({
    mutationFn: () => deleteTestMethod(data?.id as number),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['test-methods'] })
      toast.success({
        description: t('testMethod:message.delete_success'),
      })
      router.push('/v5/test-method')
    },
    onError: () => {
      toast.danger({
        description: t('common:message.failed.delete', {
          type: t('testMethod:title.detail')?.toLowerCase(),
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
