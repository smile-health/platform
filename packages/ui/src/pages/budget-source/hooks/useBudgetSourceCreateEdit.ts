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

import {
  createBudgetSource,
  updateBudgetSource,
} from '../budget-source.service'
import {
  BudgetSourceFormProps,
  CreateBudgetSourceBody,
} from '../budget-source.type'
import { formSchema } from '../schema/BudgetSourceSchemaForm'
import { handleDefaultValue } from '../utils/helper'

export const useBudgetSourceCreateEdit = ({
  isGlobal = false,
  defaultValues,
}: BudgetSourceFormProps = {}) => {
  const { t } = useTranslation(['common', 'budgetSource'])
  const params = useParams()
  const { push, pushGlobal, getAsLink, getAsLinkGlobal } = useSmileRouter()
  const searchParams = useSearchParams()
  const isEdit = Boolean(params?.id)
  const methods = useForm<CreateBudgetSourceBody>({
    resolver: yupResolver(formSchema(t)),
    mode: 'onChange',
    defaultValues: handleDefaultValue(defaultValues),
  })
  const { handleSubmit, setError, watch } = methods
  const program_ids = watch('program_ids')

  const { mutate, isPending } = useMutation({
    mutationFn: (data: CreateBudgetSourceBody) =>
      isEdit
        ? updateBudgetSource(params?.id?.toString(), {
            ...data,
            is_restricted: Number(data.is_restricted),
          } as CreateBudgetSourceBody)
        : createBudgetSource({
            ...data,
            is_restricted: Number(data.is_restricted),
          } as CreateBudgetSourceBody),
    onSuccess: () => {
      toast.success({
        description: t(
          isEdit
            ? 'common:message.success.update'
            : 'common:message.success.create',
          {
            type: t('budgetSource:list.title')?.toLowerCase(),
          }
        ),
      })
      if (isGlobal) {
        pushGlobal('/v5/global-settings/budget-source')
      } else {
        push('/v5/budget-source')
      }
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        const response = error.response?.data as ErrorResponse
        toast.danger({ description: response.message })
        for (const item of Object.keys(response.errors)) {
          setError(item as keyof CreateBudgetSourceBody, {
            message: response.errors[item][0],
          })
        }
      }
    },
  })

  const onValid: SubmitHandler<CreateBudgetSourceBody> = (formData) => {
    mutate(formData)
  }

  const backUrl = () => {
    const isFromDetail = searchParams.get('fromPage') === 'detail'
    const detailPath = isFromDetail && params?.id ? params.id : ''

    if (isGlobal) {
      return getAsLinkGlobal(`/v5/global-settings/budget-source/${detailPath}`)
    }

    return getAsLink(`/v5/budget-source/${detailPath}`)
  }

  useSetLoadingPopupStore(isPending)

  return {
    onSubmit: handleSubmit(onValid),
    isPending,
    program_ids,
    t,
    methods,
    backUrl,
  }
}
