import { useContext, useState } from 'react'
import { yupResolver } from '@hookform/resolvers/yup'
import { useProgram } from '#hooks/program/useProgram'
import { useDebounce } from '#hooks/useDebounce'
import { usePermission } from '#hooks/usePermission'
import { hasPermission } from '#shared/permission/index'
import { useLoadingPopupStore } from '#store/loading.store'
import { getUserStorage } from '#utils/storage/user'
import { useFieldArray, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { useOrderCreateRelocation } from '../../OrderCreateRelocation/hooks/useOrderCreateRelocation'
import { OrderCreateContext } from '../context/OrderCreateContext'
import { createOrderBody } from '../order-create.service'
import { MappedMaterialData, TOrderCreateForm } from '../order-create.type'
import { formSchemaHierarchy } from '../schema/orderCreateSchema'
import useOrderCreateStocks from './useOrderCreateStocks'

export const useOrderCreateHierarchyForm = () => {
  usePermission('order-mutate')
  const { t } = useTranslation(['common', 'orderCreate'])

  const [showModalReset, setShowModalReset] = useState(false)
  const [showModalSave, setShowModalSave] = useState(false)
  const [showModalSaveCompanion, setShowModalSaveCompanion] = useState(false)

  const [indexRow, setIndexRow] = useState(0)
  const [openDrawer, setOpenDrawer] = useState(false)

  const [tempPayload, setTempPayload] = useState({})
  const [search, setSearch] = useState<string>('')

  const userStorage = getUserStorage()
  const debouncedSearch = useDebounce(search, 500)
  const isSuperAdmin = hasPermission('order-enable-select-customer')

  const { activeProgram } = useProgram()

  const { isRelocation } = useContext(OrderCreateContext)

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
  const methods = useForm<TOrderCreateForm>({
    resolver: yupResolver(formSchemaHierarchy(t)),
    mode: 'onSubmit',
    defaultValues: handleDefaultValue(),
  })

  const {
    handleSubmit,
    watch,
    setValue,
    setError,
    reset,
    trigger,
    control,
    formState,
  } = methods

  const { remove, append } = useFieldArray({
    control,
    name: 'order_items',
  })

  const { activity_id, customer_id, order_items } = watch()

  const { mutateOrder, isPendingMutateOrder } = useOrderCreateStocks(
    setError,
    customer_id?.value,
    activity_id?.value,
    debouncedSearch
  )

  const { mutateOrderRelocation, isPendingMutateRelocation } =
    useOrderCreateRelocation({ setError })

  const hasCompanions = (order_items: TOrderCreateForm['order_items']) => {
    const existingMaterialIds = new Set(
      order_items?.map((item) => item?.value?.material_id)
    )

    return order_items
      .flatMap((item) => item?.value?.material_companions ?? [])
      .filter((companion) => !existingMaterialIds.has(companion.id))
  }

  const handleInputChange = (
    value: string | number,
    index: number,
    field: 'other_reason' | 'order_reason_id' | 'ordered_qty'
  ) => {
    const fieldName = `order_items.${index}.value.${field}` as const

    setValue(fieldName, value)
  }
  const onValid = async (formData: any) => {
    const isValid = await trigger('order_items')
    if (!isValid) return

    const itemsOrdered = order_items.map((item: MappedMaterialData) => ({
      children: item?.value?.children
        ?.map((child) => {
          return {
            material_id: child?.material_id,
            ordered_qty: child?.ordered_qty ? Number(child.ordered_qty) : null,
          }
        })
        .filter((child) => child?.ordered_qty),
      ordered_qty: item.value.ordered_qty
        ? Number(item.value.ordered_qty)
        : null,
      material_id: item?.value?.material_id,
      recommended_stock:
        (item.value.recommended_stock ?? 0) > 0
          ? item.value.recommended_stock
          : 0,
      other_reason: item?.value?.other_reason
        ? item?.value?.other_reason
        : undefined,
      order_reason_id: item?.value?.order_reason_id?.value ?? null,
    }))

    const payload = {
      customer_id: formData.customer_id.value,
      vendor_id: formData.vendor_id?.value
        ? Number(formData.vendor_id.value)
        : 1,
      required_date: formData.required_date ?? null,
      activity_id: formData.activity_id.value,
      order_comment: formData.order_comment ? formData.order_comment : null,
      order_items: itemsOrdered,
    }

    setTempPayload(payload)

    if (hasCompanions(order_items)?.length > 0) {
      setShowModalSaveCompanion(true)
    } else {
      setShowModalSave(true)
    }
  }

  const onSubmit = () => {
    if (!isRelocation) mutateOrder(tempPayload as createOrderBody)
    else mutateOrderRelocation(tempPayload as createOrderBody)
  }

  const resetAction = () => {
    reset()
    location.reload()
  }

  const showDrawer = (index: number) => {
    setOpenDrawer(true)
    setIndexRow(index)
  }

  return {
    search,
    control,
    methods,
    indexRow,
    formState,
    openDrawer,
    order_items,
    isSuperAdmin,
    showModalSave,
    showModalReset,
    isPendingMutateOrder,
    showModalSaveCompanion,
    isPendingMutateRelocation,
    remove,
    append,
    onValid,
    trigger,
    onSubmit,
    setSearch,
    showDrawer,
    resetAction,
    mutateOrder,
    handleSubmit,
    setOpenDrawer,
    hasCompanions,
    setShowModalSave,
    setShowModalReset,
    handleInputChange,
    setShowModalSaveCompanion,
  }
}
