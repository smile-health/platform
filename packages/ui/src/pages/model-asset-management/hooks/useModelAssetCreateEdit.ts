import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { yupResolver } from '@hookform/resolvers/yup'
import { useMutation, useQuery } from '@tanstack/react-query'
import { toast } from '#components/toast'
import { useDebounce } from '#hooks/useDebounce'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'
import useSmileRouter from '#hooks/useSmileRouter'
import { ErrorResponse } from '#types/common'
import { AxiosError } from 'axios'
import { SubmitHandler, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { getAssetTypeTemperatureTresholds } from '../../asset-type/asset-type.service'
import { AssetUtilization } from '../asset-model.constants'
import {
  CreateModelAssetBody,
  CreateModelAssetPayload,
  ModelAssetFormProps,
} from '../asset-model.type'
import {
  createModelAsset,
  getCoreModelAsset,
  updateModelAsset,
} from '../model-asset.service'
import { formSchema } from '../schema/ModelAssetSchemaForm'
import { handleDefaultValue } from '../utils/helper'

export const useModelAssetCreateEdit = ({
  defaultValues,
}: ModelAssetFormProps = {}) => {
  const { t } = useTranslation(['common', 'modelAsset'])
  const params = useParams()
  const { pushGlobal, getAsLinkGlobal } = useSmileRouter()
  const searchParams = useSearchParams()
  const isEdit = Boolean(params?.id)
  const [isNameDuplicate, setIsNameDuplicate] = useState(false)
  const [searchName, setSearchName] = useState('')

  const methods = useForm<CreateModelAssetBody>({
    resolver: yupResolver(formSchema(t)),
    mode: 'onSubmit',
    defaultValues: handleDefaultValue(defaultValues),
  })
  const { handleSubmit, setError, trigger } = methods
  const { mutate, isPending } = useMutation({
    mutationFn: (data: unknown) =>
      isEdit
        ? updateModelAsset(params?.id?.toString(), data as CreateModelAssetBody)
        : createModelAsset(data as CreateModelAssetBody),
    onSuccess: () => {
      toast.success({
        description: t(
          isEdit
            ? 'common:message.success.update'
            : 'common:message.success.create',
          {
            type: t('modelAsset:list.title')?.toLowerCase(),
          }
        ),
      })
      pushGlobal('/v5/global-settings/asset/model')
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        const response = error.response?.data as ErrorResponse
        toast.danger({ description: response.message })
        if (response?.errors) {
          for (const item of Object.keys(response.errors)) {
            setError(item as keyof CreateModelAssetBody, {
              message: response.errors[item][0],
            })
          }
        }
      }
    },
  })

  const onValid: SubmitHandler<CreateModelAssetBody> = async (formData) => {
    const isValid = await trigger()
    if (!isValid) return

    const nonWarehouseCapacityData = formData?.asset_type_id?.data?.is_cce
      ? formData?.asset_type_id?.data?.is_cce
      : formData.is_capacity

    const payload: CreateModelAssetPayload = {
      name: formData.name,
      asset_type_id: Number(formData.asset_type_id?.value),
      manufacture_id: Number(formData.manufacture_id?.value),
      is_capacity:
        formData?.asset_utilization?.id !== AssetUtilization.Warehouse
          ? nonWarehouseCapacityData
          : 0,
      asset_model_capacity:
        (formData?.asset_type_id?.data?.is_cce || formData.is_capacity) &&
        formData?.asset_utilization?.id !== AssetUtilization.Warehouse
          ? {
              pqs_code_id: formData.asset_model_capacity?.pqs_code_id?.value
                ? Number(formData.asset_model_capacity?.pqs_code_id?.value)
                : null,
              capacities: formData.asset_model_capacity?.capacities
                ?.filter((item) => Boolean(item.gross_capacity))
                .map((item) => ({
                  ...(isEdit && { id: item?.id || undefined }),
                  id_temperature_threshold: item.id_temperature_threshold,
                  net_capacity: Number(item.net_capacity),
                  gross_capacity: Number(item.gross_capacity),
                })),
            }
          : null,
      ...(formData?.asset_utilization?.id === AssetUtilization.Warehouse && {
        temperatures_warehouse_capacities: isEdit
          ? formData?.asset_model_capacity?.capacities?.map((item) => ({
              id: item?.id,
              temperature_threshold_id: item.id_temperature_threshold,
            }))
          : formData?.asset_type_id?.data?.temperature_thresholds?.map(
              (threshold) => ({
                id: threshold?.asset_type_temperature_id
                  ? threshold?.asset_type_temperature_id
                  : null,
                temperature_threshold_id: threshold?.temperature_threshold_id
                  ? Number(threshold?.temperature_threshold_id)
                  : null,
              })
            ),
      }),
    }

    mutate(payload)
  }

  const backUrl = () => {
    const isFromDetail = searchParams.get('fromPage') === 'detail'
    const detailPath = isFromDetail && params?.id ? params.id : ''

    return getAsLinkGlobal(`/v5/global-settings/asset/model/${detailPath}`)
  }

  useSetLoadingPopupStore(isPending)

  const debounceName = useDebounce(searchName, 500)

  const modelAssetsQuery = useQuery({
    queryKey: ['model-asset', debounceName],
    queryFn: () =>
      getCoreModelAsset(
        {
          page: 1,
          paginate: 10,
          keyword: debounceName,
        },
        true
      ),
    enabled: Boolean(debounceName),
  })

  useEffect(() => {
    if (!searchName) {
      setIsNameDuplicate(false)
      return
    }

    const items = modelAssetsQuery.data?.data ?? []
    const normalized = searchName.toLowerCase()

    const exists = items.some((item) => {
      const itemName = (item?.name ?? item?.asset_model_name ?? '')
        .trim()
        .toLowerCase()
      if (isEdit && String(item?.id) === String(params?.id)) return false
      return itemName === normalized
    })

    setIsNameDuplicate(exists)
  }, [debounceName, modelAssetsQuery.data, isEdit, params?.id])

  const { data: temperatureThresholds, isLoading: isLoadingThresholds } =
    useQuery({
      queryKey: ['temperature-thresholds'],
      queryFn: () =>
        getAssetTypeTemperatureTresholds({
          page: 1,
          paginate: 10,
          is_predefined: 1,
        }),
      select: (data) =>
        data?.data
          ?.toSorted(
            (a, b) =>
              Math.abs(a.min_temperature ?? 0) -
              Math.abs(b.min_temperature ?? 0)
          )
          ?.map((threshold) => threshold?.id),
    })

  return {
    onSubmit: handleSubmit(onValid),
    setSearchName,
    isEdit,
    isPending,
    t,
    methods,
    modelAssetsQuery,
    backUrl,
    isNameDuplicate,
    temperatureThresholds,
    isLoadingThresholds,
  }
}
