import { useState } from 'react'
import { yupResolver } from '@hookform/resolvers/yup'
import { useProgram } from '#hooks/program/useProgram'
import { useDebounce } from '#hooks/useDebounce'
import { usePermission } from '#hooks/usePermission'
import { listStockDetailStock } from '#services/stock'
import { hasPermission } from '#shared/permission/index'
import { useLoadingPopupStore } from '#store/loading.store'
import { Stock } from '#types/stock'
import { getUserStorage } from '#utils/storage/user'
import { useFieldArray, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { MaterialCompanions } from '../../order.type'
import { createOrderBody } from '../order-create-return.service'
import { OrderItem, TOrderCreateReturnForm } from '../order-create-return.type'
import { formSchema } from '../schema/orderCreateReturnSchema'
import { checkStatusMaterial, mapDetailStock, mapStock } from '../utils'
import useOrderCreateStocks from './useOrderCreateStocks'
import { NeedRelationPayload } from '../utils/order-create-error-handler'

export const useOrderCreateReturn = () => {
  usePermission('order-mutate')
  const { t } = useTranslation(['common', 'orderCreateReturn'])

  const [indexRow, setIndexRow] = useState(0)
  const [isOpenDrawer, setIsOpenDrawer] = useState(false)

  const [showModalSave, setShowModalSave] = useState(false)
  const [showModalReset, setShowModalReset] = useState(false)
  const [showModalCompanion, setShowModalCompanion] = useState(false)
  const [showModalNeedRelation, setShowModalNeedRelation] = useState(false)
  const [needRelationData, setNeedRelationData] = useState<NeedRelationPayload>({
    header: '',
    message: '',
    list: [],
  })

  const [tempPayload, setTempPayload] = useState({})
  const [search, setSearch] = useState<string>('')

  const userStorage = getUserStorage()
  const debouncedSearch = useDebounce(search, 500)
  const isSuperAdmin = hasPermission('order-enable-select-customer')

  const { activeProgram } = useProgram()
  const { setLoadingPopup } = useLoadingPopupStore()

  const handleDefaultValue = () => {
    return {
      order_items: [],
      customer_id: {
        label: userStorage?.entity?.name,
        value: activeProgram?.entity_id,
      },
      vendor_id: null,
      activity_id: null,
      required_date: null,
      order_comment: null,
    }
  }

  const methods = useForm<TOrderCreateReturnForm>({
    resolver: yupResolver(formSchema(t)),
    mode: 'onChange',
    defaultValues: handleDefaultValue(),
  })

  const {
    handleSubmit,
    clearErrors,
    setValue,
    setError,
    trigger,
    watch,
    reset,
    control,
  } = methods

  const { remove, append } = useFieldArray({
    control,
    name: 'order_items',
  })

  const { activity_id, customer_id, order_items, vendor_id } = watch()

  const hasCompanions = (order_items: OrderItem[]) => {
    const existingMaterialIds = new Set(
      order_items.map((item) => item.material_id)
    )

    const mappedMaterials = order_items
      .flatMap((item) => item.material_companions ?? [])
      .filter((companion) => !existingMaterialIds.has(companion.id))

    const uniqueMap = new Map(mappedMaterials.map((item) => [item?.id, item]))
    return Array.from(uniqueMap.values())
  }

  const companionList = hasCompanions(order_items)

  const { mutateOrder, isPendingMutateOrder } = useOrderCreateStocks(
    setError,
    customer_id?.value,
    activity_id?.value,
    debouncedSearch,
    (payload) => {
      setNeedRelationData(payload)
      setShowModalNeedRelation(true)
    }
  )

  const onSelectItem = async (item: Stock) => {
    try {
      const mappedItem = mapStock(indexRow, activity_id?.label, item, [])
      if (!checkStatusMaterial(Number(item?.material?.id), order_items)) {
        setLoadingPopup(true)
        const res = await listStockDetailStock({
          entity_id: customer_id?.value,
          material_id: item?.material?.id,
          only_have_qty: 1,
          group_by: 'activity',
        })

        const mappedRes = res?.data?.map((data) => ({
          label: data?.activity?.name,
          value: mapDetailStock(data, item?.material),
          entity_activity_id: data?.activity?.id,
        }))

        const selectedMaterial = mappedRes?.find(
          (material) =>
            material?.entity_activity_id === Number(activity_id?.value)
        )

        const otherActivityOptions = mappedRes?.filter(
          (mappedData) =>
            mappedData?.entity_activity_id !== Number(activity_id?.value)
        )

        if (order_items.length === 0) {
          clearErrors('order_items')
        }

        const updatedMappedItem = {
          ...selectedMaterial?.value,
          material_other_activity: otherActivityOptions as any,
        }

        append?.(updatedMappedItem as OrderItem)
      } else {
        const indexToRemove = order_items.findIndex(
          (orderItem) => orderItem?.material_id === mappedItem.material_id
        )
        if (indexToRemove !== -1) {
          remove?.(indexToRemove)
        }
      }
    } catch (error) {
      console.log(error, 'error')
    } finally {
      setLoadingPopup(false)
    }
  }

  const removeItem = (item: OrderItem) => {
    const indexToRemove = order_items.findIndex(
      (orderItem) => orderItem?.material_id === item.material_id
    )
    if (indexToRemove !== -1) {
      remove?.(indexToRemove)
    }
  }

  const onValid = async (formData: TOrderCreateReturnForm) => {
    const isValid = await trigger(`order_items.${indexRow}.material_stocks`)

    if (!isValid) return

    const itemsOrdered = order_items.map((item) => ({
      material_id: item?.material_id,
      stocks: [...item.material_stocks.valid, ...item.material_stocks.expired]
        .filter((stock) => !!stock?.batch_ordered_qty)
        .map((filteredStock) => ({
          stock_id: filteredStock?.batch_stock_id,
          allocated_qty: filteredStock?.batch_ordered_qty,
          order_stock_status_id:
            filteredStock?.batch_order_stock_status_id?.value,
        })),
    }))

    const payload = {
      customer_id: Number(formData?.vendor_id?.value),
      vendor_id: Number(formData?.customer_id?.value),
      required_date: formData?.required_date ?? null,
      activity_id: Number(formData?.activity_id?.value),
      order_comment: formData.order_comment ?? null,
      order_items: itemsOrdered,
    }

    setTempPayload(payload)
    if (companionList.length > 0) {
      setShowModalCompanion(true)
    } else {
      setShowModalSave(true)
    }
  }

  const onSubmit = () => {
    mutateOrder(tempPayload as createOrderBody)
  }

  const resetAction = () => {
    setShowModalReset(true)
  }

  const resetData = () => {
    reset()
    location.reload()
  }

  const openDrawer = (index: number) => {
    setIsOpenDrawer(true)
    setIndexRow(index)
  }

  return {
    remove,
    append,
    trigger,
    onValid,
    setValue,
    onSubmit,
    setSearch,
    resetData,
    openDrawer,
    removeItem,
    setIndexRow,
    resetAction,
    onSelectItem,
    handleSubmit,
    setIsOpenDrawer,
    setShowModalSave,
    setShowModalReset,
    setShowModalCompanion,
    setShowModalNeedRelation,
    search,
    methods,
    indexRow,
    vendor_id,
    order_items,
    customer_id,
    activity_id,
    isOpenDrawer,
    isSuperAdmin,
    companionList,
    showModalSave,
    showModalReset,
    showModalCompanion,
    showModalNeedRelation,
    needRelationData,
    isPendingMutateOrder,
  }
}
