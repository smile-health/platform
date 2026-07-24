import { useMemo } from 'react'
import { Button } from '#components/button'
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
} from '#components/drawer'
import Plus from '#components/icons/Plus'
import Reload from '#components/icons/Reload'
import XMark from '#components/icons/XMark'
import OrderCreateBatchModalWarning from '#pages/order/components/OrderCreateBatchModalWarning'
import { FormProvider, useFieldArray } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import useOrderBatchDetail from '../hooks/useOrderBatchDetail'
import {
  PopulatedBatchAndManufacturer,
  TDrawerQuantity,
  TOrderFormItemStocksValues,
} from '../order-create-central-distribution.type'
import OrderCreateCentralDistributionBatchForm from './OrderCreateCentralDistributionBatchForm'
import OrderCreateCentralDistributionTableBatch from './OrderCreateCentralDistributionTableBatch'

type Props = TDrawerQuantity & {
  setOpen: (open: boolean) => void
  onSubmit: (index: number, stocks: TOrderFormItemStocksValues[]) => void
}

export default function OrderCreateCentralDistributionDetailBatch({
  index,
  open,
  data,
  setOpen,
  onSubmit,
}: Props) {
  const { t } = useTranslation('orderCentralDistribution')
  const {
    methods,
    modalBatch,
    handleReset,
    handleSubmit,
    setModalBatch,
    handleCloseModal,
    openModalWarning,
  } = useOrderBatchDetail({
    data,
    setOpen,
    onSubmitOrderItems: (stocks) => onSubmit(index, stocks),
  })

  const { fields, append, update, remove } = useFieldArray({
    control: methods.control,
    name: 'stocks',
  })
  const is_managed_in_batch = methods.watch('is_managed_in_batch')
  const isManagedInBatch = Boolean(is_managed_in_batch)

  const PopulatedBatchAndManufacturer: PopulatedBatchAndManufacturer[] =
    useMemo(() => {
      return fields.map((item: TOrderFormItemStocksValues) => ({
        manufacturer_id: item.manufacturer?.value,
        batch_code: item?.batch_code,
      }))
    }, [fields])

  return (
    <>
      <OrderCreateBatchModalWarning
        open={openModalWarning}
        setOpen={(open) => handleCloseModal(open, 'warning')}
      />

      <OrderCreateCentralDistributionBatchForm
        {...modalBatch}
        key={JSON.stringify({
          ...modalBatch,
          is_managed_in_batch,
          materialId: data?.id,
        })}
        isManagedInBatch={is_managed_in_batch}
        materialId={Number(data?.id)}
        setOpen={(open) => handleCloseModal(open, 'batch')}
        onSubmit={(data, index) => {
          if (typeof index === 'number') {
            update(index, data)
          } else {
            append(data)
          }

          handleCloseModal(false, 'batch')
        }}
        PopulatedBatchAndManufacturer={PopulatedBatchAndManufacturer}
      />

      <Drawer
        id="drawer-batch"
        open={open}
        onOpenChange={setOpen}
        closeOnOverlayClick={false}
        placement="bottom"
        size="full"
        sizeHeight="lg"
      >
        <DrawerHeader className="ui-text-center">
          <div className="ui-flex ui-justify-between">
            <div />
            <h6 className="ui-text-xl ui-text-primary-800 ui-font-medium">
              {t('section.batch.list')}
            </h6>
            <Button
              variant="subtle"
              type="button"
              color="neutral"
              onClick={() => setOpen(!open)}
            >
              <XMark />
            </Button>
          </div>
        </DrawerHeader>
        <DrawerContent className="ui-p-4 ui-space-y-6 ui-border-y ui-border-zinc-200">
          <FormProvider {...methods}>
            <div>
              <p className="ui-text-neutral-500">Material</p>
              <p>
                <strong>{data?.name ?? '-'}</strong>
              </p>
            </div>
            <OrderCreateCentralDistributionTableBatch
              key={JSON.stringify(data)}
              fields={fields}
              unit={data?.unit}
              onRemove={(index) => remove(index)}
              isManagedInBatch={isManagedInBatch}
              onShowEdit={(data, index) => {
                setModalBatch({ open: true, data, index })
              }}
            />
          </FormProvider>

          {isManagedInBatch && (
            <Button
              id="btn-new-batch"
              data-testid="btn-new-batch"
              variant="outline"
              onClick={() => {
                setModalBatch({ open: true, data: null, index: null })
              }}
              leftIcon={<Plus className="ui-size-5" />}
            >
              {t('action.new_batch')}
            </Button>
          )}
        </DrawerContent>
        <DrawerFooter>
          <Button
            id="btn-reset-batch"
            data-testid="btn-reset-batch"
            type="button"
            variant="subtle"
            onClick={handleReset}
            leftIcon={<Reload className="ui-size-5" />}
          >
            Reset
          </Button>
          <Button
            id="btn-save-batch"
            data-testid="btn-save-batch"
            type="button"
            onClick={handleSubmit}
            className="ui-w-52"
          >
            {t('action.save')}
          </Button>
        </DrawerFooter>
      </Drawer>
    </>
  )
}
