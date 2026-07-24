import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import {
  CreateMaterialVolumeInput,
  getMaterialVolume,
} from '#services/material-volume'
import { useTranslation } from 'react-i18next'

export const useMaterialVolumeDetail = () => {
  const { t } = useTranslation(['common', 'materialVolume'])
  const params = useParams()

  const { data, error, isLoading, isFetching } = useQuery({
    queryKey: ['material-volume-detail', params?.id],
    queryFn: () => getMaterialVolume(Number(params?.id)),
    enabled: Boolean(params?.id),
    refetchOnWindowFocus: false,
  })

  const defaultValue: CreateMaterialVolumeInput = {
    material_id: data?.material?.id
      ? {
          value: data?.material?.id,
          label: data?.material?.name,
        }
      : null,
    manufacture_id: data?.manufacture?.id
      ? {
          value: data?.manufacture?.id,
          label: data?.manufacture?.name,
        }
      : null,
    box_length: data?.box_length ?? null,
    box_width: data?.box_width ?? null,
    box_height: data?.box_height ?? null,
    unit_per_box: data?.unit_per_box ?? null,
    consumption_unit_per_distribution_unit:
      data?.material?.consumption_unit_per_distribution_unit ?? null,
  }

  return {
    data,
    isLoading: isLoading || isFetching,
    defaultValue,
    error,
    t,
  }
}
