import { yupResolver } from '@hookform/resolvers/yup'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from '#components/toast'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'
import { importPopulation } from '#services/population'
import { AxiosError } from 'axios'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { ImportPopulationValues } from '../constants/population.type'
import { schemaImportPopulation } from '../schema/populationSchema'

export default function useImportPopulation() {
  const { t } = useTranslation(['common', 'population'])
  const queryClient = useQueryClient()

  const { mutate: handleImport, isPending: isPendingImport } = useMutation({
    mutationFn: ({ year, data }: { year: number; data: FormData }) =>
      importPopulation(year, data),
    onSuccess: () =>
      toast.success({
        description: t('population:toast.import.success'),
      }),
    onError: (err: AxiosError) => {
      toast.danger({
        description: err?.message || t('population:toast.import.error'),
      })
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['list-population'],
      })
    },
  })

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    reset,
    formState: { errors },
  } = useForm<ImportPopulationValues>({
    resolver: yupResolver(schemaImportPopulation(t)),
    mode: 'onBlur',
  })

  useSetLoadingPopupStore(isPendingImport)

  return {
    errors,
    setError,
    register,
    handleSubmit,
    setValue,
    handleImport,
    reset,
  }
}
