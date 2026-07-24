import React from "react"
import { useTranslation } from "react-i18next"
import { FormProvider } from "react-hook-form"

import { Button } from "#components/button"
import XMark from "#components/icons/XMark"
import { Table, TableEmpty, Tbody, Td, Th, Thead, Tr } from "#components/table"
import { EmptyState } from "#components/empty-state"
import { Drawer, DrawerContent, DrawerFooter, DrawerHeader } from "#components/drawer"
import TransactionCreateSelectReason from "../../components/TransactionCreateSelectReason"
import TransactionDiscardInputQuantity from "./TransactionDiscardInputQuantity"
import TransactionCreateSelectMaterialStatus from "../../components/TransactionCreateSelectMaterialStatus"

import { createColumnDiscardDetail } from "../transaction-discard.constant"
import { ItemTransactionDiscard } from "../transaction-discard.type"
import { useTransactionDiscardTableDetail } from "../hooks/useTransactionDiscardTableDetail"
import { getValueNumber } from "../transaction-discard.helper"
import { parseDateTime } from "#utils/date"
import Reload from "#components/icons/Reload"

type Props = {
  open: boolean
  index: number
  data: ItemTransactionDiscard | null
  handleClose: () => void
}

const TransactionDiscardTableDetail: React.FC<Props> = (props) => {
  const { open, data, index: parentIndex, handleClose } = props
  const { t: tCommon, i18n: { language } } = useTranslation('common')
  const { t: tTransactionCreate } = useTranslation('transactionCreate')
  const {
    handleUpdateItems,
    is_sensitive,
    is_batch,
    is_open_vial,
    getValueBoolean,
    details,
    methods,
    handleReset,
  } = useTransactionDiscardTableDetail({ data, index: parentIndex, handleClose })

  const columns = createColumnDiscardDetail({
    t: tTransactionCreate,
    is_sensitive,
    is_open_vial,
  })
  return (
    <FormProvider {...methods}>
      <form>
        <Drawer
          open={open}
          placement="bottom"
          sizeHeight="lg"
          size="full"
        >
          <DrawerHeader>
            <div className="ui-flex ui-justify-between">
              <div />
              <h6 className="ui-text-xl ui-text-primary-800 ui-font-medium">
                {is_batch ? tTransactionCreate('transaction_discard.form.table.title.batch') : tTransactionCreate('transaction_discard.form.table.title.detail')}
              </h6>
              <Button
                variant="subtle"
                type="button"
                color="neutral"
                onClick={() => {
                  methods.setValue('details', data?.details || [])
                  handleClose()
                }}
              >
                <XMark />
              </Button>
            </div>
          </DrawerHeader>
          <DrawerContent className="ui-border-y ui-border-b-zinc-300">
            <div className="ui-px-1 ui-py-2" id="transaction-detail-table">
              <div className="ui-space-y-6">
                <div className="ui-grid ui-grid-cols-[40%_40%_20%] ui-gap-4 ui-mb-1">
                  <div>
                    <h2 className="ui-text-sm ui-font-medium ui-text-neutral-500">
                      Material
                    </h2>
                    <p className="ui-font-bold ui-text-primary-800 ui-mb-1 ui-break-normal">{details?.material?.name || '-'}</p>
                  </div>
                  <div>
                    <h2 className="ui-text-sm ui-font-medium ui-text-neutral-500">
                      {tTransactionCreate('transaction_discard.form.table.description.stock.on_hand', { returnObjects: true })[1]}
                    </h2>
                    <p className="ui-font-bold ui-text-primary-800 ui-mb-1">
                      {getValueNumber(details?.total_qty || 0, language)}
                      <span className="ui-text-neutral-500 ui-text-xs ui-font-normal ui-ml-1">
                        {`(min:${getValueNumber(details?.min, language)}, max:${getValueNumber(details?.max, language)})`}
                      </span>
                    </p>
                  </div>
                  <div>
                    <h2 className="ui-text-sm ui-font-medium ui-text-neutral-500">
                      {tTransactionCreate('transaction_discard.form.table.description.stock.available', { returnObjects: true })[1]}
                    </h2>
                    <p className="ui-font-bold ui-text-primary-800 ui-mb-1">{getValueNumber(details?.total_available_qty || 0, language)}</p>
                  </div>
                </div>
                <Table
                  withBorder
                  rounded
                  hightlightOnHover
                  overflowXAuto
                  stickyOffset={0}
                  empty={data?.stocks.length === 0}
                  verticalAlignment="center"
                >
                  <Thead className="ui-bg-slate-100">
                    <Tr>
                      {columns.map(column => (
                        <Th
                          id={`header-${column.id}`}
                          columnKey={column.id}
                          key={column.id}
                          className="ui-w-10 ui-font-semibold"
                          style={{
                            ...column.minSize && { minWidth: column.minSize },
                          }}
                        >
                          {column.header}
                        </Th>
                      ))}
                    </Tr>
                  </Thead>
                  <Tbody className="ui-bg-white">
                    {details?.stocks?.map((item, index) => (
                      <Tr
                        key={`material-detail-${item.id}`}
                        className="ui-text-sm ui-font-normal"
                      >
                        <Td id={`cell-${columns[0].id}`} className="ui-content-start">{index + 1}</Td>
                        <Td id={`cell-${columns[1].id}`} className="ui-content-start">
                          <p className="ui-font-bold ui-text-dark-blue ui-mb-1">{item.batch?.code || '-'}</p>
                          <p className="ui-mb-1">
                            {tTransactionCreate('transaction_discard.form.table.description.batch.production_date', {
                              value: parseDateTime(item.batch?.production_date || '-', 'DD MMM YYYY').toUpperCase()
                            })}
                          </p>
                          <p className="ui-mb-1">
                            {tTransactionCreate('transaction_discard.form.table.description.batch.manufacturer', {
                              value: item.batch?.manufacture.name || '-'
                            })}
                          </p>
                          <p className="ui-mb-1">
                            {tTransactionCreate('transaction_discard.form.table.description.batch.expired_date', {
                              value: parseDateTime(item.batch?.expired_date || '-', 'DD MMM YYYY').toUpperCase()
                            })}
                          </p>
                        </Td>
                        <Td id={`cell-${columns[2].id}`} className="ui-content-start">
                          <p className="ui-mb-1">
                            {tTransactionCreate('transaction_discard.form.table.description.stock.on_hand', { value: getValueNumber(item.qty || 0, language), returnObjects: true })[0]}
                          </p>
                          <p className="ui-mb-1">
                            {tTransactionCreate('transaction_discard.form.table.description.stock.allocated', { value: getValueNumber(item.allocated_qty || 0, language) })}
                          </p>
                          <p className="ui-mb-1">
                            {tTransactionCreate('transaction_discard.form.table.description.stock.available', {
                              value: is_open_vial ? '' : getValueNumber(item.available_qty || 0, language), returnObjects: true
                            })[0]}
                          </p>
                          {is_open_vial && (
                            <p className="ui-mb-1">
                              {tTransactionCreate('transaction_discard.form.table.column.open_close_vial', {
                                open: getValueNumber(item.open_vial_qty || 0, language),
                                close: getValueNumber(item.qty || 0, language),
                              })}
                            </p>
                          )}
                        </Td>
                        <Td id={`cell-${columns[3].id}`} className="ui-content-start">
                          {item.activity.name}
                        </Td>
                        <TransactionDiscardInputQuantity
                          control={methods.control}
                          index={index}
                          columns={columns}
                          is_open_vial={is_open_vial}
                          is_sensitive={is_sensitive}
                        />
                        {is_sensitive && (
                          <Td id={`cell-${columns[5 + getValueBoolean(is_open_vial)].id}`} className="ui-content-start">
                            <TransactionCreateSelectMaterialStatus
                              control={methods.control}
                              id={String(index)}
                              name={`details.${index}.stock_quality`}
                            />
                          </Td>
                        )}
                        <Td
                          id={`cell-${columns[5 + getValueBoolean(is_sensitive) + getValueBoolean(is_open_vial)].id}`}
                          className="ui-content-start"
                        >
                          <TransactionCreateSelectReason
                            id={String(index)}
                            control={methods.control}
                            name={`details.${index}.transaction_reason`}
                          />
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                  <TableEmpty>
                    <EmptyState
                      title={tCommon('message.empty.title')}
                      description={tCommon('message.empty.description')}
                      withIcon
                    />
                  </TableEmpty>
                </Table>
              </div>
            </div>
          </DrawerContent>
          <DrawerFooter>
            <div className="ui-flex ui-gap-3">
              <Button
                variant="subtle"
                type="button"
                className="ui-mr-2"
                onClick={handleReset}
                leftIcon={<Reload />}
              >
                {tCommon('reset')}
              </Button>
              <Button
                type="button"
                className="ui-w-48"
                onClick={handleUpdateItems}
              >
                {tCommon('save')}
              </Button>
            </div>
          </DrawerFooter>
        </Drawer >
      </form>
    </FormProvider>
  )
}

export default TransactionDiscardTableDetail
