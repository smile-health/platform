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

import { createAssetType, updateAssetType } from '../asset-type.service'
import { AssetTypeFormProps, CreateAssetTypeBody } from '../asset-type.type'
import { formSchema } from '../schema/AssetTypeSchemaForm'
import { handleDefaultValue } from '../utils/helper'

export const useAssetTypeCreateEdit = ({
  defaultValues,
}: AssetTypeFormProps = {}) => {
  const { t } = useTranslation(['common', 'assetType'])
  const params = useParams()
  const { pushGlobal, getAsLinkGlobal } = useSmileRouter()
  const searchParams = useSearchParams()
  const isEdit = Boolean(params?.id)
  const methods = useForm<CreateAssetTypeBody>({
    resolver: yupResolver(formSchema(t)),
    mode: 'onChange',
    defaultValues: handleDefaultValue(defaultValues),
  })
  const { handleSubmit, setError } = methods

  const { mutate, isPending } = useMutation({
    mutationFn: (data: unknown) =>
      isEdit
        ? updateAssetType(params?.id?.toString(), data as CreateAssetTypeBody)
        : createAssetType(data as CreateAssetTypeBody),
    onSuccess: () => {
      toast.success({
        description: t(
          isEdit
            ? 'common:message.success.update'
            : 'common:message.success.create',
          { type: t('assetType:list.title')?.toLowerCase() }
        ),
      })
      pushGlobal(`/v5/global-settings/asset/type`)
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        const response = error.response?.data as ErrorResponse
        toast.danger({ description: response.message })
        if (response?.errors) {
          for (const item of Object.keys(response.errors)) {
            setError(item as keyof CreateAssetTypeBody, {
              message: response.errors[item][0],
            })
          }
        }
      }
    },
  })

  const onValid: SubmitHandler<CreateAssetTypeBody> = (formData) => {
    mutate(formData)
  }

  const backUrl = () => {
    const isFromDetail = searchParams.get('fromPage') === 'detail'
    const detailPath = isFromDetail && params?.id ? params.id : ''

    return getAsLinkGlobal(`/v5/global-settings/asset/type/${detailPath}`)
  }

  useSetLoadingPopupStore(isPending)

  return {
    onSubmit: handleSubmit(onValid),
    isEdit,
    isPending,
    t,
    methods,
    backUrl,
  }
}
