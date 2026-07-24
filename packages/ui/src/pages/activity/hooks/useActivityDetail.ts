import { useParams } from 'next/navigation'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from '#components/toast'
import useSmileRouter from '#hooks/useSmileRouter'
import { useTranslation } from 'react-i18next'

import { deleteActivity, getActivity, updateStatusActivity } from '../activity.service'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'

export const useActivityDetail = () => {
  const params = useParams()
  const queryClient = useQueryClient()
  const router = useSmileRouter()
  const { t } = useTranslation(['activity', 'common'])

  const { data, isLoading } = useQuery({
    queryKey: ['activity-detail', params?.id],
    queryFn: () => getActivity(Number(params?.id)),
    enabled: Boolean(params?.id),
    refetchOnWindowFocus: false,
  })

  const { mutate: onDelete, isPending: isLoadingDelete } = useMutation({
    mutationFn: () => deleteActivity(data?.id),
    onSuccess: () => {
      toast.success({
        description: t('common:message.success.delete', {
          type: t('activity:title.activity')?.toLowerCase(),
        }),
      })
      router.push('/v5/activity')
    },
    onError: () => {
      toast.danger({
        description: t('common:message.failed.delete', {
          type: t('activity:title.activity')?.toLowerCase(),
        }),
      })
    },
  })

  const { mutate: onChangeStatus, isPending } = useMutation({
    mutationFn: () => updateStatusActivity(String(data?.id), { status: !data?.status }),
    onError: (res) => toast.danger({ description: res.message }),
    onSuccess: async (res) => {
      toast.success({ description: res?.result?.status ? t('activity:action.status.success.activate') : t('activity:action.status.success.deactivate') })
      await queryClient.invalidateQueries({ queryKey: ['activity-detail'] })
    }
  })

  useSetLoadingPopupStore(isPending)

  return {
    onDelete,
    isLoadingDelete,
    data,
    isLoading,
    isLoadingStatus: isPending,
    onChangeStatus,
  }
}
