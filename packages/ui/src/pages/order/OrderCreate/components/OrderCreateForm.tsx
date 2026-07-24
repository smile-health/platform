import React, { useContext, useState } from 'react'
import { yupResolver } from '@hookform/resolvers/yup'
import { Button } from '#components/button'
import { ModalConfirmation } from '#components/modules/ModalConfirmation'
import { useProgram } from '#hooks/program/useProgram'
import { useDebounce } from '#hooks/useDebounce'
import OrderCreateModalMaterialCompanion from '#pages/order/components/OrderCreateModalMaterialCompanion'
import { hasPermission, usePermission } from '#shared/permission/index'
import { getUserStorage } from '#utils/storage/user'
import { FormProvider, useFieldArray, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { useOrderCreateRelocation } from '../../OrderCreateRelocation/hooks/useOrderCreateRelocation'
import { columnsOrderCreateTableHeader } from '../constants/table'
import { OrderCreateContext } from '../context/OrderCreateContext'
import useOrderCreateStocks from '../hooks/useOrderCreateStocks'
import { createOrderBody } from '../order-create.service'
import { MappedMaterialData, TOrderCreateForm } from '../order-create.type'
import { formSchema } from '../schema/orderCreateSchema'
import OrderDetailForm from './Form/OrderDetailForm'
import OrderCreateMaterialTable from './Table/OrderCreateMaterialTable'
import { OrderCreateTable } from './Table/OrderCreateTable'

export default function OrderCreateForm() {
  usePermission('order-mutate')
  const { t } = useTranslation(['common', 'orderCreate'])

  const [showModalReset, setShowModalReset] = useState(false)
  const [showModalSave, setShowModalSave] = useState(false)
  const [showModalCompanion, setShowModalCompanion] = useState(false)

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
    resolver: yupResolver(formSchema(t)),
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

  const { remove, fields, append } = useFieldArray({
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
    useOrderCreateRelocation({
      setError,
    })

  const hasCompanions = (order_items: TOrderCreateForm['order_items']) => {
    const existingMaterialIds = new Set(
      order_items.map((item) => item.value.material_id)
    )

    const mappedMaterials = order_items
      .flatMap((item) => item.value.material_companions ?? [])
      .filter((companion) => !existingMaterialIds.has(companion.id))

    const uniqueMap = new Map(mappedMaterials.map((item) => [item?.id, item]))
    return Array.from(uniqueMap.values())
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
      ordered_qty: item.value.ordered_qty
        ? Number(item.value.ordered_qty)
        : null,
      material_id: item.value.material_id ?? null,
      order_reason_id: item.value.order_reason_id?.value
        ? Number(item.value.order_reason_id?.value)
        : null,
      recommended_stock:
        (item.value.recommended_stock ?? 0) > 0
          ? item.value.recommended_stock
          : 0,
      other_reason: item.value.other_reason ?? null,
    }))

    const payload = {
      customer_id: formData.customer_id.value,
      vendor_id: formData.vendor_id.value
        ? Number(formData.vendor_id.value)
        : 1,
      required_date: formData.required_date ?? null,
      activity_id: formData.activity_id.value,
      order_comment: formData.order_comment ? formData.order_comment : null,
      order_items: itemsOrdered,
    }

    setTempPayload(payload)

    if (hasCompanions(order_items)?.length > 0) {
      setShowModalCompanion(true)
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

  return (
    <FormProvider {...methods}>
      <div className="mt-6 flex flex-row">
        {/* Order Detail Form */}
        <OrderDetailForm isSuperAdmin={isSuperAdmin} />

        {/* Order Material List */}
        <OrderCreateMaterialTable search={search} setSearch={setSearch} />
      </div>

      {/* Order Table  */}
      <div className="ui-border ui-border-[#d2d2d2] ui-rounded ui-mt-6 ui-p-4">
        <div className="ui-font-bold ui-mb-4">
          {t('orderCreate:title.list')}
        </div>
        <OrderCreateTable
          onRemove={remove}
          append={append}
          onHandleInputChange={handleInputChange}
          headers={columnsOrderCreateTableHeader(t)}
          isHierarchy={false}
        />
        <div className="mt-6">&nbsp;</div>

        {/* Buttons  */}
        <div className="ui-flex ui-flex-row-reverse">
          <Button
            id="order-create-button-send"
            color="primary"
            disabled={!order_items.length}
            onClick={() => handleSubmit(onValid)()}
            className="ui-w-40"
          >
            {t('orderCreate:button.send')}
          </Button>
          <Button
            id="order-create-button-reset"
            color="primary"
            variant="outline"
            onClick={() => setShowModalReset(true)}
            className="ui-mr-4 ui-w-40"
          >
            Reset
          </Button>
        </div>
      </div>

      {/* Modals */}
      <OrderCreateModalMaterialCompanion
        show={showModalCompanion}
        setShow={setShowModalCompanion}
        companionList={hasCompanions(order_items)}
        onNext={() => setShowModalSave(true)}
      />

      <ModalConfirmation
        open={showModalReset}
        onSubmit={() => resetAction()}
        setOpen={() => setShowModalReset(!showModalReset)}
        title={t('orderCreate:modal.reset.title')}
        description={t('orderCreate:modal.reset.description')}
      />

      <ModalConfirmation
        isLoading={isPendingMutateRelocation || isPendingMutateOrder}
        open={showModalSave}
        onSubmit={() => onSubmit()}
        setOpen={() => setShowModalSave(!showModalSave)}
        title={t('orderCreate:modal.save.title')}
        description={t('orderCreate:modal.save.description')}
      />
    </FormProvider>
  )
}
