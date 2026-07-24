import React, { useEffect, useState } from 'react'
import { Button } from '#components/button'
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
} from '#components/drawer'
import Reload from '#components/icons/Reload'
import XMark from '#components/icons/XMark'
import OrderCreateBatchModalWarning from '#pages/order/components/OrderCreateBatchModalWarning'
import { numberFormatter } from '#utils/formatter'
import { FormProvider } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { columnsOrderCreateTableHeaderDrawer } from '../constants/table'
import { useOrderCreateHierarchyDrawer } from '../hooks/useOrderCreateHierarchyDrawer'
import { TOrderCreateForm } from '../order-create.type'
import { minMax } from '../utils'
import { OrderCreateHierarchyDrawerTable } from './OrderCreateHierarchyDrawerTable'

type OrderCreateHierarchyBatchDrawerProps = {
  onClose: () => void
  isOpen: boolean
  indexRow: number
  order_items: TOrderCreateForm['order_items']
}

const OrderCreateHierarchyBatchDrawer: React.FC<
  OrderCreateHierarchyBatchDrawerProps
> = ({ onClose, isOpen, indexRow, order_items }) => {
  const {
    t,
    i18n: { language },
  } = useTranslation(['common', 'orderCreate'])
  const [openModalWarning, setOpenModalWarning] = useState<boolean>(false)
  const {
    methods,
    resetKey,
    children,
    setValue,
    setResetKey,
    handleSubmit,
    parentSetValue,
    handleSaveUpdate,
    handleInputChange,
  } = useOrderCreateHierarchyDrawer({
    onClose,
    isOpen,
    indexRow,
    order_items,
  })

  useEffect(() => {
    if (
      methods?.formState?.errors?.children?.root?.type === 'at-least-one-filled'
    ) {
      setOpenModalWarning(true)
    }
  }, [methods?.formState?.errors])

  return (
    <FormProvider {...methods}>
      <OrderCreateBatchModalWarning
        open={openModalWarning}
        setOpen={(open) => setOpenModalWarning(open)}
      />

      <Drawer
        placement="bottom"
        open={isOpen}
        size="full"
        sizeHeight="lg"
        closeOnOverlayClick={false}
      >
        <DrawerHeader className="ui-border">
          <div className="ui-flex ui-justify-between">
            <div />
            <h6 className="ui-text-xl ui-text-primary-800 ui-font-medium">
              {t('orderCreate:drawer.header')}
            </h6>
            <Button
              variant="subtle"
              type="button"
              color="neutral"
              onClick={() => onClose()}
            >
              <XMark />
            </Button>
          </div>
        </DrawerHeader>
        <DrawerContent>
          <div className="ui-p-4" id="transaction-detail-table">
            <div className="ui-space-y-6">
              <div className="ui-flex ui-items-center ui-gap-10">
                <div className="ui-max-w-72">
                  <h2 className="ui-text-sm ui-font-medium ui-text-neutral-500">
                    Material
                  </h2>
                  <p className="ui-font-bold ui-text-primary-800 ui-mb-1">
                    {order_items?.[indexRow]?.label}
                  </p>
                </div>
                <div className="ui-max-w-60">
                  <h2 className="ui-text-sm ui-font-medium ui-text-neutral-500">
                    {t('orderCreate:drawer.stock_on_hand')}
                  </h2>
                  <p className="ui-font-bold ui-text-primary-800 ui-mb-1">
                    {numberFormatter(
                      order_items?.[indexRow]?.value?.total_qty ?? 0,
                      language
                    )}
                    <span className="ui-text-neutral-500 ui-text-xs ui-font-normal ui-ml-1">
                      {minMax(
                        order_items?.[indexRow]?.value?.min ?? 0,
                        order_items?.[indexRow]?.value?.max ?? 0,
                        language
                      )}
                    </span>
                  </p>
                </div>
                {/* <div className="ui-max-w-60">
                  <h2 className="ui-text-sm ui-font-medium ui-text-neutral-500">
                    {t('orderCreate:drawer.available_stock')}
                  </h2>
                  <p className="ui-font-bold ui-text-primary-800 ui-mb-1">
                    {numberFormatter(
                      order_items?.[indexRow]?.value?.total_available_qty ?? 0,
                      language
                    )}
                  </p>
                </div> */}
              </div>
              <OrderCreateHierarchyDrawerTable
                headers={columnsOrderCreateTableHeaderDrawer(t)}
                onHandleInputChange={handleInputChange}
                indexRow={indexRow}
                resetKey={resetKey}
              />
            </div>
          </div>
        </DrawerContent>
        <DrawerFooter className="ui-border">
          <Button
            id={`reset-batch-${indexRow}`}
            variant="subtle"
            onClick={() => {
              const resetChildren =
                children?.map((child) => ({
                  ...child,
                  ordered_qty: null,
                  total_ordered_qty: null,
                })) ?? []

              setValue('children', resetChildren)
              parentSetValue(
                `order_items.${indexRow}.value.children`,
                resetChildren
              )
              setResetKey((prev) => prev + 1)
            }}
          >
            <div className="ui-flex ui-flex-row ui-text-sm ui-space-x-3 ui-text-primary-600">
              <Reload className="ui-size-5" />
              <div>Reset</div>
            </div>
          </Button>

          <Button
            variant="solid"
            id={`save-batch-${indexRow}`}
            onClick={() => {
              handleSubmit(handleSaveUpdate)()
            }}
          >
            {t('common:save')}
          </Button>
        </DrawerFooter>
      </Drawer>
    </FormProvider>
  )
}

export default OrderCreateHierarchyBatchDrawer
