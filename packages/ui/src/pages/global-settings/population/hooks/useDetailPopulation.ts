import { useMemo } from 'react'
import { useParams } from 'next/navigation'
import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query'
import { useFilter, UseFilter } from '#components/filter'
import { toast } from '#components/toast'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'
import {
  exportPopulation,
  getDetailPopulation,
  getDetailPopulationGlobal,
} from '#services/population'
import { DetailPopulationParams } from '#types/population'
import { AxiosError } from 'axios'
import { useTranslation } from 'react-i18next'

import { generateFilterDetailPopulationSchema } from '../schema/populationSchema'

export default function useDetailPopulation(isGlobal = false) {
  const { t } = useTranslation(['common', 'population'])
  const params = useParams()
  const id = Number(params.id)

  const filterSchema = useMemo<UseFilter>(
    () => generateFilterDetailPopulationSchema(t),
    [t]
  )
  const filter = useFilter(filterSchema)

  const isFilterActive = useMemo(() => {
    return Boolean(filter.getValues('province'))
  }, [filter])

  const filterParams = useMemo<DetailPopulationParams>(() => {
    return {
      province_id: filter.query.province?.value,
    }
  }, [filter.query])

  const { data, isFetching } = useQuery({
    queryKey: ['detail-population', id, filter.query],
    queryFn: () => {
      if (!isGlobal) return getDetailPopulation(id, filterParams)

      const year = id
      return getDetailPopulationGlobal(year, filterParams)
    },
    placeholderData: keepPreviousData,
    enabled: Boolean(filterParams.province_id),
  })

  const { mutate: handleExportPopulation, isPending: isPendingExport } =
    useMutation({
      mutationFn: () => exportPopulation(id, filterParams),
      onSuccess: () => {
        toast.success({ description: t('population:toast.export.success') })
      },
      onError: (err: AxiosError) => {
        toast.danger({
          description: err?.message || t('population:toast.export.error'),
        })
      },
    })

  const targetGroups = useMemo<string[]>(() => {
    if (!data || data.data.length === 0) return []

    return data.data[0].population.map((target) => target.name)
  }, [data])

  useSetLoadingPopupStore(isPendingExport)

  return {
    year: id,
    dataDetailPopulation: isFilterActive ? data : undefined,
    isFetchingDetailPopulation: isFetching,
    filter,
    isFilterActive,
    targetGroups,
    handleExportPopulation,
  }
}
