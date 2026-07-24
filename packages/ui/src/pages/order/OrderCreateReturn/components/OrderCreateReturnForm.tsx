import React from 'react'
import { ModalConfirmation } from '#components/modules/ModalConfirmation'
import { OptionType } from '#components/react-select'
import OrderCreateModalMaterialCompanion from '#pages/order/components/OrderCreateModalMaterialCompanion'
import TransactionCreateModalWarningItem from '#pages/transaction/TransactionCreate/components/TransactionCreateModalWarningItem'
import { FormProvider } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { useOrderCreateReturn } from '../hooks/useOrderCreateReturn'
import { columnsOrderReturnCreateTableHeader } from '../order-create-return-constants'
import { TOrderCreateReturnForm } from '../order-create-return.type'
import OrderCreateReturnBatchDrawer from './OrderCreateReturnBatchDrawer'
import OrderDetailForm from './OrderCreateReturnDetailForm'
import OrderCreateMaterialTable from './OrderCreateReturnMaterialTable'
import OrderCreateReturnModalNeedRelation from './OrderCreateReturnModalNeedRelation'
import { OrderCreateTable } from './OrderCreateReturnTable'
import { OrderCreateReturnTableBody } from './OrderCreateReturnTableBody'

export default function OrderCreateReturnForm() {
  const { t } = useTranslation(['common', 'orderCreateReturn'])
  const {
    remove,
    trigger,
    onValid,
    setValue,
    onSubmit,
    setSearch,
    resetData,
    openDrawer,
    removeItem,
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
    showModalSave,
    companionList,
    showModalReset,
    showModalCompanion,
    showModalNeedRelation,
    needRelationData,
    isPendingMutateOrder,
  } = useOrderCreateReturn()

  return (
    <FormProvider {...methods}>
      <div className="mt-6 flex flex-row">
        {/* Order Detail Form */}
        <OrderDetailForm
          removeOrderItems={remove}
          isSuperAdmin={isSuperAdmin}
        />

        {/* Order Material List */}
        <OrderCreateMaterialTable<TOrderCreateReturnForm>
          id="order-create-return"
          search={search}
          onSelectRow={onSelectItem}
          setSearch={setSearch}
          showMaterialTable={Boolean(customer_id && vendor_id && activity_id)}
          customer={customer_id as OptionType}
          activity={activity_id as OptionType}
        />
      </div>

      {/* Order Table  */}
      <OrderCreateTable<TOrderCreateReturnForm>
        onSubmit={() => handleSubmit(onValid)()}
        onReset={() => resetAction()}
        headers={columnsOrderReturnCreateTableHeader(t)}
        onSelectDropdown={(value) => {
          setValue('order_items', order_items.concat(value?.value))
        }}
        customer={customer_id as OptionType}
        activity={activity_id as OptionType}
        indexRow={indexRow}
      >
        <OrderCreateReturnTableBody
          onDeleteItem={removeItem}
          onOpenBatch={(index) => openDrawer(index)}
        />
        <OrderCreateReturnBatchDrawer
          onClose={async () => {
            setIsOpenDrawer(false)
            trigger(`order_items.${indexRow}.material_stocks`)
          }}
          order_items={order_items}
          isOpen={isOpenDrawer}
          indexRow={indexRow}
        />
      </OrderCreateTable>

      {/* Modals */}
      <TransactionCreateModalWarningItem />

      <OrderCreateReturnModalNeedRelation
        open={showModalNeedRelation}
        setOpen={setShowModalNeedRelation}
        header={needRelationData.header}
        message={needRelationData.message}
        list={needRelationData.list}
      />

      <OrderCreateModalMaterialCompanion
        show={showModalCompanion}
        setShow={setShowModalCompanion}
        companionList={companionList}
        onNext={() => setShowModalSave(true)}
      />

      <ModalConfirmation
        open={showModalReset}
        onSubmit={() => resetData()}
        setOpen={() => setShowModalReset(!showModalReset)}
        title={t('orderCreateReturn:modal.reset.title')}
        description={t('orderCreateReturn:modal.reset.description')}
      />

      <ModalConfirmation
        open={showModalSave}
        isLoading={isPendingMutateOrder}
        onSubmit={() => onSubmit()}
        setOpen={() => setShowModalSave(!showModalSave)}
        title={t('orderCreateReturn:modal.save.title')}
        description={t('orderCreateReturn:modal.save.description')}
      />
    </FormProvider>
  )
}
