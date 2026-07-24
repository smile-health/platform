import { useParams } from 'next/navigation'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from '#components/toast'
import useSmileRouter from '#hooks/useSmileRouter'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'
import { useTranslation } from 'react-i18next'

import {
  deleteParameterCategory,
  getParameterCategory,
} from '../parameter-category.service'

export const useParameterCategoryDetail = () => {
  const params = useParams()
  const queryClient = useQueryClient()
  const router = useSmileRouter()
  const { t } = useTranslation(['parameterCategory', 'common'])

  const { data, isLoading } = useQuery({
    queryKey: ['parameter-category-detail', params?.id],
    queryFn: () => getParameterCategory(Number(params?.id)),
    enabled: Boolean(params?.id),
    refetchOnWindowFocus: false,
  })

  const { mutate: onDelete, isPending: isLoadingDelete } = useMutation({
    mutationFn: () => deleteParameterCategory(data?.id as number),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parameter-categories'] })
      toast.success({
        description: t('parameterCategory:message.delete_success'),
      })
      router.push('/v5/parameter-category')
    },
    onError: () => {
      toast.danger({
        description: t('common:message.failed.delete', {
          type: t('parameterCategory:title.detail')?.toLowerCase(),
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
