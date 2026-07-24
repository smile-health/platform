import { useParams } from 'next/navigation'
import { yupResolver } from '@hookform/resolvers/yup'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from '#components/toast'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'
import useSmileRouter from '#hooks/useSmileRouter'
import { ErrorResponse } from '#types/common'
import { AxiosError } from 'axios'
import { SubmitHandler, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import {
  createTestMethod,
  updateTestMethod,
} from '../test-method.service'
import {
  TestMethodFormProps,
  TestMethodFormValues,
  CreateTestMethodBody,
} from '../test-method.type'
import { schemaInput } from '../schema/TestMethodSchemaInput'

export const useTestMethodCreateEdit = ({
  isEdit,
  defaultValues,
}: TestMethodFormProps) => {
  const router = useSmileRouter()
  const params = useParams()
  const { t } = useTranslation(['common', 'testMethod'])
  const id = isEdit ? params?.id?.toString() : undefined

  // Map API comparison_operator values to form operator symbols
  const mapOperatorFromApi = (operator: string | null | undefined): string => {
    const mapping: Record<string, string> = {
      '<': '<',
      '>': '>',
      '<=': '≤',
      '>=': '≥',
      '=': '=',
      '!=': '≠',
    }
    return operator ? (mapping[operator] ?? '') : ''
  }

  // Map API validation_type to form validation_type
  const mapValidationTypeFromApi = (type: string | null | undefined): 'range' | 'comparison' | 'options' | 'none' | '' => {
    if (type === 'range') return 'range'
    if (type === 'comparison') return 'comparison'
    if (type === 'options') return 'options'
    if (type === 'none') return 'none'
    return ''
  }

  // Map API result_format_type to form result_format_type
  const mapResultFormatTypeFromApi = (type: string | null | undefined): 'number' | 'text' | '' => {
    if (type === 'number') return 'number'
    if (type === 'text') return 'text'
    return ''
  }

  // Build default options from API response
  const getDefaultOptions = (): string[] => {
    if (defaultValues?.validation?.options && defaultValues.validation.options.length > 0) {
      return defaultValues.validation.options
    }
    return ['']
  }

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    formState: { errors },
    control,
    watch,
  } = useForm<TestMethodFormValues>({
    resolver: yupResolver(schemaInput(t)),
    mode: 'onBlur' as const,
    defaultValues: {
      name: defaultValues?.name ?? '',
      deskripsi: defaultValues?.deskripsi ?? '',
      quality_standard: defaultValues?.quality_standard ?? '',
      result_format_type: mapResultFormatTypeFromApi(defaultValues?.validation?.result_format_type),
      validation_type: mapValidationTypeFromApi(defaultValues?.validation?.validation_type),
      min_value: defaultValues?.validation?.min_value ?? '',
      max_value: defaultValues?.validation?.max_value ?? '',
      operator: mapOperatorFromApi(defaultValues?.validation?.comparison_operator),
      comparison_value: defaultValues?.validation?.comparison_value ?? '',
      allow_decimal: Boolean(defaultValues?.validation?.allow_decimal),
      options: getDefaultOptions(),
    },
  })

  const queryClient = useQueryClient()
  const { mutate, isPending } = useMutation({
    mutationFn: (data: CreateTestMethodBody) =>
      isEdit
        ? updateTestMethod(id as string, data)
        : createTestMethod(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['test-methods'] })
      queryClient.invalidateQueries({ queryKey: ['test-method-detail'] })
      toast.success({
        description: t(
          isEdit
            ? 'testMethod:message.update_success'
            : 'testMethod:message.create_success'
        ),
      })
      router.push('/v5/test-method')
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        const response = error.response?.data as ErrorResponse
        toast.danger({ description: response.message })
        for (const item of Object.keys(response?.errors ?? {})) {
          setError(item as keyof TestMethodFormValues, {
            message: response?.errors?.[item]?.[0],
          })
        }
      }
    },
  })

  // Map form operator symbols to API comparison_operator values
  const mapOperatorToApi = (operator: string): '<' | '<=' | '>' | '>=' | '=' | '!=' | null => {
    const mapping: Record<string, '<' | '<=' | '>' | '>=' | '=' | '!='> = {
      '<': '<',
      '>': '>',
      '≤': '<=',
      '≥': '>=',
      '=': '=',
      '≠': '!=',
    }
    return mapping[operator] ?? null
  }

  const buildTextValidation = (formData: TestMethodFormValues) => ({
    result_format_type: 'text' as const,
    validation_type: formData.validation_type === 'options' ? ('options' as const) : ('none' as const),
    options:
      formData.validation_type === 'options'
        ? (formData.options?.filter((opt) => opt.trim() !== '') ?? [])
        : [],
  })

  const buildNumberValidation = (formData: TestMethodFormValues) => {
    const base = {
      result_format_type: 'number' as const,
      allow_decimal: formData.allow_decimal ?? false,
    }

    if (formData.validation_type === 'range') {
      return {
        ...base,
        validation_type: 'range' as const,
        min_value: formData.min_value !== '' ? Number(formData.min_value) : null,
        max_value: formData.max_value !== '' ? Number(formData.max_value) : null,
      }
    }

    if (formData.validation_type === 'comparison') {
      return {
        ...base,
        validation_type: 'comparison' as const,
        comparison_operator: mapOperatorToApi(formData.operator ?? ''),
        comparison_value:
          formData.comparison_value !== '' ? Number(formData.comparison_value) : null,
      }
    }

    return {
      ...base,
      validation_type: 'none' as const,
    }
  }

  const onValid: SubmitHandler<TestMethodFormValues> = (formData) => {
    let validation = null
    if (formData.result_format_type === 'text') {
      validation = buildTextValidation(formData)
    } else if (formData.result_format_type === 'number') {
      validation = buildNumberValidation(formData)
    }

    const data: CreateTestMethodBody = {
      name: formData.name,
      deskripsi: formData.deskripsi || null,
      quality_standard: formData.quality_standard || null,
      validation,
    }
    mutate(data)
  }

  useSetLoadingPopupStore(isPending)

  return {
    register,
    handleSubmit,
    errors,
    onValid,
    control,
    watch,
    setValue,
    isPending,
  }
}
