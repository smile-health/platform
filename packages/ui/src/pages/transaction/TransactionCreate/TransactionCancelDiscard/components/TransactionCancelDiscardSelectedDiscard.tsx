import { Fragment } from 'react'
import { Button } from '#components/button'
import { EmptyState } from '#components/empty-state'
import { Table, TableEmpty, Tbody, Td, Th, Thead, Tr } from '#components/table'
import { BOOLEAN } from '#constants/common'
import { parseDateTime } from '#utils/date'
import { numberFormatter } from '#utils/formatter'
import { useTranslation } from 'react-i18next'

import TransactionCreateSelectReason from '../../components/TransactionCreateSelectReason'
import { createColumnCancelDiscard } from '../constants/table'
import { useCreateTransactionCancelDiscardTableDiscard } from '../hooks/useCreateTransactionCancelDiscardTableDiscard'
import TransactionCancelDiscardSelectedTableDetail from './TransactionCancelDiscardSelectedTableDetail'

const TransactionCancelDiscardSelectedDiscard: React.FC = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation('transactionCreate')
  const { t: tCommon } = useTranslation('common')
  const {
    items,
    handleRemoveCancelDiscard,
    handleRemoveCancelDiscardTransaction,
    control,
    detailSelected,
    setDetailSelected,
  } = useCreateTransactionCancelDiscardTableDiscard()

  const columns = createColumnCancelDiscard({ t })
  return (
    <div className="ui-mt-6">
      <TransactionCancelDiscardSelectedTableDetail
        data={detailSelected !== null ? items[detailSelected] : null}
        handleClose={() => setDetailSelected(null)}
        handleRemove={(indexTransaction) => {
          if (detailSelected !== null)
            handleRemoveCancelDiscardTransaction(
              detailSelected,
              indexTransaction
            )
        }}
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
                  ...(column.size && { width: column.size }),
                }}
              >
                {column.header}
              </Th>
            ))}
          </Tr>
        </Thead>
        <Tbody>
          {items?.map((item, index) => {
            const isOpenVialMaterial =
              item.material?.is_open_vial === BOOLEAN.TRUE
            return (
              <Fragment key={`tx-discard-selected-${item.material?.id}`}>
                <Tr className="ui-text-sm ui-font-normal">
                  <Td
                    id={`cell-${columns[0].id}`}
                    className="ui-content-start ui-p-2"
                  >
                    <p className="ui-text-dark-blue">{index + 1}</p>
                  </Td>
                  <Td
                    id={`cell-${columns[1].id}`}
                    className="ui-content-start ui-p-2"
                  >
                    <p className="ui-text-dark-blue">
                      {item.material?.name ?? '-'}
                    </p>
                  </Td>
                  <Td
                    id={`cell-${columns[2].id}`}
                    className="ui-content-start ui-p-2"
                  >
                    <p className="ui-mb-0 ui-text-sm ui-font-bold ui-text-dark-blue">
                      {item.activity?.name ?? '-'}
                    </p>
                    <p className="ui-mb-0 ui-text-sm ui-font-normal ui-text-dark-blue">
                      {t(
                        'cancel_transaction_discard.table.discard.column.taken',
                        { value: item.activity?.name ?? '-' }
                      )}
                    </p>
                  </Td>
                  <Td
                    id={`cell-${columns[3].id}`}
                    className="ui-content-start ui-p-2"
                  >
                    <div className="ui-flex ui-flex-col ui-gap-1">
                      <p className="ui-mb-0 ui-text-sm ui-font-bold ui-text-dark-blue">
                        {item.stock?.batch?.code ?? '-'}
                      </p>
                      <p className="ui-mb-0 ui-text-sm ui-font-normal ui-text-dark-blue">
                        {t(
                          'cancel_transaction_discard.table.discard.column.manufacture',
                          { value: item.stock?.batch?.manufacture?.name ?? '-' }
                        )}
                      </p>
                      <p className="ui-mb-0 ui-text-sm ui-font-normal ui-text-dark-blue">
                        {t(
                          'cancel_transaction_discard.table.discard.column.expired_date',
                          {
                            value: parseDateTime(
                              item.stock?.batch?.expired_date ?? '-',
                              'DD MMM YYYY HH:mm'
                            ).toUpperCase(),
                          }
                        )}
                      </p>
                    </div>
                  </Td>
                  <Td
                    id={`cell-${columns[4].id}`}
                    className="ui-content-start ui-p-2"
                  >
                    {isOpenVialMaterial ? (
                      <>
                        <p className="ui-mb-1 ui-text-sm ui-font-normal ui-text-dark-blue">
                          {`${numberFormatter(item.change_qty_open_vial, language)} (${t('transaction_discard.form.table.column.open_vial')})`}
                        </p>
                        <p className="ui-mb-0 ui-text-sm ui-font-normal ui-text-dark-blue">
                          {`${numberFormatter(item.change_qty, language)} (${t('transaction_discard.form.table.column.close_vial')})`}
                        </p>
                      </>
                    ) : (
                      <p className="ui-text-dark-teal">
                        {numberFormatter(item.change_qty, language)}
                      </p>
                    )}
                  </Td>
                  <Td
                    id={`cell-${columns[5].id}`}
                    className="ui-content-start ui-p-2"
                  >
                    <TransactionCreateSelectReason
                      control={control}
                      id={String(index)}
                      name={`items.${index}.transaction_reason`}
                      menuPortalTarget={document.documentElement}
                    />
                  </Td>
                  <Td
                    id={`cell-${columns[6].id}`}
                    className="ui-content-start ui-p-2"
                  >
                    <div className="ui-flex ui-gap-4">
                      <Button
                        type="button"
                        variant="subtle"
                        color="primary"
                        size="sm"
                        onClick={() => setDetailSelected(index)}
                      >
                        {t(
                          'cancel_transaction_discard.table.discard.column.detail'
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="subtle"
                        color="danger"
                        size="sm"
                        onClick={() => handleRemoveCancelDiscard(index)}
                      >
                        {t(
                          'cancel_transaction_discard.table.discard.column.remove'
                        )}
                      </Button>
                    </div>
                  </Td>
                </Tr>
              </Fragment>
            )
          })}
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
  )
}

export default TransactionCancelDiscardSelectedDiscard
