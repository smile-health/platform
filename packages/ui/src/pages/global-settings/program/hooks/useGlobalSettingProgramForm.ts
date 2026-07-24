import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/router'
import { yupResolver } from '@hookform/resolvers/yup'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from '#components/toast'
import { useAuthProfile } from '#hooks/useAuthProfile'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'
import { getUserStorage } from '#utils/storage/user'
import { AxiosError } from 'axios'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import * as yup from 'yup'

import { formSchema } from '../schemas/form'
import {
  createPrograms,
  detailPrograms,
  listProtocols,
  updatePrograms,
} from '../services/program'
import { ProgramForm } from '../types/program'

export type TFormData = yup.InferType<typeof formSchema>
export type FormValidationKeys = 'common:validation.required'

export const useGlobalSettingProgramForm = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation(['common', 'programGlobalSettings'])
  const router = useRouter()
  const { id } = router.query
  const queryClient = useQueryClient()
  const { fetchProfile } = useAuthProfile({})
  const user = getUserStorage()

  const methodsForm = useForm<TFormData>({
    resolver: yupResolver(formSchema),
    mode: 'onBlur',
    defaultValues: {
      // will be change to 0 after release phase 1
      is_hierarchy_enabled: 1,
      color: undefined,
      protocols: [],
    },
  })
  const { handleSubmit, setError, reset } = methodsForm

  const {
    data: detail,
    isSuccess: isSuccessGetDetail,
    isFetching: isFetchingDetail,
  } = useQuery({
    queryKey: ['detail-programs-form'],
    queryFn: () => detailPrograms(id as string),
    refetchOnWindowFocus: false,
    enabled: !!id,
  })

  const { data: protocols } = useQuery({
    queryKey: ['list-protocol-global-settings'],
    queryFn: () => listProtocols(),
    refetchOnWindowFocus: false,
  })

  const [keywordProtocol, setKeywordProtocol] = useState('')

  const { mutate, isPending, isSuccess } = useMutation({
    mutationFn: (data: ProgramForm) =>
      id ? updatePrograms(id as string, data) : createPrograms(data),
    onSuccess: (res) => {
      toast.success({
        description: id
          ? t('programGlobalSettings:form.success.update')
          : t('programGlobalSettings:form.success.create'),
      })
      if (user?.programs?.some((program) => program.id === res.id))
        fetchProfile()
      router.replace(`/${language}/v5/global-settings/program/${res.id}`)
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

  const handleChangeColor = (color: string) => {
    methodsForm.setValue('color', color)
    methodsForm.clearErrors('color')
  }

  const handleChangeHierarchy = (flag: number) => {
    methodsForm.setValue('is_hierarchy_enabled', flag)
    methodsForm.clearErrors('is_hierarchy_enabled')
  }

  const onSubmitForm = (values: TFormData) => {
    const payload: ProgramForm = {
      key: values.key,
      name: values.name.toUpperCase(),
      description: values.description ?? '',
      config: {
        material: {
          is_hierarchy_enabled: !!values.is_hierarchy_enabled,
        },
        color: values.color,
      },
      protocol_ids: values.protocols as number[],
    }

    mutate(payload)
  }

  useSetLoadingPopupStore(isFetchingDetail || isPending)

  const filteredProtocols = useMemo(
    () =>
      protocols?.data?.filter((protocol) =>
        protocol.name.toLowerCase().includes(keywordProtocol.toLowerCase())
      ),
    [keywordProtocol, protocols]
  )

  useEffect(() => {
    return () => {
      reset()
      queryClient.removeQueries({ queryKey: ['detail-programs-form'] })
    }
  }, [reset])

  useEffect(() => {
    if (isSuccessGetDetail) {
      reset({
        id: detail.id,
        key: detail.key,
        name: detail.name,
        description: detail.description,
        is_hierarchy_enabled: detail.config.material.is_hierarchy_enabled
          ? 1
          : 0,
        color: detail.config.color,
        protocols: detail.protocols.map((protocol) => protocol.id),
      })
    }
  }, [isSuccessGetDetail, detail])

  return {
    t,
    detailProgram: detail,
    router,
    methodsForm,
    handleSubmit,
    isPending,
    isSuccess,
    onSubmitForm,
    disabled: !!id,
    handleChangeColor,
    handleChangeHierarchy,
    filteredProtocols,
    keywordProtocol,
    setKeywordProtocol,
  }
}
