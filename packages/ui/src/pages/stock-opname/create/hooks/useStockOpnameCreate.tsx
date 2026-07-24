import isSameOrBefore from "dayjs/plugin/isSameOrBefore"
import isSameOrAfter from "dayjs/plugin/isSameOrAfter"
import { useMutation } from '@tanstack/react-query'
import { reValidateQueryFetchInfiniteScroll } from '#components/infinite-scroll-list'
import { toast } from '#components/toast'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'
import useSmileRouter from '#hooks/useSmileRouter'
import { AxiosError } from 'axios'
import dayjs from 'dayjs'
import { SubmitHandler } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { createBodyPayload } from '../helper/util'
import { createStockOpname } from '../services'
import { CreateStockOpnameBody, StockOpnameCreateForm } from '../types'
import { ValueChange } from '../types/form-types'
import { useStockOpnameCreateFormControl } from './useStockOpnameCreateFormControl'
import { useStockOpnameMaterialAndTrademark } from './useStockOpnameMaterialAndTrademark'
import { useStockOpnameModalControl } from './useStockOpnameModalControl'

dayjs.extend(isSameOrBefore)
dayjs.extend(isSameOrAfter)

export const useStockOpnameCreate = () => {
  const { t } = useTranslation(['common', 'stockOpnameCreate'])
  const { push } = useSmileRouter()

  const {
    modalConfirmation,
    setModalConfirmation,
    handleCloseConfirmation,
    handleShowWarningChange,
    openModalReset,
    setOpenModalReset,
  } = useStockOpnameModalControl({ t })

  const { methods, isNotAdmin, isHierarchical } =
    useStockOpnameCreateFormControl({ t })

  const {
    trademarks,
    selected_material_id,
    handleSelectMaterial,
    handleResetMaterial,
  } = useStockOpnameMaterialAndTrademark({
    methods,
    handleShowWarningChange,
    isHierarchical,
  })

  const { mutate: mutateCreate, isPending: isPendingCreate } = useMutation({
    mutationFn: (data: CreateStockOpnameBody) => createStockOpname(data),
    onSuccess: () => {
      const { periode } = methods.getValues()
      let message = ''
      if (dayjs().isSameOrBefore(dayjs(periode?.end_period)) && dayjs().isSameOrAfter(dayjs(periode?.start_period))) {
        message = t('stockOpnameCreate:form.submit.success.today')
      } else {
        message = t('stockOpnameCreate:form.submit.success.out_date')
      }

      toast.success({ description: message })
      if (modalConfirmation.open) handleCloseConfirmation()
      methods.reset()
      handleResetMaterial()
      push('/v5/stock-opname')
    },
    onError: (err: AxiosError) => {
      const { message } = err.response?.data as { message: string }

      toast.danger({ description: message })
    },
  })

  const onSubmit: SubmitHandler<StockOpnameCreateForm> = (formData) => {
    const isHaveDoneMaterialStockOpname = formData.new_opname_items.some(
      (x) => !!x.last_opname_date
    )
    if (isHaveDoneMaterialStockOpname) {
      const message = t('stockOpnameCreate:form.submit.warning.out_date', {
        returnObjects: true,
      })
      setModalConfirmation({
        open: true,
        message: (
          <div className="ui-flex ui-justify-center ui-items-center ui-flex-col ui-gap-4">
            <p className="ui-text-base ui-text-neutral-500 ui-font-normal">
              {message[0]}
            </p>
            <p className="ui-text-base ui-text-primary-800 ui-font-medium">
              {message[1]}
            </p>
          </div>
        ),
        payload: createBodyPayload(formData),
        type: 'confirmation',
        buttonProps: {
          cancel: { variant: undefined, color: undefined },
          submit: { variant: 'outline' },
        },
      })

      return
    }

    const payload = createBodyPayload(formData)

    mutateCreate(payload)
  }

  const handleUpdate = () => {
    if (modalConfirmation.payload) {
      const payload = {
        ...(modalConfirmation.payload as CreateStockOpnameBody),
      }
      mutateCreate(payload)
    }
  }

  const handleConfirmWarningChange = () => {
    const payload = modalConfirmation.payload as ValueChange
    if (payload.type === 'entity' || payload.type === 'periode') {
      methods.setValue(payload.type, payload.value)
      methods.setValue('new_opname_items', [])
      handleResetMaterial()
      reValidateQueryFetchInfiniteScroll()
    } else if (payload.type === 'material') {
      const { new_opname_items } = methods.watch()
      methods.setValue(
        'new_opname_items',
        new_opname_items.filter(
          (item) => item.parent_material?.id !== payload.value
        )
      )
      modalConfirmation.callback?.()
    } else if (payload.type === 'trademark') {
      modalConfirmation.callback?.()
    }
    handleCloseConfirmation()
  }

  const handleSubmitModalConfirmation = () => {
    if (modalConfirmation.type === 'confirmation') {
      handleUpdate()
    } else if (modalConfirmation.type === 'warning') {
      handleConfirmWarningChange()
    }
  }

  useSetLoadingPopupStore(isPendingCreate)

  return {
    t,
    onSubmit,
    handleSubmitModalConfirmation,
    reValidateQueryFetchInfiniteScroll,

    // Modal Control
    modalConfirmation,
    setModalConfirmation,
    handleCloseConfirmation,
    handleShowWarningChange,
    openModalReset,
    setOpenModalReset,

    // Form Control
    methods,
    isNotAdmin,
    isHierarchical,

    // Material and Trademark Control
    trademarks,
    selected_material_id,
    handleSelectMaterial,
  }
}
