import { useState } from 'react'
import { useParams } from 'next/navigation'
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { toast } from '#components/toast'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'
import { activatePopulation, getListYearPopulation } from '#services/population'
import { AxiosError } from 'axios'
import { useTranslation } from 'react-i18next'

export default function useActivatePopulation() {
  const { t } = useTranslation(['common', 'population'])
  const params = useParams()
  const year = Number(params.id)

  const [openConfirmPopulation, setOpenConfirmPopulation] = useState(false)
  const queryClient = useQueryClient()

  const { data: isActivePopulation, isFetching: isFetchingActivePopulation } =
    useQuery({
      queryKey: ['status-population', year],
      queryFn: async () => {
        const response = await getListYearPopulation({
          page: 1,
          paginate: 10,
          keyword: year.toString(),
        })

        return response.data[0].status === 1
      },
      placeholderData: keepPreviousData,
    })

  const { mutate: handleActivatePopulation, isPending } = useMutation({
    mutationFn: () => activatePopulation(year),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['status-population'] })
      toast.success({
        description: t('population:active.confirmation.success'),
      })
    },
    onError: (err: AxiosError) => {
      const { message } = err.response?.data as { message: string }

      toast.danger({ description: message || t('message.common.error') })
    },
  })

  useSetLoadingPopupStore(isPending)

  return {
    isActivePopulation,
    isFetchingActivePopulation,
    openConfirmPopulation,
    setOpenConfirmPopulation,
    handleActivatePopulation,
  }
}
