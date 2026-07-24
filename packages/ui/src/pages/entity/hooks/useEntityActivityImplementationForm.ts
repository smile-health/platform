import { useRouter } from 'next/router'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from '#components/toast'
import { updateActivityImplementationTime } from '#services/entity'
import { ErrorResponse } from '#types/common'
import {
  TDetailActivityDate,
  TSubmitActivityImplementationTime,
  TUpdateActivityImplementationTimeBody,
} from '#types/entity'
import { AxiosError } from 'axios'
import { useTranslation } from 'react-i18next'

export const useEntityActivityImplementationForm = (
  setIsEdit: (value: boolean) => void
) => {
  const router = useRouter()
  const { id } = router.query
  const { t } = useTranslation(['entity'])
  const queryClient = useQueryClient()

  const { mutate: mutateActivityImplementation, isPending } = useMutation({
    mutationFn: (data: TSubmitActivityImplementationTime) =>
      updateActivityImplementationTime(id as string, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['entity__activities_date', id],
      })
      toast.success({
        description: t('entity:form.success.activity_implementation_time'),
      })
      setIsEdit(false)
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        const response =
          (error.response?.data as ErrorResponse) || error?.message
        toast.danger({ description: response.message })
      }
    },
  })

  const onSubmitForm = (values: TUpdateActivityImplementationTimeBody) => {
    const activities = values.activities
      ?.flat()
      ?.map((item) => {
        const result: Partial<TDetailActivityDate> = {
          start_date: item.start_date,
          activity_id: Number(item.activity_id),
        }

        if (item.start_date && item.end_date) {
          result['end_date'] = item.end_date
        }

        if (item.entity_activity_id) {
          result['id'] = Number(item.entity_activity_id)
        }

        return result
      })
      ?.filter(
        (item: TDetailActivityDate) => !!item?.start_date && !item?.is_expired
      )
    const payload: TSubmitActivityImplementationTime = {
      activities,
    }

    mutateActivityImplementation(payload)
  }

  return {
    onSubmitForm,
    isPending,
  }
}

export default {}
