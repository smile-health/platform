import { useParams } from 'next/navigation'
import { useRouter } from 'next/router'
import { yupResolver } from '@hookform/resolvers/yup'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from '#components/toast'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'
import useSmileRouter from '#hooks/useSmileRouter'
import { ErrorResponse } from '#types/common'
import { AxiosError } from 'axios'
import { SubmitHandler, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import {
  createActivityProgram,
  updateActivityProgram,
} from '../../global-settings/program/services/programActivities'
import {
  createActivity,
  listEnvironmentalParameterCategoryOptions,
  updateActivity,
} from '../activity.service'
import {
  ActivityFormProps,
  ActivityFormValues,
  CreateActivityBody,
} from '../activity.type'
import { schemaInput } from '../schema/ActivitySchemaInput'

export const useActivityCreateEdit = ({
  isEdit,
  defaultValues,
  pathBack,
}: ActivityFormProps) => {
  const router = useSmileRouter()
  const routerNext = useRouter()
  const params = useParams()
  const { t } = useTranslation(['common', 'activity'])
  const programId = pathBack ? params?.id.toString() : undefined
  const id =
    isEdit && !pathBack ? params?.id.toString() : params?.activityId?.toString()
  const {
    register,
    handleSubmit,
    setError,
    control,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ActivityFormValues>({
    resolver: yupResolver(schemaInput(t)),
    mode: 'onBlur',
    defaultValues: {
      name: defaultValues?.name ?? '',
      is_ordered_purchase: Boolean(defaultValues?.is_ordered_purchase ?? 0),
      is_ordered_sales: Boolean(defaultValues?.is_ordered_sales ?? 0),
      is_final_distribution: defaultValues?.is_final_distribution != null
        ? Boolean(defaultValues.is_final_distribution)
        : null,
      protocol: defaultValues?.protocol ?? 'default',
      environmental_parameter_category_ids:
        defaultValues?.environmental_parameter_categories?.map((c) => c.id) ?? [],
    },
  })

  const { data: environmentalCategoryOptions } = useQuery({
    queryKey: ['environmental-parameter-category-options'],
    queryFn: listEnvironmentalParameterCategoryOptions,
    refetchOnWindowFocus: false,
  })
  const queryClient = useQueryClient()
  const { mutate, isPending } = useMutation({
    mutationFn: (data: CreateActivityBody) =>
      isEdit
        ? !pathBack
          ? updateActivity(data, id)
          : updateActivityProgram(data, id, Number(programId))
        : !pathBack
          ? createActivity(data)
          : createActivityProgram(data, Number(programId)),
    onSuccess: () => {
      queryClient.removeQueries()
      toast.success({
        description: t(
          isEdit
            ? 'common:message.success.update'
            : 'common:message.success.create',
          {
            type: t('activity:title.activity')?.toLowerCase(),
          }
        ),
      })
      if (pathBack) routerNext.push(pathBack)
      else router.push('/v5/activity')
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        const response = error.response?.data as ErrorResponse
        toast.danger({ description: response.message })
        for (const item of Object.keys(response?.errors ?? {})) {
          setError(item as keyof ActivityFormValues, {
            message: response?.errors?.[item]?.[0],
          })
        }
      }
    },
  })

  const onValid: SubmitHandler<ActivityFormValues> = (formData) => {
    const data = {
      ...formData,
      is_ordered_purchase: Number(formData?.is_ordered_purchase),
      is_ordered_sales: Number(formData?.is_ordered_sales),
      is_final_distribution: formData.is_final_distribution != null
        ? Number(formData.is_final_distribution)
        : undefined,
      environmental_parameter_category_ids:
        formData.environmental_parameter_category_ids ?? [],
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
    setValue,
    watch,
    environmentalCategoryOptions: environmentalCategoryOptions?.data ?? [],
  }
}
