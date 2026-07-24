import { useParams } from 'next/navigation'
import { yupResolver } from '@hookform/resolvers/yup'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from '#components/toast'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'
import useSmileRouter from '#hooks/useSmileRouter'
import { ErrorResponse } from '#types/common'
import { AxiosError } from 'axios'
import { useState } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import {
  createAnalysisParameter,
  createUnit,
  updateAnalysisParameter,
} from '../analysis-parameter.service'
import {
  AnalysisParameterFormProps,
  AnalysisParameterFormValues,
  CreateAnalysisParameterBody,
} from '../analysis-parameter.type'
import { schemaInput } from '../schema/AnalysisParameterSchemaInput'

export const useAnalysisParameterCreateEdit = ({
  isEdit,
  defaultValues,
}: AnalysisParameterFormProps) => {
  const router = useSmileRouter()
  const params = useParams()
  const { t } = useTranslation(['common', 'analysisParameter'])
  const id = isEdit ? params?.id?.toString() : undefined

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
    control,
    watch,
  } = useForm<AnalysisParameterFormValues>({
    resolver: yupResolver(schemaInput(t)),
    mode: 'onBlur' as const,
    defaultValues: {
      name: defaultValues?.name ?? '',
      unit_id: defaultValues?.unit_id ?? null,
      custom_unit_name: '',
    },
  })

  const queryClient = useQueryClient()
  const { mutate, isPending } = useMutation({
    mutationFn: (data: CreateAnalysisParameterBody) =>
      isEdit
        ? updateAnalysisParameter(id as string, data)
        : createAnalysisParameter(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analysis-parameters'] })
      queryClient.invalidateQueries({ queryKey: ['analysis-parameter-detail'] })
      toast.success({
        description: t(
          isEdit
            ? 'common:message.success.update'
            : 'common:message.success.create',
          {
            type: t('analysisParameter:title.detail')?.toLowerCase(),
          }
        ),
      })
      router.push('/v5/analysis-parameter')
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        const response = error.response?.data as ErrorResponse
        toast.danger({ description: response.message })
        for (const item of Object.keys(response?.errors ?? {})) {
          setError(item as keyof AnalysisParameterFormValues, {
            message: response?.errors?.[item]?.[0],
          })
        }
      }
    },
  })

  const FREE_TEXT_VALUE = -1
  const [isSubmitting, setIsSubmitting] = useState(false)

  const onValid: SubmitHandler<AnalysisParameterFormValues> = async (formData) => {
    setIsSubmitting(true)
    try {
      let unitId = formData.unit_id

      if (unitId === FREE_TEXT_VALUE) {
        const res = await createUnit({ name: formData.custom_unit_name })
        unitId = res.data.id
        queryClient.invalidateQueries({ queryKey: ['units'] })
      }

      const data: CreateAnalysisParameterBody = {
        name: formData.name,
        unit_id: unitId,
        result_data_type: null,
      }
      mutate(data)
    } catch (error) {
      if (error instanceof AxiosError) {
        const response = error.response?.data as ErrorResponse
        toast.danger({ description: response.message })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  useSetLoadingPopupStore(isPending || isSubmitting)

  return {
    register,
    handleSubmit,
    errors,
    onValid,
    control,
    watch,
    isPending: isPending || isSubmitting,
    FREE_TEXT_VALUE,
  }
}
