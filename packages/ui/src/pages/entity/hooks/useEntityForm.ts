import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { OptionType } from '#components/react-select'
import { toast } from '#components/toast'
import { BOOLEAN } from '#constants/common'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'
import { listActivities } from '#services/activity'
import {
  createEntity,
  detailCoreEntity,
  getGlobalEntityTag,
  updateEntity,
} from '#services/entity'
import { TEntityForm } from '#types/entity'
import { AxiosError } from 'axios'
import { UseFormReturn } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import * as yup from 'yup'

import { formSchema } from '../schema/EntitySchemaForm'
import { reformatFromDetail } from '../utils/helper'

export type TFormData = yup.InferType<typeof formSchema> & {
  province: OptionType | null
  regency: OptionType | null
  sub_district: OptionType | null
  village: OptionType | null
}
export type TFormValidationKeys = 'common:validation.required'

type Props = {
  methodsForm: UseFormReturn<TFormData>
  isGlobal?: boolean
}

export const useEntityForm = ({ methodsForm, isGlobal }: Props) => {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { setValue, reset, setError } = methodsForm
  const { id } = router.query
  const {
    t,
    i18n: { language },
  } = useTranslation('entity')

  const { data: materialTagList } = useQuery({
    queryKey: ['materialTagList'],
    queryFn: () => getGlobalEntityTag({ page: 1, paginate: 50 }),
    retry: false,
    refetchOnWindowFocus: false,
  })

  const {
    data: activities,
    isLoading: isLoadingActivities,
    isSuccess,
  } = useQuery({
    queryKey: ['activitiesList'],
    queryFn: () =>
      listActivities({ page: 1, paginate: 100, status: BOOLEAN.TRUE }),
    retry: false,
    refetchOnWindowFocus: false,
    enabled: !isGlobal,
  })

  const {
    data: detail,
    isSuccess: isSuccessGetDetail,
    isFetching,
  } = useQuery({
    queryKey: ['detailEntity'],
    queryFn: () => detailCoreEntity(id as string),
    refetchOnWindowFocus: false,
    enabled: !!id,
  })

  const {
    mutate: mutateEntity,
    isPending,
    isSuccess: isSuccessEntity,
  } = useMutation({
    mutationFn: (data: TEntityForm) =>
      id ? updateEntity(id as string, data) : createEntity(data),
    onSuccess: () => {
      toast.success({
        description: id ? t('form.success.update') : t('form.success.save'),
      })
      router.push(`/${language}/v5/global-settings/entity`)
    },
    onError: (err: AxiosError) => {
      const { message, errors } = err.response?.data as {
        message: string
        errors: { [key: string]: string }
      }
      toast.danger({ description: message })

      if (Object.keys(errors).length > 0) {
        for (const item of Object.keys(errors)) {
          setError(item as keyof TFormData, {
            message: errors[item][0],
          })
        }
      }
    },
  })

  const isLoadingPopup = isFetching || isPending
  useSetLoadingPopupStore(isLoadingPopup)

  useEffect(() => {
    return () => {
      reset()
      queryClient.removeQueries({ queryKey: ['detailEntity'] })
    }
  }, [reset])

  useEffect(() => {
    if (isSuccess)
      setValue(
        'activities_date',
        activities.data.map((x) => ({
          id: String(x.id),
          end_date: undefined,
          start_date: undefined,
        }))
      )
  }, [isSuccess])

  useEffect(() => {
    if (isSuccessGetDetail) {
      reset(reformatFromDetail(detail, activities?.data || []))
    }
  }, [isSuccessGetDetail])

  const onSubmitForm = (values: TFormData) => {
    const payload: TEntityForm = {
      code: values.code.toUpperCase(),
      name: values.name.toUpperCase(),
      type: values.type,
      entity_tag_id: values.entity_tag_id,
      province_id: values.province_id ?? '',
      regency_id: values.regency_id ?? '',
      sub_district_id: values.sub_district_id ?? '',
      village_id: values.village_id ?? '',
      address: values.address,
      lat: values.lat ?? '',
      lng: values.lng ?? '',
      postal_code: values.postal_code ?? '',
      beneficiaries_ids: values.beneficiaries_ids || [],
      program_ids: values.program_ids || [],
      is_vendor: 0,
      is_puskesmas: 0,
      activities_date: [],
      rutin_join_date: null,
      id_satu_sehat: Number(values.id_satu_sehat),
      ...(values.entity_tag_id === 29 && values.is_sentinel_lab
        ? {
            is_sentinel_lab: true,
            sentinel_lab_start_date: values.sentinel_lab_start_date ?? null,
            sentinel_lab_end_date: values.sentinel_lab_end_date ?? null,
          }
        : { is_sentinel_lab: false }),
    }

    mutateEntity(payload)
  }

  return {
    materialTagList:
      materialTagList?.data.map((x) => ({ value: x.id, label: x.title })) || [],
    onSubmitForm,
    activities: activities?.data || [],
    isLoadingActivities,
    isPending,
    isSuccessEntity,
    isSuccessGetDetail,
    detail,
  }
}
