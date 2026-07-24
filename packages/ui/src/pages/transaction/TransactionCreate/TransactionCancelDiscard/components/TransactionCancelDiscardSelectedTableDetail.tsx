import React from "react"
import { useTranslation } from "react-i18next"
import { Button } from "#components/button"
import XMark from "#components/icons/XMark"

import { ItemsCancelTransactionDiscard } from "../transaction-cancel-discard.type"
import { Drawer, DrawerContent, DrawerHeader } from "#components/drawer"
import { parseDateTime } from "#utils/date"
import { DataTable } from "#components/data-table"
import { createColumnCancelDiscardDetail } from "../constants/table"
import { numberFormatter } from "#utils/formatter"

type Props = {
  data: ItemsCancelTransactionDiscard | null
  handleClose: () => void
  handleRemove: (index: number) => void
}

const TransactionCancelDiscardSelectedTableDetail: React.FC<Props> = (props) => {
  const { data, handleClose, handleRemove } = props
  const { t, i18n: { language } } = useTranslation('transactionCreate')

  const listLabel = t('cancel_transaction_discard.table.detail.title', { returnObjects: true })
  return (
    <Drawer
      open={!!data}
      onOpenChange={handleClose}
      placement="bottom"
      sizeHeight="lg"
      size="full"
    >
      <DrawerHeader>
        <div className="ui-flex ui-justify-between">
          <div />
          <h6 className="ui-text-xl ui-text-primary-800 ui-font-medium">
            {t('cancel_transaction_discard.table.discard.column.detail')}
          </h6>
          <Button
            variant="subtle"
            type="button"
            color="neutral"
            onClick={handleClose}
          >
            <XMark />
          </Button>
        </div>
      </DrawerHeader>
      <DrawerContent className="ui-border-y ui-border-b-zinc-300">
        <div className="ui-px-1 ui-py-2" id="transaction-detail-table">
          <div className="ui-space-y-6">
            <div className="ui-grid ui-grid-cols-[20%_20%_20%_20%_20%] ui-gap-4 ui-mb-1">
              <div className="ui-w-max">
                <h2 className="ui-text-sm ui-font-medium ui-text-neutral-500">
                  Material
                </h2>
                <p className="ui-font-bold ui-text-primary-800 ui-mb-1 ui-break-normal">
                  {data?.material?.name || '-'}
                </p>
              </div>
              <div className="ui-w-max">
                <h2 className="ui-text-sm ui-font-medium ui-text-neutral-500">
                  {listLabel[0]}
                </h2>
                <p className="ui-font-bold ui-text-primary-800 ui-mb-1">
                  {data?.stock?.batch?.code || '-'}
                </p>
              </div>
              <div className="ui-w-max">
                <h2 className="ui-text-sm ui-font-medium ui-text-neutral-500">
                  {listLabel[1]}
                </h2>
                <p className="ui-font-bold ui-text-primary-800 ui-mb-1">
                  {data?.stock?.batch?.manufacture?.name || '-'}
                </p>
              </div>
              <div className="ui-w-max">
                <h2 className="ui-text-sm ui-font-medium ui-text-neutral-500">
                  {listLabel[2]}
                </h2>
                <p className="ui-font-bold ui-text-primary-800 ui-mb-1">
                  {parseDateTime(data?.stock?.batch?.expired_date || '-', 'DD MMM YYYY').toUpperCase()}
                </p>
              </div>
              <div className="ui-w-max">
                <h2 className="ui-text-sm ui-font-medium ui-text-neutral-500">
                  {listLabel[3]}
                </h2>
                <p className="ui-font-bold ui-text-primary-800 ui-mb-1">
                  {numberFormatter(data?.change_qty || 0, language)}
                </p>
              </div>
            </div>

            <DataTable
              data={data?.details || []}
              columns={createColumnCancelDiscardDetail({
                t,
                language,
                handleRemove,
              })}
            />
          </div>
        </div>
      </DrawerContent>
    </Drawer >
  )
}

export default TransactionCancelDiscardSelectedTableDetail
