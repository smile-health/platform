import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { toast } from '#components/toast'
import { useProgram } from '#hooks/program/useProgram'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'
import useSmileRouter from '#hooks/useSmileRouter'
import { hasPermission } from '#shared/permission/index'
import { getUserStorage } from '#utils/storage/user'
import { AxiosError } from 'axios'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { createDistributionDisposalFormSchema } from '../schemas/distribution-disposal.schema-form'
import { createDistributionDisposal } from '../services/distribution-disposal.services'
import {
  CreateDistributionDisposalPayload,
  DistributionDisposalConfirmationForm,
  DistributionDisposalForm,
} from '../types/DistributionDisposal'
import { setOrderItemsPayload } from '../utils/util'

export const useDistributionDisposalCreatePage = () => {
  const { t } = useTranslation(['common', 'distributionDisposal'])
  const { back, replace } = useSmileRouter()
  const [openConfirm, setOpenConfirm] = useState<{
    open: boolean
    data: DistributionDisposalForm | null
  }>({
    open: false,
    data: null,
  })

  const isSuperAdmin = hasPermission(
    'disposal-distribution-enable-select-entity'
  )
  const userStorage = getUserStorage()
  const { activeProgram } = useProgram()

  const methods = useForm<DistributionDisposalForm>({
    mode: 'onChange',
    defaultValues: {
      activity: undefined,
      sender: isSuperAdmin
        ? undefined
        : { label: userStorage?.entity?.name, value: activeProgram?.entity_id },
      receiver: undefined,
      order_items: [],
    },
    resolver: createDistributionDisposalFormSchema,
  })
  const { watch, handleSubmit } = methods
  const { order_items } = watch()

  const { mutate, isPending } = useMutation({
    mutationKey: ['create-disposal-shipment'],
    mutationFn: (data: CreateDistributionDisposalPayload) =>
      createDistributionDisposal(data),
    onError: (err: AxiosError) => {
      const { message } = err.response?.data as { message: string }
      toast.danger({ description: message })
    },
    onSuccess: (res) => {
      toast.success({ description: t('distributionDisposal:form.success') })
      replace(`/v5/disposal-shipment/${res.id}`)
    },
  })

  const onSubmit = (values: DistributionDisposalConfirmationForm) => {
    if (!openConfirm.data) return
    const payload: CreateDistributionDisposalPayload = {
      activity_id: Number(openConfirm.data?.activity?.value),
      customer_id: Number(openConfirm.data?.receiver?.value),
      flow_id: 1,
      is_allocated: 1,
      no_document: values.no_document,
      disposal_comments: values.comment,
      disposal_items: setOrderItemsPayload(openConfirm.data.order_items),
      type: 5,
      vendor_id: Number(openConfirm.data?.sender?.value),
    }

    mutate(payload)
  }

  const handleOpenConfirm = (values: DistributionDisposalForm) => {
    setOpenConfirm({ open: true, data: values })
  }

  useSetLoadingPopupStore(isPending)

  return {
    t,
    back,
    handleSubmit,
    order_items,
    methods,
    openConfirm,
    setOpenConfirm,
    handleOpenConfirm,
    onSubmit,
    isSuperAdmin,
  }
}
