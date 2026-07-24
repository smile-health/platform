import { useParams, useRouter } from 'next/navigation'
import { yupResolver } from '@hookform/resolvers/yup'
import { useMutation } from '@tanstack/react-query'
import { toast } from '#components/toast'
import { ErrorResponse } from '#types/common'
import { TManufacturer } from '#types/manufacturer'
import { AxiosError } from 'axios'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import * as yup from 'yup'

import { createManufacturer, updateManufacturer } from '../manufacturer.service'
import manufacturerCreateSchema from '../schemas/manufacturerCreateSchema'

type FormType = yup.InferType<ReturnType<typeof manufacturerCreateSchema>> & {
  program_ids: number[]
}

type UseManufacturerCreateParams = {
  manufacturer?: TManufacturer
  isEdit?: boolean
}

export default function useManufacturerCreate({
  manufacturer,
  isEdit,
}: UseManufacturerCreateParams) {
  const router = useRouter()
  const params = useParams()
  const { t, i18n } = useTranslation(['common', 'manufacturer'])
  const language = i18n.language
  const schema = manufacturerCreateSchema(t)
  const checkedPrograms = manufacturer?.programs?.map((item) => item?.id)

  const methods = useForm<FormType>({
    resolver: yupResolver(schema),
    mode: 'onChange',
    defaultValues: {
      name: manufacturer?.name ?? '',
      type: manufacturer?.manufacture_type?.id ?? undefined,
      description: manufacturer?.description ?? '',
      contact_name: manufacturer?.contact_name ?? '',
      phone_number: manufacturer?.phone_number ?? '',
      email: manufacturer?.email ?? '',
      address: manufacturer?.address ?? '',
      program_ids: checkedPrograms ?? [],
    },
  })

  const { handleSubmit, setError } = methods

  const mutation = useMutation({
    mutationFn: (data: FormType) =>
      isEdit
        ? updateManufacturer(Number(params?.id), data)
        : createManufacturer(data),
    onSuccess: () => {
      toast.success({
        description: t(
          isEdit
            ? 'common:message.success.update'
            : 'common:message.success.create',
          {
            type: t('manufacturer:title.manufacturer')?.toLowerCase(),
          }
        ),
      })
      router.push(`/${language}/v5/global-settings/manufacturer`)
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        const response = error.response?.data as ErrorResponse
        toast.danger({ description: response.message })
        for (const item of Object.keys(response.errors)) {
          setError(item as keyof FormType, {
            message: response.errors[item][0],
          })
        }
      }
    },
  })

  const onSubmit = (data: FormType) => {
    mutation.mutate({
      ...data,
      phone_number: data?.phone_number ?? '',
    })
  }
  return {
    onSubmit: handleSubmit(onSubmit),
    methods,
    isPending: mutation.isPending,
  }
}
