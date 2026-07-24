import { useEffect, useState } from 'react'
import { yupResolver } from '@hookform/resolvers/yup'
import {
  SubmitHandler,
  useForm,
  UseFormClearErrors,
  UseFormSetValue,
} from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import {
  ReconciliationCreateForm,
  ReconciliationReasonAndActionForm,
  ReonciliationItems,
} from '../reconciliation-create.type'
import { schemaValidationReasonAndAction } from '../schema/ReconciliationReasonAndActionSchemaValidation'

export const useReconciliationReasonAndAction = ({
  item,
  setValueItem,
  indexItem,
  clearErrorItem,
}: {
  item: ReonciliationItems
  setValueItem: UseFormSetValue<ReconciliationCreateForm>
  indexItem: number
  clearErrorItem: UseFormClearErrors<ReconciliationCreateForm>
}) => {
  const { t } = useTranslation('reconciliation')
  const [openModal, setOpenModal] = useState<boolean>(false)
  const [selectedIndex, setSelectedIndex] = useState<number>(0)

  const methods = useForm<ReconciliationReasonAndActionForm>({
    resolver: yupResolver(schemaValidationReasonAndAction(t)),
    mode: 'onChange',
    defaultValues: {
      data: [
        {
          action: null,
          reason: null,
        },
      ],
    },
  })

  useEffect(() => {
    if (openModal) {
      const currentReasonAction = item?.actions?.map((action, index) => ({
        action: { value: action?.id, label: action?.title },
        reason: {
          value: item?.reasons?.[index]?.id,
          label: item?.reasons?.[index]?.title,
        },
      }))
      methods.reset({
        data:
          currentReasonAction && currentReasonAction.length > 0
            ? currentReasonAction
            : [
                {
                  action: null,
                  reason: null,
                },
              ],
      })
    }
  }, [openModal, item, methods.reset])

  const onSubmit: SubmitHandler<ReconciliationReasonAndActionForm> = (
    payload
  ) => {
    if (payload.data) {
      const actions = payload.data.map((item) => ({
        id: item.action?.value,
        title: item.action?.label,
      }))
      const reasons = payload.data.map((item) => ({
        id: item.reason?.value,
        title: item.reason?.label,
      }))
      setValueItem(`opname_stock_items.${indexItem}.actions`, actions)
      setValueItem(`opname_stock_items.${indexItem}.reasons`, reasons)
      clearErrorItem([`opname_stock_items.${indexItem}.reasons`,`opname_stock_items.${indexItem}.actions`])
      setOpenModal(false)
    }
  }

  const removeReason = (index: number) => {
    if (methods.watch()?.data && index > -1) {
      const items = methods.watch().data
      items?.splice(index, 1)
      setSelectedIndex(index - 1)
      methods.setValue('data', items)
      methods.clearErrors('data')
    }
  }

  const addNewReason = () => {
    const items = methods.watch().data ?? []
    const newItem = {
      action: null,
      reason: null,
    }
    items.push(newItem)
    methods.setValue('data', items)
    setSelectedIndex((prev) => prev + 1)
  }

  return {
    methods,
    openModal,
    setOpenModal,
    handleSave: () => methods.handleSubmit(onSubmit)(),
    selectedIndex,
    setSelectedIndex,
    removeReason,
    addNewReason,
  }
}
