import { useParams, useSearchParams } from 'next/navigation'
import { yupResolver } from '@hookform/resolvers/yup'
import { useMutation } from '@tanstack/react-query'
import { toast } from '#components/toast'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'
import useSmileRouter from '#hooks/useSmileRouter'
import {
  createMaterialVolume,
  CreateMaterialVolumeInput,
  CreateMaterialVolumePayload,
  updateMaterialVolume,
} from '#services/material-volume'
import { ErrorResponse } from '#types/common'
import { MaterialVolumeFormProps } from '#types/material-volume'
import { AxiosError } from 'axios'
import { SubmitHandler, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { formSchema } from '../schema/MaterialVolumeSchemaForm'
import { handleDefaultValue } from '../utils/helper'

export const useMaterialVolumeCreateEdit = ({
  isGlobal = true,
  defaultValues,
}: MaterialVolumeFormProps = {}) => {
  const { t } = useTranslation(['common', 'materialVolume'])
  const params = useParams()
  const { pushGlobal, getAsLinkGlobal } = useSmileRouter()
  const searchParams = useSearchParams()
  const isEdit = Boolean(params?.id)
  const methods = useForm<CreateMaterialVolumeInput>({
    resolver: yupResolver(formSchema(t)),
    mode: 'onChange',
    defaultValues: handleDefaultValue(defaultValues),
  })
  const { handleSubmit, setError } = methods

  const { mutate, isPending } = useMutation({
    mutationFn: (data: unknown) =>
      isEdit
        ? updateMaterialVolume(
            params?.id?.toString(),
            data as CreateMaterialVolumePayload
          )
        : createMaterialVolume(data as CreateMaterialVolumePayload),
    onSuccess: () => {
      toast.success({
        description: t(
          isEdit
            ? 'common:message.success.update'
            : 'common:message.success.create',
          {
            type: t('materialVolume:title.material_volume')?.toLowerCase(),
          }
        ),
      })
      pushGlobal('/v5/global-settings/material/volume')
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        const response = error.response?.data as ErrorResponse
        toast.danger({ description: response.message })
        if (response.errors) {
          for (const item of Object.keys(response.errors)) {
            setError(item as keyof CreateMaterialVolumeInput, {
              message: response.errors[item][0],
            })
          }
        }
      }
    },
  })

  const onValid: SubmitHandler<CreateMaterialVolumeInput> = (formData) => {
    const payload: CreateMaterialVolumePayload = {
      material_id: formData.material_id?.value,
      manufacture_id: formData.manufacture_id?.value,
      unit_per_box: formData.unit_per_box,
      consumption_unit_per_distribution_unit:
        formData.consumption_unit_per_distribution_unit,
      box_length: formData.box_length,
      box_width: formData.box_width,
      box_height: formData.box_height,
    }
    mutate(payload)
  }

  const backUrl = () => {
    const isFromDetail = searchParams.get('fromPage') === 'detail'
    const detailPath = isFromDetail && params?.id ? params.id : ''

    return getAsLinkGlobal(`/v5/global-settings/material/volume/${detailPath}`)
  }

  useSetLoadingPopupStore(isPending)

  return {
    onSubmit: handleSubmit(onValid),
    isPending,
    methods,
    backUrl,
    t,
  }
}
