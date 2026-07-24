import { useParams, useSearchParams } from 'next/navigation'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from '#components/toast'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'
import useSmileRouter from '#hooks/useSmileRouter'
import { useLoadingPopupStore } from '#store/loading.store'
import { CommonType, ErrorResponse } from '#types/common'
import { AxiosError } from 'axios'
import { useTranslation } from 'react-i18next'

import {
  getAssetVendor,
  updateStatusAssetVendor,
} from '../asset-vendor.service'
import { CreateAssetVendorBody, ParamData } from '../asset-vendor.type'

export const useAssetVendorDetail = ({ isGlobal = false }: CommonType = {}) => {
  const { t } = useTranslation(['common', 'assetVendor'])
  const params = useParams()
  const queryClient = useQueryClient()
  const { setLoadingPopup } = useLoadingPopupStore()
  const { pushGlobal } = useSmileRouter()
  const searchParams = useSearchParams()
  const isFromDetail = searchParams.get('fromPage') === 'detail'
  const detailPath = isFromDetail && params?.id ? params.id : ''

  const backUrl = () => {
    return pushGlobal(`/v5/global-settings/asset/vendor/${detailPath}`)
  }

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['asset-vendor-detail', params?.id],
    queryFn: () => getAssetVendor(Number(params?.id), isGlobal),
    enabled: Boolean(params?.id),
    refetchOnWindowFocus: false,
  })

  const defaultValue: CreateAssetVendorBody = {
    name: data?.name,
    description: data?.description,
    asset_vendor_type_id: {
      label: data?.asset_vendor_type?.name || '',
      value: data?.asset_vendor_type?.id,
    },
    ...(isGlobal && {
      program_ids: data?.programs?.map((item) => item.id),
    }),
  }

  const { mutate: onUpdateStatus, isPending: isUpdateStatus } = useMutation({
    mutationFn: (data: ParamData) =>
      updateStatusAssetVendor(data?.id, data?.status),
    onMutate: () => setLoadingPopup(true),
    onSettled: () => {
      setLoadingPopup(false)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['asset-vendor-detail'],
      })
      toast.success({
        description: t('common:message.success.update', {
          type: t('assetVendor:list.status')?.toLowerCase(),
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
    data,
    isLoading: isLoading || isFetching,
    defaultValue,
    t,
    onUpdateStatus,
    isUpdateStatus,
    handleBackToList: backUrl,
  }
}
