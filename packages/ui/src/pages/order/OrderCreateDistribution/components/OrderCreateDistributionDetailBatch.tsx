import { useState } from 'react'
import { Button } from '#components/button'
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
} from '#components/drawer'
import Reload from '#components/icons/Reload'
import XMark from '#components/icons/XMark'
import { OptionType } from '#components/react-select'
import OrderCreateBatchModalWarning from '#pages/order/components/OrderCreateBatchModalWarning'
import { numberFormatter } from '#utils/formatter'
import { FormProvider } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import useOrderBatchDetail from '../hooks/useOrderBatchDetail'
import {
  TDrawerQuantity,
  TFormatBatch,
} from '../order-create-distribution.type'
import OrderCreateDistributionOtherActivity from './OrderCreateDistributionOtherActivity'
import OrderCreateDistributionTableBatch from './OrderCreateDistributionTableBatch'

type Props = TDrawerQuantity & {
  activity: OptionType | null
  setOpen: (open: boolean) => void
  onSubmit: (index: number, batch: TFormatBatch[]) => void
}

export default function OrderCreateDistributionDetailBatch({
  open,
  data,
  setOpen,
  index,
  activity,
  onSubmit,
}: Props) {
  const {
    t,
    i18n: { language },
  } = useTranslation('orderDistribution')

  const [openModalWarning, setOpenModalWarning] = useState(false)

  const { methods, handleReset, handleSubmit, handleCloseDrawer } =
    useOrderBatchDetail({
      data,
      setOpen,
      activity,
      setOpenModalWarning,
      onSubmitOrderItems: (stocks) => onSubmit(index, stocks),
    })

  function formatNumber(value?: number) {
    return numberFormatter(value ?? 0, language)
  }

  const min = data?.min === null ? '-' : formatNumber(data?.min)
  const max = data?.max === null ? '-' : formatNumber(data?.max)

  return (
    <>
      <OrderCreateBatchModalWarning
        open={openModalWarning}
        setOpen={setOpenModalWarning}
      />
      <Drawer
        open={open}
        closeOnOverlayClick={false}
        placement="bottom"
        size="full"
        sizeHeight="lg"
      >
        <DrawerHeader className="ui-text-center">
          <div className="ui-flex ui-justify-between">
            <div />
            <h6 className="ui-text-xl ui-text-primary-800 ui-font-medium">
              {t('section.batch')}
            </h6>
            <Button
              variant="subtle"
              type="button"
              color="neutral"
              onClick={() => handleCloseDrawer(!open)}
            >
              <XMark />
            </Button>
          </div>
        </DrawerHeader>
        <DrawerContent className="ui-p-4 ui-space-y-6 ui-border-y ui-border-zinc-200">
          <FormProvider {...methods}>
            <div className="ui-flex ui-gap-10">
              <div>
                <p className="ui-text-neutral-500">Material</p>
                <p>
                  <strong>{data?.material?.name ?? '-'}</strong>
                </p>
              </div>
              <div>
                <p className="ui-text-neutral-500">
                  {t('label.stock.on_hand')}
                </p>
                <p className="ui-flex ui-items-center ui-gap-1">
                  <strong>{formatNumber(data?.total_qty)}</strong>
                  <span className="ui-text-neutral-500">
                    (min: {min}, max: {max})
                  </span>
                </p>
              </div>
              <div>
                <p className="ui-text-neutral-500">
                  {t('label.stock.available')}
                </p>
                <p>
                  <strong>{formatNumber(data?.total_available_qty)}</strong>
                </p>
              </div>
            </div>
            <OrderCreateDistributionTableBatch />
            <OrderCreateDistributionOtherActivity data={data?.otherBatch} />
          </FormProvider>
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
