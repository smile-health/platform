import React, { useState } from 'react'
import { Button } from '#components/button'
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
} from '#components/drawer'
import XMark from '#components/icons/XMark'
import { FormProvider } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { useOrderCreateReturnDrawer } from '../hooks/useOrderCreateReturnDrawer'
import { columnsOrderReturnCreateTableDrawer } from '../order-create-return-constants'
import { TOrderCreateReturnForm } from '../order-create-return.type'
import { OrderCreateReturnBatchButtonGroup } from './OrderCreateReturnBatchButtonGroup'
import { OrderCreateReturnBatchDropdownOtherActivities } from './OrderCreateReturnBatchDropdownOtherActivities'
import { OrderCreateReturnBatchTable } from './OrderCreateReturnBatchTable'
import { OrderCreateReturnBatchTableInformation } from './OrderCreateReturnBatchTableInformation'

type OrderCreateReturnBatchDrawerProps = {
  onClose: () => void
  isOpen: boolean
  indexRow: number
  order_items: TOrderCreateReturnForm['order_items']
}

const OrderCreateReturnBatchDrawer: React.FC<
  OrderCreateReturnBatchDrawerProps
> = ({ onClose, isOpen, indexRow, order_items }) => {
  const { t } = useTranslation(['common', 'orderCreateReturn'])
  const [resetKey, setResetKey] = useState(0)

  const {
    methods,
    activity_id,
    parentOrderItems,
    material_stocks,
    setValue,
    handleSubmit,
    setActiveField,
    handleSaveUpdate,
    handleInputChange,
    getFilteredActivities,
  } = useOrderCreateReturnDrawer({ indexRow, isOpen, onClose })

  return (
    <FormProvider {...methods}>
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
              {t('orderCreateReturn:drawer.header')}
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
              <OrderCreateReturnBatchTableInformation
                order_items={parentOrderItems}
                indexRow={indexRow}
              />
              <OrderCreateReturnBatchTable
                headers={columnsOrderReturnCreateTableDrawer(t)}
                onHandleInputChange={handleInputChange}
                setActiveField={setActiveField}
                indexRow={indexRow}
                resetKey={resetKey}
              />
              <OrderCreateReturnBatchDropdownOtherActivities
                order_items={order_items}
                material_stocks={material_stocks}
                setValue={setValue}
                getFilteredActivities={getFilteredActivities}
              />
            </div>
          </div>
        </DrawerContent>
        <DrawerFooter className="ui-border">
          <OrderCreateReturnBatchButtonGroup
            activity={activity_id?.value}
            indexRow={indexRow}
            material_stocks={material_stocks}
            setValue={setValue}
            handleSaveUpdate={handleSaveUpdate}
            handleSubmit={handleSubmit}
            setResetKey={setResetKey}
          />
        </DrawerFooter>
      </Drawer>
    </FormProvider>
  )
}

export default OrderCreateReturnBatchDrawer
