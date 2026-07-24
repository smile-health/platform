import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { useParams } from 'next/navigation'
import { yupResolver } from '@hookform/resolvers/yup'
import { useQuery } from '@tanstack/react-query'
import { toast } from '#components/toast'
import { usePermission } from '#hooks/usePermission'
import useSmileRouter from '#hooks/useSmileRouter'
import { listAssetType } from '#services/asset-type'
import { FormProvider, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import {
  ASSET_TYPE_RTMD_ID,
  CONTACT_PERSON_INDICES,
  MONITORING_DEVICE_INVENTORY_STATUS,
} from '../monitoring-device-inventory.constants'
import { getMonitoringDeviceInventoryDetail } from '../MonitoringDeviceInventoryDetail/monitoring-device-inventory-detail.service'
import { monitoringDeviceInventoryFormSchema } from './monitoring-device-inventory-form.schema'
import {
  createMonitoringDeviceInventory,
  updateMonitoringDeviceInventory,
} from './monitoring-device-inventory-form.service'
import { FormValues } from './monitoring-device-inventory-form.type'

type MonitoringDeviceInventoryFormContextValue = {
  form: {
    values: FormValues
    reset: () => void
    submit: () => void
  }
  mode: 'create' | 'edit'
  isGlobal: boolean
  isLoading: boolean
}

export const MonitoringDeviceInventoryFormContext = createContext<
  MonitoringDeviceInventoryFormContextValue | undefined
>(undefined)

type MonitoringDeviceInventoryFormProviderProps = PropsWithChildren & {
  isGlobal?: boolean
  mode?: 'create' | 'edit'
}

export const MonitoringDeviceInventoryFormProvider = ({
  children,
  isGlobal = false,
  mode = 'create',
}: MonitoringDeviceInventoryFormProviderProps) => {
  usePermission('monitoring-device-inventory-global-mutate')

  const { t } = useTranslation(['common', 'monitoringDeviceInventoryForm'])
  const router = useSmileRouter()
  const params = useParams()
  const [_, setIsSubmitting] = useState(false)

  const id = mode === 'edit' ? (params.id as string) : undefined

  const { data: assetTypeData } = useQuery({
    queryKey: ['asset-type-rtmd', isGlobal],
    queryFn: () =>
      listAssetType({
        page: 1,
        paginate: 10,
        status: 1,
        type_by: 'rtmd',
      }),
    enabled: mode === 'create',
  })

  const defaultValues: Partial<FormValues> = useMemo(() => {
    const assetTypeFromApi =
      assetTypeData?.data && assetTypeData.data.length > 0
        ? {
            label: assetTypeData.data[0].name,
            value: assetTypeData.data[0].id,
          }
        : {
            label: t(
              'monitoringDeviceInventoryForm:field.asset_type.placeholder'
            ),
            value: ASSET_TYPE_RTMD_ID,
          }

    return {
      asset_type_id: assetTypeFromApi,
      asset_model_id: null,
      manufacture_id: null,
      asset_vendor_id: null,
      asset_communication_provider: null,
      serial_number: '',
      production_year: null,
      asset_rtmd_status_id: null,
      entity_id: null,
      contact_person_user_1_name: '',
      contact_person_user_1_number: '',
      contact_person_user_2_name: '',
      contact_person_user_2_number: '',
      contact_person_user_3_name: '',
      contact_person_user_3_number: '',
      budget_year: null,
      budget_source_id: null,
    }
  }, [t, assetTypeData])

  const methods = useForm<FormValues>({
    resolver: yupResolver(monitoringDeviceInventoryFormSchema(t)),
    defaultValues,
    mode: 'onBlur',
  })

  const { handleSubmit, reset, getValues, setError } = methods

  const { data: detailData, isLoading: isLoadingDetail } = useQuery({
    queryKey: ['monitoring-device-inventory-detail', id],
    queryFn: () => getMonitoringDeviceInventoryDetail(id!),
    enabled: mode === 'edit' && !!id,
  })

  useEffect(() => {
    if (
      mode === 'create' &&
      assetTypeData?.data &&
      assetTypeData.data.length > 0
    ) {
      reset({
        ...defaultValues,
        asset_type_id: {
          label: assetTypeData.data[0].name,
          value: assetTypeData.data[0].id,
        },
      })
    }
  }, [mode, assetTypeData, reset, defaultValues])

  useEffect(() => {
    if (mode === 'edit' && detailData) {
      const formData: Partial<FormValues> = {
        asset_type_id: detailData.asset_type?.id
          ? {
              label: detailData.asset_type.name || '',
              value: detailData.asset_type.id,
            }
          : null,
        asset_model_id: detailData.asset_model?.id
          ? {
              label: detailData.asset_model.name || '',
              value: detailData.asset_model.id,
            }
          : null,
        manufacture_id: detailData.manufacturer?.id
          ? {
              label: detailData.manufacturer.name || '',
              value: detailData.manufacturer.id,
            }
          : null,
        asset_vendor_id: detailData.asset_vendor?.id
          ? {
              label: detailData.asset_vendor.name || '',
              value: detailData.asset_vendor.id,
            }
          : null,
        asset_communication_provider: detailData.communication_provider?.id
          ? {
              label: detailData.communication_provider.name || '',
              value: detailData.communication_provider.id,
            }
          : null,
        serial_number: detailData.serial_number || '',
        production_year: detailData.production_year
          ? {
              label: String(detailData.production_year),
              value: detailData.production_year,
            }
          : null,
        asset_rtmd_status_id: detailData.rtmd_status?.id
          ? {
              label: detailData.rtmd_status.name || '',
              value: detailData.rtmd_status.id,
            }
          : null,
        entity_id: detailData.entity?.id
          ? {
              label: detailData.entity.name || '',
              value: detailData.entity.id,
            }
          : null,
        contact_person_user_1_name:
          detailData.contact_persons?.[CONTACT_PERSON_INDICES.FIRST]?.name ||
          '',
        contact_person_user_1_number:
          detailData.contact_persons?.[CONTACT_PERSON_INDICES.FIRST]?.phone ||
          '',
        contact_person_user_2_name:
          detailData.contact_persons?.[CONTACT_PERSON_INDICES.SECOND]?.name ||
          '',
        contact_person_user_2_number:
          detailData.contact_persons?.[CONTACT_PERSON_INDICES.SECOND]?.phone ||
          '',
        contact_person_user_3_name:
          detailData.contact_persons?.[CONTACT_PERSON_INDICES.THIRD]?.name ||
          '',
        contact_person_user_3_number:
          detailData.contact_persons?.[CONTACT_PERSON_INDICES.THIRD]?.phone ||
          '',
        budget_year: detailData.budget_year
          ? {
              label: String(detailData.budget_year),
              value: detailData.budget_year,
            }
          : null,
        budget_source_id: detailData.budget_source?.id
          ? {
              label: detailData.budget_source.name || '',
              value: detailData.budget_source.id,
            }
          : null,
      }

      reset(formData)
    }
  }, [mode, detailData, reset])

  const handleReset = useCallback(() => {
    reset(defaultValues)
  }, [reset, defaultValues])

  const onSubmit = async (data: FormValues) => {
    const contactPersons = []

    if (data.contact_person_user_1_name && data.contact_person_user_1_number) {
      contactPersons.push({
        name: data.contact_person_user_1_name,
        phone: data.contact_person_user_1_number,
      })
    }

    if (data.contact_person_user_2_name && data.contact_person_user_2_number) {
      contactPersons.push({
        name: data.contact_person_user_2_name,
        phone: data.contact_person_user_2_number,
      })
    }

    if (data.contact_person_user_3_name && data.contact_person_user_3_number) {
      contactPersons.push({
        name: data.contact_person_user_3_name,
        phone: data.contact_person_user_3_number,
      })
    }

    const payload = {
      asset_communication_provider_id: Number(
        data.asset_communication_provider?.value
      ),
      asset_model_id: Number(data.asset_model_id?.value),
      asset_rtmd_status_id: Number(data.asset_rtmd_status_id?.value),
      asset_type_id: Number(data.asset_type_id?.value),
      asset_vendor_id: Number(data.asset_vendor_id?.value),
      budget_source_id: Number(data.budget_source_id?.value),
      budget_year: Number(data.budget_year?.value),
      contact_persons: contactPersons,
      entity_id: Number(data.entity_id?.value),
      manufacture_id: Number(data.manufacture_id?.value),
      production_year: Number(data.production_year?.value),
      serial_number: data.serial_number,
      status: MONITORING_DEVICE_INVENTORY_STATUS.ACTIVE,
    }

    try {
      setIsSubmitting(true)

      if (mode === 'edit' && id) {
        await updateMonitoringDeviceInventory(id, payload)
        toast.success({
          description: t('monitoringDeviceInventoryForm:api.update_success'),
        })
      } else {
        await createMonitoringDeviceInventory(payload)
        toast.success({
          description: t('monitoringDeviceInventoryForm:api.create_success'),
        })
      }

      if (isGlobal) {
        router.pushGlobal(
          '/v5/global-asset/management/monitoring-device-inventory'
        )
      } else {
        router.push('/v5/asset-managements/monitoring-device-inventory')
      }
    } catch (error: unknown) {
      if (
        error &&
        typeof error === 'object' &&
        'response' in error &&
        error.response &&
        typeof error.response === 'object' &&
        'status' in error.response &&
        error.response.status === 422
      ) {
        const responseData =
          'data' in error.response ? error.response.data : null
        const apiErrors =
          responseData &&
          typeof responseData === 'object' &&
          'errors' in responseData
            ? (responseData.errors as Record<string, string[]>)
            : {}

        Object.keys(apiErrors).forEach((fieldName) => {
          const errorMessages = apiErrors[fieldName]
          if (Array.isArray(errorMessages) && errorMessages.length > 0) {
            setError(fieldName as keyof FormValues, {
              type: 'manual',
              message: errorMessages[0],
            })
          }
        })

        const apiMessage =
          responseData &&
          typeof responseData === 'object' &&
          'message' in responseData &&
          typeof responseData.message === 'string'
            ? responseData.message
            : mode === 'edit'
              ? t('monitoringDeviceInventoryForm:api.update_failed')
              : t('monitoringDeviceInventoryForm:api.create_failed')

        toast.danger({
          description: apiMessage,
        })
      } else {
        toast.danger({
          description:
            mode === 'edit'
              ? t('monitoringDeviceInventoryForm:api.update_failed')
              : t('monitoringDeviceInventoryForm:api.create_failed'),
        })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFormSubmit = handleSubmit(onSubmit)

  const contextValue = useMemo(
    () => ({
      form: {
        values: getValues(),
        reset: handleReset,
        submit: handleFormSubmit,
      },
      mode,
      isGlobal,
      isLoading: isLoadingDetail,
    }),
    [getValues, handleReset, handleFormSubmit, mode, isGlobal, isLoadingDetail]
  )

  return (
    <FormProvider {...methods}>
      <MonitoringDeviceInventoryFormContext.Provider value={contextValue}>
        {children}
      </MonitoringDeviceInventoryFormContext.Provider>
    </FormProvider>
  )
}

MonitoringDeviceInventoryFormContext.displayName =
  'MonitoringDeviceInventoryFormContext'

export const useMonitoringDeviceInventoryForm = () => {
  const context = useContext(MonitoringDeviceInventoryFormContext)

  if (!context) {
    throw new Error(
      'useMonitoringDeviceInventoryForm must be used within a MonitoringDeviceInventoryFormProvider'
    )
  }

  return context
}

export const MonitoringDeviceInventoryFormConsumer = ({
  children,
}: {
  children: (
    value: MonitoringDeviceInventoryFormContextValue
  ) => React.ReactNode
}) => {
  const monitoringDeviceInventoryForm = useMonitoringDeviceInventoryForm()
  return children(monitoringDeviceInventoryForm)
}
