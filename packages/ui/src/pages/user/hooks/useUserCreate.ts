import { useParams } from 'next/navigation'
import { useRouter } from 'next/router'
import { yupResolver } from '@hookform/resolvers/yup'
import { useMutation } from '@tanstack/react-query'
import { toast } from '#components/toast'
import {
  ProgramIntegrationClient,
  ProgramWasteManagement,
} from '#constants/program'
import { useAuthProfile } from '#hooks/useAuthProfile'
import { updateUser, UpdateUserBody } from '#services/user'
import { ErrorResponse } from '#types/common'
import { TUserDetail } from '#types/user'
import { removeEmptyObject } from '#utils/object'
import { getAuthTokenCookies } from '#utils/storage/auth'
import { getUserStorage } from '#utils/storage/user'
import { AxiosError } from 'axios'
import { FieldValues, Path, SubmitHandler, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import userCreateSchema from '../schemas/userCreateSchema'
import { handleDefaultValue } from '../user.helper'
import { createUser, CreateUserBody } from '../user.service'

type UseUserCreateParams = {
  defaultValues?: TUserDetail
}

export default function useUserCreate<T extends FieldValues>({
  defaultValues,
}: UseUserCreateParams) {
  const {
    t,
    i18n: { language },
  } = useTranslation(['common', 'user'])
  const router = useRouter()
  const params = useParams()
  const isEdit = Boolean(params?.id)
  const user = getUserStorage()
  const token = getAuthTokenCookies()
  const { fetchProfile } = useAuthProfile({})

  const methods = useForm({
    resolver: yupResolver(userCreateSchema(t, isEdit)),
    mode: 'onChange',
    defaultValues: handleDefaultValue(defaultValues),
  })

  const { handleSubmit, setError } = methods

  const { mutate, isPending } = useMutation({
    mutationFn: (data: unknown) => {
      return isEdit
        ? updateUser(params?.id?.toString(), data as UpdateUserBody)
        : createUser(data as CreateUserBody)
    },
    onSuccess: () => {
      toast.success({
        description: t(
          isEdit
            ? 'common:message.success.update'
            : 'common:message.success.create',
          {
            type: t('user:title.user')?.toLowerCase(),
          }
        ),
      })

      if (Number(params?.id) === user?.id) fetchProfile()

      router.push(`/${language}/v5/global-settings/user`)
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        const response = error.response?.data as ErrorResponse
        toast.danger({ description: response.message })
        for (const item of Object.keys(response.errors ?? {})) {
          setError(item as Path<T>, {
            message: response.errors?.[item]?.[0] ?? '',
          })
        }
      }
    },
  })

  const onValid: SubmitHandler<T> = (formData) => {
    const newValues = {
      ...formData,
      role: formData.role.value,
      entity_id: formData.entity?.value,
      gender: Number(formData?.gender),
      view_only: Number(formData?.view_only),
      manufacture_id: formData?.manufacturer?.value,
      daily_recap_email: Number(formData?.daily_recap_email),
    }

    const wmsId = token ? ProgramWasteManagement().id : null
    const isWmsSelected = wmsId && formData.program_ids?.includes(wmsId)
    if (token && isWmsSelected) {
      Object.assign(newValues, {
        integration_client_id: ProgramIntegrationClient.WasteManagement,
        program_ids: formData.program_ids.filter((programId: number) => {
          return programId !== wmsId
        }),
      })
    }

    delete newValues.province
    delete newValues.regency
    delete newValues.sub_district
    delete newValues.village
    delete newValues.entity
    delete newValues.manufacturer
    delete newValues.password_confirmation

    const formattedValues = removeEmptyObject(newValues)

    const body = {
      ...formattedValues,
      lastname: formattedValues?.lastname ?? null,
      mobile_phone: formattedValues?.mobile_phone ?? null,
    }

    mutate(body)
  }

  return {
    methods,
    onSubmit: handleSubmit(onValid),
    isPending,
  }
}
