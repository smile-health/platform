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

import { createPQS, updatePQS } from '../pqs.service'
import {
  CreatePQSFormInput,
  CreatePQSPayload,
  PQSFormProps,
} from '../pqs.types'
import { formSchema } from '../schema/PQSSchemaForm'
import { handleDefaultValue } from '../utils/helper'

export const usePQSCreateEdit = ({ defaultValues }: PQSFormProps = {}) => {
  const { t } = useTranslation(['common', 'pqs'])
  const params = useParams()
  const { pushGlobal, getAsLinkGlobal } = useSmileRouter()
  const searchParams = useSearchParams()
  const isEdit = Boolean(params?.id)
  const methods = useForm<CreatePQSFormInput>({
    resolver: yupResolver(formSchema(t)),
    mode: 'onChange',
    defaultValues: handleDefaultValue(defaultValues),
  })
  const { handleSubmit, setError } = methods

  const { mutate, isPending } = useMutation({
    mutationFn: (data: unknown) =>
      isEdit
        ? updatePQS(params?.id?.toString(), data as CreatePQSPayload)
        : createPQS(data as CreatePQSPayload),
    onSuccess: () => {
      toast.success({
        duration: 10000,
        description: t(
          isEdit
            ? 'common:message.success.update'
            : 'common:message.success.create',
          {
            type: t('pqs:title.list')?.toLowerCase(),
          }
        ),
      })
      pushGlobal('/v5/global-settings/asset/pqs')
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        const response = error.response?.data as ErrorResponse
        toast.danger({ description: response.message })
        if (response.errors) {
          for (const item of Object.keys(response.errors)) {
            setError(item as keyof CreatePQSFormInput, {
              message: response.errors[item][0],
            })
          }
        }
      }
    },
  })

  const onValid: SubmitHandler<CreatePQSFormInput> = (formData) => {
    const payload: CreatePQSPayload = {
      code: formData.code,
      pqs_type_id: formData.pqs_type_id?.value,
      cceigat_description_id: formData.cceigat_description_id?.value,
      net_capacity5: formData.net_capacity5,
      net_capacityMin20: formData.net_capacityMin20,
      net_capacityMin86: formData.net_capacityMin86,
    }
    mutate(payload)
  }

  const backUrl = () => {
    const isFromDetail = searchParams.get('fromPage') === 'detail'
    const detailPath = isFromDetail && params?.id ? params.id : ''

    return getAsLinkGlobal(`/v5/global-settings/asset/pqs/${detailPath}`)
  }

  useSetLoadingPopupStore(isPending)

  return {
    onSubmit: handleSubmit(onValid),
    isPending,
    t,
    methods,
    backUrl,
    isEdit,
  }
}
