import React, { useContext } from 'react'
import { Button } from '#components/button'
import { ModalConfirmation } from '#components/modules/ModalConfirmation'
import OrderCreateModalMaterialCompanion from '#pages/order/components/OrderCreateModalMaterialCompanion'
import { FormProvider } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { columnsOrderCreateTableHeader } from '../constants/table'
import { useOrderCreateHierarchyForm } from '../hooks/useOrderCreateHierarchyForm'
import OrderDetailForm from './Form/OrderDetailForm'
import OrderCreateMaterialTable from './Table/OrderCreateMaterialTable'
import { OrderCreateTable } from './Table/OrderCreateTable'

export default function OrderCreateHierarchyForm() {
  const { t } = useTranslation(['common', 'orderCreate'])

  const {
    search,
    methods,
    indexRow,
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
    onSubmit,
    setSearch,
    showDrawer,
    resetAction,
    handleSubmit,
    hasCompanions,
    setOpenDrawer,
    setShowModalSave,
    setShowModalReset,
    handleInputChange,
    setShowModalSaveCompanion,
  } = useOrderCreateHierarchyForm()

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
          isHierarchy
          openDrawer={openDrawer}
          indexRow={indexRow}
          showDrawer={showDrawer}
          setOpenDrawer={setOpenDrawer}
        />
        <div className="mt-6">&nbsp;</div>

        {/* Buttons  */}
        <div className="ui-flex ui-flex-row-reverse">
          <Button
            id="order-create-button-send"
            color="primary"
            disabled={order_items.length === 0}
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
        show={showModalSaveCompanion}
        setShow={setShowModalSaveCompanion}
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
        open={showModalSave}
        isLoading={isPendingMutateOrder || isPendingMutateRelocation}
        onSubmit={() => onSubmit()}
        setOpen={() => setShowModalSave(!showModalSave)}
        title={t('orderCreate:modal.save.title')}
        description={t('orderCreate:modal.save.description')}
      />
    </FormProvider>
  )
}
