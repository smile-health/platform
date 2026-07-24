import { yupResolver } from '@hookform/resolvers/yup'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from '#components/toast'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'
import { AxiosError } from 'axios'
import { SubmitHandler, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import * as yup from 'yup'

import { TAssetInventory } from '../../asset-inventory/list/libs/asset-inventory-list.types'
import { upsertLoggerRelation } from '../asset-managements.service'
import {
  TCreateLoggerPayload,
  TCreateLoggerSubmit,
  TCreateWarehousePayload,
  TCreateWarehouseSubmit,
  TRelationData,
} from '../asset-managements.types'
import { MonitoringDeviceInventoryDetail } from '../monitoring-device-inventory/MonitoringDeviceInventoryDetail/monitoring-device-inventory.type'

export const useLoggerRelationCreateEdit = ({
  onHandleSuccess,
  isDelete = false,
  detailData,
  loggerData,
  isWarehouse,
}: {
  onHandleSuccess: () => void
  isDelete?: boolean
  detailData?: TAssetInventory | MonitoringDeviceInventoryDetail
  loggerData?: TRelationData[]
  isWarehouse?: boolean
}) => {
  const { t } = useTranslation(['common', 'assetInventory'])
  const { id } = detailData ?? {}

  const defaultRelationSchema = yup.object().shape({
    monitoring_device: yup
      .object()
      .shape({
        value: yup.mixed().nullable(),
        label: yup.string(),
      })
      .required(t('common:validation.required')),
    sensor_qty: yup
      .object()
      .shape({
        value: yup.mixed().nullable(),
        label: yup.string(),
      })
      .required(t('common:validation.required')),
  })

  const warehouseRelationSchema = yup.object().shape({
    monitoring_device: yup
      .object()
      .shape({
        value: yup.mixed().nullable(),
        label: yup.string(),
      })
      .required(t('common:validation.required')),
    description: yup.string().nullable().notRequired(),
  })

  const queryClient = useQueryClient()
  const methods = useForm<TCreateLoggerSubmit | TCreateWarehouseSubmit>({
    defaultValues: isWarehouse
      ? {
          monitoring_device: null,
          description: null,
        }
      : {
          monitoring_device: null,
          sensor_qty: null,
        },
    mode: 'onChange',
    resolver: yupResolver(
      isWarehouse ? warehouseRelationSchema : defaultRelationSchema
    ),
  })

  const { handleSubmit } = methods

  const {
    mutate: addRemoveLoggerRelation,
    isPending: isPendingAddLoggerRelation,
  } = useMutation({
    mutationFn: (payload?: TCreateLoggerPayload | TCreateWarehousePayload) =>
      upsertLoggerRelation(Number(id), payload),
    onSuccess: () => {
      toast.success({
        description: isDelete
          ? t('common:message.success.delete', {
              type: t(
                'assetInventory:device_relation.title.label'
              )?.toLowerCase(),
            })
          : t('common:message.success.create', {
              type: t(
                'assetInventory:device_relation.title.label'
              )?.toLowerCase(),
            }),
      })
      queryClient.refetchQueries({
        queryKey: [
          `asset-inventory-detail-${Number(id)}`,
          'logger-relation-list',
        ],
      })
      onHandleSuccess()
    },
    onError: (error: AxiosError) => {
      const { message } = error.response?.data as { message: string }
      toast.danger({ description: message })
    },
  })

  const onValid: SubmitHandler<TCreateLoggerSubmit | TCreateWarehouseSubmit> = (
    formData
  ) => {
    const payload: TCreateLoggerPayload | TCreateWarehousePayload = [
      {
        id: Number(formData.monitoring_device?.value),
        ...(isWarehouse
          ? { description: (formData as TCreateWarehouseSubmit).description }
          : {
              sensor_qty: Number(
                (formData as TCreateLoggerSubmit).sensor_qty?.value
              ),
            }),
      },
      ...(loggerData?.map((item) => ({
        id: item?.id,
        ...(isWarehouse
          ? { description: item?.description }
          : { sensor_qty: item?.sensor_qty }),
      })) || []),
    ]
    addRemoveLoggerRelation(payload)
    methods.reset()
  }

  const onRemoveLoggerRelation = (id: number) => {
    const payload = loggerData
      ?.filter((item) => item?.id !== id)
      ?.map((item) => ({
        id: item?.id,
        ...(isWarehouse
          ? { description: item?.description }
          : { sensor_qty: item?.sensor_qty }),
      }))
    addRemoveLoggerRelation(payload)
    onHandleSuccess()
  }

  useSetLoadingPopupStore(isPendingAddLoggerRelation)

  return {
    t,
    methods,
    isLoading: isPendingAddLoggerRelation,
    handleSubmit: handleSubmit(onValid),
    onRemoveLoggerRelation,
  }
}
