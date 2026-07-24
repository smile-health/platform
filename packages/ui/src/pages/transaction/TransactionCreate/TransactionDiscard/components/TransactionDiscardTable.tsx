import React, { Fragment } from 'react'
import { Button } from '#components/button'
import { EmptyState } from '#components/empty-state'
import { FormErrorMessage } from '#components/form-control'
import Plus from '#components/icons/Plus'
import { Table, TableEmpty, Tbody, Td, Th, Thead, Tr } from '#components/table'
import { parseDateTime } from '#utils/date'
import { getBackgroundStock, numberFormatter } from '#utils/formatter'

import TransactionCreateMaterialDropdown from '../../components/TransactionCreateMaterialDropdown'
import { useTransactionCreateDiscard } from '../hooks/useTransactionCreateDiscard'
import { useTransactionDiscard } from '../hooks/useTransactionDiscard'
import { createColumnDiscard } from '../transaction-discard.constant'
import { getValueNumber } from '../transaction-discard.helper'
import TransactionDiscardTableDetail from './TransactionDiscardTableDetail'
import TransactionDiscardStockSelected from './TransactionDiscardStockSelected'
import { DiscardItem } from '../transaction-discard.type'

const TransactionDiscardTable: React.FC = () => {
  const {
    t,
    language,
    items,
    handleRemove,
    openDetail,
    handleOpenDetail,
    handleCloseDetail,
    getErrorMessage,
  } = useTransactionDiscard()
  const { handleAddItemDiscard } = useTransactionCreateDiscard()

  const columns = createColumnDiscard({ t })
  return (
    <div className="ui-mt-6">
      <TransactionDiscardTableDetail
        open={openDetail.open}
        index={openDetail.index}
        data={openDetail.detail}
        handleClose={handleCloseDetail}
      />

      <Table
        withBorder
        rounded
        hightlightOnHover
        overflowXAuto
        stickyOffset={0}
        empty={items.length === 0}
        verticalAlignment="center"
      >
        <Thead>
          <Tr>
            {columns.map((column) => (
              <Th
                id={`header-${column.id}`}
                columnKey={column.id}
                key={column.id}
                className="ui-w-10 ui-font-semibold"
                style={{
                  ...(column.minSize && { minWidth: column.minSize }),
                }}
              >
                {column.header}
              </Th>
            ))}
          </Tr>
        </Thead>
        <Tbody>
          {items?.map((item, index) => (
            <Fragment key={`material-selected-${item.material_id}`}>
              <Tr className="ui-text-sm ui-font-normal">
                <Td
                  id={`cell-${columns[0].id}`}
                  className="ui-content-start ui-p-2"
                >
                  {index + 1}
                </Td>
                <Td
                  id={`cell-${columns[1].id}`}
                  className="ui-content-start ui-p-2"
                >
                  <p className="ui-font-bold ui-text-dark-blue ui-mb-[6px]">
                    {item.material?.name ?? '-'}
                  </p>
                  <p>
                    {t(
                      'transactionCreate:transaction_discard.form.table.column.activity'
                    )}
                    : {item.activity?.name}
                  </p>
                </Td>
                <Td
                  id={`cell-${columns[2].id}`}
                  className={`ui-content-start ui-p-2 ${getBackgroundStock(
                    item.total_qty,
                    item.min,
                    item.max
                  )}`}
                >
                  <p className="ui-text-dark-blue ui-text-sm">
                    {
                      t(
                        'transactionCreate:transaction_discard.form.table.description.stock.on_hand',
                        {
                          returnObjects: true,
                          value: getValueNumber(item.total_qty, language),
                        }
                      )[0]
                    }
                  </p>
                  <p className="ui-text-dark-blue ui-text-sm ui-mb-1">
                    {
                      t(
                        'transactionCreate:transaction_discard.form.table.description.stock.available',
                        {
                          returnObjects: true,
                          value: getValueNumber(
                            item.total_available_qty,
                            language
                          ),
                        }
                      )[0]
                    }
                  </p>
                  <p className="ui-text-[#737373] ui-text-sm">
                    {`(min: ${getValueNumber(item.min, language)}, max: ${getValueNumber(item.max, language)})`}
                  </p>
                </Td>
                <Td
                  id={`cell-${columns[3].id}`}
                  className="ui-content-start ui-p-2"
                >
                  <div className="ui-flex ui-flex-col ui-gap-4">
                    {item.details?.map(
                      (x, i) => (
                        <TransactionDiscardStockSelected
                          key={x.material?.id}
                          stock={x as unknown as DiscardItem}
                          batch_code={item.stocks[i].batch?.code ?? '-'}
                          expired_date={parseDateTime(item.stocks[i].batch?.expired_date ?? '-', 'DD MMM YYYY').toUpperCase()}
                        />
                      )
                    )}

                    <Button
                      onClick={() => handleOpenDetail(item, index)}
                      leftIcon={<Plus className="h-5 w-5" />}
                      type="button"
                      variant="outline"
                      className="ui-w-28"
                    >
                      {item.stocks?.some((stock) => stock.batch)
                        ? t(
                          'transactionCreate:transaction_remove_stock.input_table.column.batch'
                        )
                        : t('common:detail')}
                    </Button>
                  </div>
                  {getErrorMessage(index) && (
                    <FormErrorMessage>
                      {getErrorMessage(index)}
                    </FormErrorMessage>
                  )}
                </Td>
                <Td
                  id={`cell-${columns[4].id}`}
                  className="ui-content-start ui-p-2"
                >
                  <Button
                    id={`btn-delete-${index}`}
                    size="sm"
                    variant="subtle"
                    color="danger"
                    className="ui-p-[6px]"
                    type="button"
                    onClick={() => handleRemove(index)}
                  >
                    {t('common:remove')}
                  </Button>
                </Td>
              </Tr>
            </Fragment>
          ))}
          {items.length > 0 && (
            <TransactionCreateMaterialDropdown
              colSpan={columns.length}
              onSelect={handleAddItemDiscard}
              className="ui-max-w-[280px]"
            />
          )}
        </Tbody>
        <TableEmpty>
          <EmptyState
            title={t('common:message.empty.title')}
            description={t('common:message.empty.description')}
            withIcon
          />
        </TableEmpty>
      </Table>
    </div>
  )
}

export default TransactionDiscardTable
