import { useParams } from 'next/navigation'
import { yupResolver } from '@hookform/resolvers/yup'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from '#components/toast'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'
import useSmileRouter from '#hooks/useSmileRouter'
import { ErrorResponse } from '#types/common'
import { AxiosError } from 'axios'
import { SubmitHandler, useForm, useFieldArray } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import {
  createParameterCategory,
  updateParameterCategory,
} from '../parameter-category.service'
import {
  ParameterCategoryFormProps,
  ParameterCategoryFormValues,
  CreateParameterCategoryBody,
  UpdateParameterCategoryBody,
} from '../parameter-category.type'
import { schemaInput } from '../schema/ParameterCategorySchemaInput'

export const useParameterCategoryCreateEdit = ({
  isEdit,
  defaultValues,
}: ParameterCategoryFormProps) => {
  const router = useSmileRouter()
  const params = useParams()
  const { t } = useTranslation(['common', 'parameterCategory'])
  const id = isEdit ? params?.id?.toString() : undefined

  const {
    register,
    handleSubmit,
    setError,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ParameterCategoryFormValues>({
    resolver: yupResolver(schemaInput(t)),
    mode: 'onBlur',
    defaultValues: {
      name: defaultValues?.name ?? '',
      analysis_parameters: defaultValues?.analysis_parameters?.map((p) => ({
        id: p.id,
        env_analysis_parameter_id: p.env_analysis_parameter_id,
        env_test_method_ids: p.test_methods?.map((m) => m.id) ?? [],
      })) ?? [{ env_analysis_parameter_id: undefined as any, env_test_method_ids: [] }],
      fields: defaultValues?.fields?.map((f) => ({
        id: f.id,
        key: f.key,
        type_data: f.type_data,
        label: f.label,
        hint: f.hint ?? '',
        mandatory: f.mandatory,
        options: f.options ?? '',
      })) ?? [],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'analysis_parameters',
  })

  const {
    fields: fieldItems,
    append: appendField,
    remove: removeField,
  } = useFieldArray({
    control,
    name: 'fields',
  })

  const watchedAnalysisParameters = watch('analysis_parameters')

  const queryClient = useQueryClient()
  const { mutate, isPending } = useMutation({
    mutationFn: (data: CreateParameterCategoryBody | UpdateParameterCategoryBody) =>
      isEdit
        ? updateParameterCategory(id as string, data as UpdateParameterCategoryBody)
        : createParameterCategory(data as CreateParameterCategoryBody),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parameter-categories'] })
      queryClient.invalidateQueries({ queryKey: ['parameter-category-detail'] })
      toast.success({
        description: t(
          isEdit
            ? 'parameterCategory:message.update_success'
            : 'parameterCategory:message.create_success'
        ),
      })
      router.push('/v5/parameter-category')
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        const response = error.response?.data as ErrorResponse
        toast.danger({ description: response.message })
        for (const item of Object.keys(response?.errors ?? {})) {
          setError(item as keyof ParameterCategoryFormValues, {
            message: response?.errors?.[item]?.[0],
          })
        }
      }
    },
  })

  const onValid: SubmitHandler<ParameterCategoryFormValues> = (formData) => {
    // Validate duplicate analysis parameters
    const analysisParamIds = formData.analysis_parameters
      .filter((p) => !p._delete)
      .map((p) => p.env_analysis_parameter_id)
    const hasDuplicates = new Set(analysisParamIds).size !== analysisParamIds.length
    if (hasDuplicates) {
      toast.danger({ description: t('parameterCategory:message.duplicate_analysis_parameter') ?? 'Parameter analisa tidak boleh sama' })
      return
    }

    if (isEdit) {
      const data: UpdateParameterCategoryBody = {
        name: formData.name,
        analysis_parameters: formData.analysis_parameters
          .filter((p) => p.id || !p._delete) // Only keep items with ID (even if deleted) or new items that aren't deleted
          .map((p) => ({
            id: p.id,
            env_analysis_parameter_id: p.env_analysis_parameter_id,
            env_test_method_ids: p.env_test_method_ids,
            _delete: p._delete,
          })),
        fields: formData.fields.map((f) => ({
          key: f.key,
          type_data: f.type_data,
          label: f.label,
          hint: f.hint || null,
          mandatory: f.mandatory,
          options: f.options || null,
        })),
      }
      mutate(data)
    } else {
      const data: CreateParameterCategoryBody = {
        name: formData.name,
        analysis_parameters: formData.analysis_parameters
          .filter((p) => !p._delete)
          .map((p) => ({
            env_analysis_parameter_id: p.env_analysis_parameter_id,
            env_test_method_ids: p.env_test_method_ids,
          })),
        fields: formData.fields.map((f) => ({
          key: f.key,
          type_data: f.type_data,
          label: f.label,
          hint: f.hint || null,
          mandatory: f.mandatory,
          options: f.options || null,
        })),
      }
      mutate(data)
    }
  }

  useSetLoadingPopupStore(isPending)

  return {
    register,
    handleSubmit,
    errors,
    onValid,
    isPending,
    fields,
    append,
    remove,
    control,
    setValue,
    watch,
    fieldItems,
    appendField,
    removeField,
    watchedAnalysisParameters,
  }
}
