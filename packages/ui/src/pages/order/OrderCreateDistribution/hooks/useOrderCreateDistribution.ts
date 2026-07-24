import { yupResolver } from '@hookform/resolvers/yup'
import { useMutation } from '@tanstack/react-query'
import { toast } from '#components/toast'
import useSmileRouter from '#hooks/useSmileRouter'
import { ErrorResponse } from '#types/common'
import { getProgramStorage } from '#utils/storage/program'
import { getUserStorage } from '#utils/storage/user'
import { AxiosError } from 'axios'
import { SubmitHandler, useFieldArray, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { MaterialCompanions } from '../../order.type'
import { handleBodyRequest } from '../order-create-distribution.helper'
import {
  createOrderDistribution,
  CreateOrderDistributionBody,
} from '../order-create-distribution.service'
import {
  TFormatBatch,
  TOrderFormItemsValues,
  TOrderFormValues,
} from '../order-create-distribution.type'
import orderCreateDistributionSchema from '../schemas/orderCreateDistributionSchema'

type NeedRelationPayload = {
  header: string
  message: string
  list: string[]
}

type Params = {
  onShowConfirmation: VoidFunction
  onShowModalCompanion: (show: boolean) => void
  onNeedRelation?: (payload: NeedRelationPayload) => void
}

export default function useOrderCreateDistribution({
  onShowConfirmation,
  onShowModalCompanion,
  onNeedRelation,
}: Params) {
  const user = getUserStorage()
  const userProgram = getProgramStorage()
  const router = useSmileRouter()

  const { t: tCommon } = useTranslation()
  const { t } = useTranslation('orderDistribution')

  const methods = useForm<TOrderFormValues>({
    resolver: yupResolver(orderCreateDistributionSchema(t)),
    mode: 'onChange',
    defaultValues: {
      vendor: {
        label: user?.entity?.name,
        value: userProgram?.entity_id,
      },
      required_date: null,
      order_items: [],
    },
  })

  const order_items = methods.watch('order_items')

  const hasCompanions = (order_items: TOrderFormItemsValues[]) => {
    const existingMaterialIds = new Set(
      order_items.map((item) => item.material?.id)
    )

    const mappedMaterials = order_items
      .flatMap((item) => item.material?.companions ?? [])
      .filter((companion) => !existingMaterialIds.has(companion.id))

    const uniqueMap = new Map(mappedMaterials.map((item) => [item?.id, item]))
    return Array.from(uniqueMap.values())
  }

  const companionList = hasCompanions(order_items)

  const { append, remove } = useFieldArray({
    control: methods.control,
    name: 'order_items',
  })

  const onCheckIsValid = async () => {
    const isValid = await methods.trigger()
    if (isValid && companionList?.length) onShowModalCompanion(true)
    else if (isValid) onShowConfirmation()
  }

  const onSubmit: SubmitHandler<TOrderFormValues> = (formData) => {
    const body = handleBodyRequest(formData)

    mutations.mutate(body)
  }

  const onSetOrderItems = (index: number, batch: TFormatBatch[]) => {
    methods.setValue(`order_items.${index}.batch`, batch, {
      shouldValidate: true,
    })

    methods.clearErrors(`order_items.${index}`)
  }

  const mutations = useMutation({
    mutationFn: (data: CreateOrderDistributionBody) =>
      createOrderDistribution(data),
    onSuccess: (data) => {
      toast.success({
        description: tCommon('message.success.create', {
          type: t('info.message.new_distribution')?.toLowerCase(),
        }),
      })
      router.push(`/v5/order/${data?.id}`)
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        const response = error.response?.data as ErrorResponse
        const errors = response.errors as Record<string, unknown>

        if (errors?.need_relation === true) {
          toast.danger({ description: response.message })
          onNeedRelation?.({
            header: errors.header as string,
            message: errors.message as string,
            list: errors.list as string[],
          })
          return
        }

        toast.danger({ description: response.message })
      }
    },
  })

  return {
    methods,
    append,
    remove,
    onSubmit,
    companionList,
    onCheckIsValid,
    onSetOrderItems,
    isPendingMutateOrder: mutations.isPending,
  }
}
