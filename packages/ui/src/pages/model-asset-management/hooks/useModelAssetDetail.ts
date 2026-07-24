import { useParams, useSearchParams } from 'next/navigation'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from '#components/toast'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'
import useSmileRouter from '#hooks/useSmileRouter'
import { CommonType, ErrorResponse } from '#types/common'
import { AxiosError } from 'axios'
import { useTranslation } from 'react-i18next'

import { CreateModelAssetBody, ParamData } from '../asset-model.type'
import { getModelAsset, updateStatusModelAsset } from '../model-asset.service'
import { handleAssetUtilizationId } from '../utils/helper'

export const useModelAssetDetail = ({ isGlobal = false }: CommonType = {}) => {
  const { t } = useTranslation(['common', 'modelAsset'])
  const params = useParams()
  const { pushGlobal } = useSmileRouter()
  const queryClient = useQueryClient()
  const searchParams = useSearchParams()
  const isFromDetail = searchParams.get('fromPage') === 'detail'
  const detailPath = isFromDetail && params?.id ? params.id : ''

  const backUrl = () => {
    return pushGlobal(`/v5/global-settings/asset/model/${detailPath}`)
  }

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['model-asset-detail', params?.id],
    queryFn: () => getModelAsset(Number(params?.id), isGlobal),
    enabled: Boolean(params?.id),
    refetchOnWindowFocus: false,
  })

  const defaultValue: CreateModelAssetBody = {
    asset_utilization: data
      ? {
          is_warehouse: data?.is_warehouse,
          is_cce: data?.is_cce,
          id: handleAssetUtilizationId(data?.is_warehouse, data?.is_cce)?.value,
        }
      : undefined,
    name: data?.asset_model_name || '',
    asset_type_id: {
      label: data?.asset_type_name || '',
      value: data?.asset_type_id || 0,
    },
    manufacture_id: {
      label: data?.manufacture_name || '',
      value: data?.manufacture_id || 0,
    },
    is_capacity: data?.capacities?.length ? 1 : 0,
    is_related_asset: data?.is_related_asset,
    asset_model_capacity: {
      pqs_code_id: data?.pqs_code_id
        ? {
            label: (() => {
              const whoCaps =
                data?.net_capacities_who
                  ?.map((item) => {
                    const categoryStr = String(item?.category ?? '')
                    const capacityStr = String(item?.net_capacity ?? '')
                    const litreStr = t('common:litre')
                    return (
                      '[' +
                      categoryStr +
                      '°C: ' +
                      capacityStr +
                      ' ' +
                      litreStr +
                      ']'
                    )
                  })
                  ?.join(', ') ?? ''
              const codeStr = String(data?.pqs_code ?? '')
              return codeStr + ' (' + whoCaps + ')'
            })(),
            value: data?.pqs_code_id || 0,
          }
        : null,
      capacities: data?.capacities?.every((item) => item?.category)
        ? data?.capacities?.map((item) => ({
            id: item?.id || undefined,
            category: item?.category || 0,
            net_capacity: item?.net_capacity || 0,
            gross_capacity: item?.gross_capacity || 0,
            id_temperature_threshold: item?.temperature_threshold_id || 0,
          })) || []
        : data?.capacities?.map((item) => ({
            id: item?.id || undefined,
            id_temperature_threshold: item?.temperature_threshold_id
              ? item?.temperature_threshold_id
              : null,
            net_capacity: item?.net_capacity || 0,
            gross_capacity: item?.gross_capacity || 0,
          })) || [],
    },
  }

  const { mutate: onUpdateStatus, isPending: isUpdateStatus } = useMutation({
    mutationFn: (data: ParamData) =>
      updateStatusModelAsset(data?.id, data?.status),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['model-asset-detail'],
      })
      toast.success({
        description: t('common:message.success.update', {
          type: t('modelAsset:list.status')?.toLowerCase(),
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
    data: data,
    isLoading: isLoading || isFetching,
    defaultValue,
    t,
    onUpdateStatus,
    isUpdateStatus,
    handleBackToList: () => backUrl(),
  }
}
