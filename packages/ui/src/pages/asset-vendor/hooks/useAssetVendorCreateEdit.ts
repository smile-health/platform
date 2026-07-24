import { useParams, useSearchParams } from 'next/navigation'
import { yupResolver } from '@hookform/resolvers/yup'
import { useMutation } from '@tanstack/react-query'
import { toast } from '#components/toast'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'
import useSmileRouter from '#hooks/useSmileRouter'
import { ErrorResponse } from '#types/common'
import { AxiosError } from 'axios'
import { SubmitHandler, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { createAssetVendor, updateAssetVendor } from '../asset-vendor.service'
import {
  AssetVendorFormProps,
  CreateAssetVendorBody,
  CreateAssetVendorPayload,
} from '../asset-vendor.type'
import { formSchema } from '../schema/AssetVendorSchemaForm'
import { handleDefaultValue } from '../utils/helper'

export const useAssetVendorCreateEdit = ({
  defaultValues,
}: AssetVendorFormProps = {}) => {
  const { t } = useTranslation(['common', 'assetVendor'])
  const params = useParams()
  const { pushGlobal, getAsLinkGlobal } = useSmileRouter()
  const searchParams = useSearchParams()
  const isEdit = Boolean(params?.id)
  const methods = useForm<CreateAssetVendorBody>({
    resolver: yupResolver(formSchema(t)),
    mode: 'onChange',
    defaultValues: handleDefaultValue(defaultValues),
  })
  const { handleSubmit, setError } = methods

  const { mutate, isPending } = useMutation({
    mutationFn: (data: unknown) =>
      isEdit
        ? updateAssetVendor(
            params?.id?.toString(),
            data as CreateAssetVendorPayload
          )
        : createAssetVendor(data as CreateAssetVendorPayload),
    onSuccess: () => {
      toast.success({
        description: t(
          isEdit
            ? 'common:message.success.update'
            : 'common:message.success.create',
          {
            type: t('assetVendor:list.title')?.toLowerCase(),
          }
        ),
      })
      pushGlobal('/v5/global-settings/asset/vendor')
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        const response = error.response?.data as ErrorResponse
        toast.danger({ description: response.message })
        if (response?.errors) {
          for (const item of Object.keys(response.errors)) {
            setError(item as keyof CreateAssetVendorBody, {
              message: response.errors[item][0],
            })
          }
        }
      }
    },
  })

  const onValid: SubmitHandler<CreateAssetVendorBody> = (formData) => {
    const payload: CreateAssetVendorPayload = {
      name: formData?.name,
      description: formData?.description,
      asset_vendor_type_id: formData?.asset_vendor_type_id?.value,
    }
    mutate(payload)
  }

  const backUrl = () => {
    const isFromDetail = searchParams.get('fromPage') === 'detail'
    const detailPath = isFromDetail && params?.id ? params.id : ''

    return getAsLinkGlobal(`/v5/global-settings/asset/vendor/${detailPath}`)
  }

  useSetLoadingPopupStore(isPending)

  return {
    onSubmit: handleSubmit(onValid),
    isPending,
    t,
    methods,
    backUrl,
  }
}
