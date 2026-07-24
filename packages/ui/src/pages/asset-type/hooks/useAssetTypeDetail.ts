import { useParams, useSearchParams } from 'next/navigation'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from '#components/toast'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'
import useSmileRouter from '#hooks/useSmileRouter'
import { CommonType, ErrorResponse } from '#types/common'
import { AxiosError } from 'axios'
import { useTranslation } from 'react-i18next'

import {
  getAssetType,
  updateStatusAssetTypeInProgram,
} from '../asset-type.service'
import { CreateAssetTypeBody, ParamData } from '../asset-type.type'

export const useAssetTypeDetail = ({ isGlobal = false }: CommonType = {}) => {
  const { t } = useTranslation(['common', 'assetType'])
  const params = useParams()
  const { pushGlobal } = useSmileRouter()
  const queryClient = useQueryClient()
  const searchParams = useSearchParams()
  const isFromDetail = searchParams.get('fromPage') === 'detail'
  const detailPath = isFromDetail && params?.id ? params.id : ''

  const backUrl = () => {
    return pushGlobal(`/v5/global-settings/asset/type/${detailPath}`)
  }

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['asset-type-detail', params?.id],
    queryFn: () => getAssetType(Number(params?.id), isGlobal),
    enabled: Boolean(params?.id),
    refetchOnWindowFocus: false,
  })

  const defaultValue: CreateAssetTypeBody = {
    name: data?.name ?? null,
    description: data?.description ?? null,
    is_cce: data?.is_cce ?? 0,
    is_cce_warehouse: data?.is_cce_warehouse ?? 0,
    is_warehouse: data?.is_warehouse ?? 0,
    is_temperature_adjustable: data?.is_temperature_adjustable ?? 0,
    temperature_thresholds:
      data?.temperature_thresholds?.map((item) => ({
        id: item.temperature_threshold_id,
      })) ?? undefined,
    is_related_asset: data?.is_related_asset ?? 0,
    humidity_thresholds:
      data?.humidity_thresholds?.map((item) => ({
        id: item.humidity_threshold_id,
      })) ?? undefined,
  }

  const { mutate: onUpdateStatus, isPending: isUpdateStatus } = useMutation({
    mutationFn: (data: ParamData) =>
      updateStatusAssetTypeInProgram(data?.id, data?.status),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['asset-type-detail'],
      })
      toast.success({
        description: t('common:message.success.update', {
          type: t('assetType:list.status')?.toLowerCase(),
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

  useSetLoadingPopupStore(isLoading || isFetching)

  return {
    t,
    data,
    isLoading: isLoading || isFetching,
    defaultValue,
    onUpdateStatus,
    isUpdateStatus,
    handleBackToList: () => backUrl(),
  }
}
