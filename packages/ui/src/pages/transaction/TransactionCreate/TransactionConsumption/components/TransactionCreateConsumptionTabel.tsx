import React, { useState } from 'react'
import { Button } from '#components/button'
import { EmptyState } from '#components/empty-state'
import { Exists } from '#components/exists'
import { FormErrorMessage } from '#components/form-control'
import Plus from '#components/icons/Plus'
import { Table, TableEmpty, Tbody, Td, Th, Thead, Tr } from '#components/table'
import { getBackgroundStock, numberFormatter } from '#utils/formatter'
import { useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import TransactionCreateMaterialDropdown from '../../components/TransactionCreateMaterialDropdown'
import { useModalWarningRemoveMaterialStore } from '../../store/modal-warning.store'
import useTransactionCreateAddStockTable from '../../TransactionAddStock/hooks/useTransactionCreateAddStockTable'
import { TransactionCreateConsumpution } from '../hooks/useTransactionCreateConsumption'
import { useOpenDrawerStore } from '../store/consumption-detail.store'
import { CreateTransactionConsumption } from '../transaction-consumption.type'
import { checkIsHaveQty, SummaryListBatch } from '../utils/helpers'
import TransactionCreateConsumptionCompletedSequence from './TransactionCreateConsumptionCompletedSequence'
import TransactionCreateConsumptionDetail from './TransactionCreateConsumptionDetail'

const TransactionCreateConsumptionTabel = () => {
  const { columns } = useTransactionCreateAddStockTable()
  const { setIsOpenDrawer, isOpenDrawer } = useOpenDrawerStore()
  const { handleDeleteItemConsumption, handleAddItemConsumption } =
    TransactionCreateConsumpution()
  const {
    t,
    i18n: { language },
  } = useTranslation(['transactionCreateConsumption', 'common'])
  const {
    watch,
    formState: { errors },
    setValue,
    trigger,
  } = useFormContext<CreateTransactionConsumption>()
  const { items, activity, entity } = watch()
  const [indexRow, setIndexRow] = useState<number>(0)
  const { setModalRemove, setCustomFunction } =
    useModalWarningRemoveMaterialStore()

  return (
    <div className="ui-mt-5">
      <Table
        withBorder
        rounded
        hightlightOnHover
        overflowXAuto
        stickyOffset={0}
        empty={!items || items?.length === 0}
      >
        <Thead className="ui-bg-slate-100 ui-text-sm">
          <Tr>
            {columns.map((item) => (
              <Th
                key={`header-${item.id}`}
                id={`header-${item.id}`}
                columnKey={item.id}
                className="ui-text-sm ui-text-dark-blue ui-font-bold"
                style={{
                  ...(item.size && { width: item.size }),
                }}
              >
                {item.header}
              </Th>
            ))}
          </Tr>
        </Thead>
        <Tbody className="ui-bg-white ui-text-sm">
          {items?.map((item, index) => (
            <Tr
              className="ui-text-sm ui-font-normal"
              key={`item-material-${index.toString()}`}
            >
              <Td id={`cell-${columns[0].id}`}>{index + 1}</Td>
              <Td id={`cell-${columns[1].id}`}>
                <div className="ui-flex ui-flex-col ui-space-y-1">
                  <div className="ui-font-bold">{item.material_name}</div>
                  <div>
                    {t('transactionCreateConsumption:table.column.activity')}:{' '}
                    {activity?.label}
                  </div>
                </div>
              </Td>
              <Td
                id={`cell-${columns[2].id}`}
                className={`ui-flex-row ${getBackgroundStock(item.on_hand_stock ?? 0, item.min ?? 0, item.max ?? 0)}`}
              >
                <div className="ui-flex ui-flex-col ui-space-y-1">
                  <div>
                    {t(
                      'transactionCreateConsumption:table.column.stock_on_hand'
                    )}
                    : {numberFormatter(item.on_hand_stock, language)}
                  </div>
                  <div>
                    {t(
                      'transactionCreateConsumption:table.column.available_stock'
                    )}
                    : {numberFormatter(item.available_stock, language)}
                  </div>
                  <div>
                    <div className="ui-text-gray-500">
                      min: {numberFormatter(item?.min, language)}, {t('max')} :{' '}
                      {numberFormatter(item?.max, language)}
                    </div>
                  </div>
                </div>
              </Td>
              <Td id={`cell-${columns[3].id}`}>
                <Exists useIt={checkIsHaveQty(item?.batches)}>
                  <div className="ui-flex ui-flex-col ui-space-y-5 ui-mb-5">
                    {item?.batches?.map((itemBatch, indexBatch) => (
                      <Exists
                        useIt={
                          !!itemBatch.change_qty ||
                          Boolean(
                            itemBatch.is_open_vial &&
                            (!!itemBatch.open_vial || !!itemBatch.close_vial)
                          )
                        }
                        key={`${index.toString()}-${indexBatch.toString()}`}
                      >
                        <SummaryListBatch
                          item={itemBatch}
                          key={`${index.toString()}-${indexBatch.toString()}`}
                          t={t}
                          lang={language}
                          batchName={itemBatch.code ?? ''}
                          expiredDate={itemBatch.expired_date ?? ''}
                          qty={itemBatch.change_qty}
                          protocolId={itemBatch.protocol_id}
                          isOpenVial={itemBatch?.is_open_vial}
                          openVial={itemBatch?.open_vial}
                          closeVial={itemBatch?.close_vial}
                        />
                      </Exists>
                    ))}
                  </div>
                </Exists>

                <Button
                  variant="outline"
                  type="button"
                  onClick={() => {
                    setIsOpenDrawer(true)
                    setIndexRow(index)
                  }}
                  id={`see-detail-material-add-stock-${index}`}
                  className="ui-w-28"
                >
                  <div className="ui-flex ui-space-x-2">
                    <span>
                      <Plus />
                    </span>
                    <div className="ui-text-sm">
                      {item.managed_in_batch ? t('batch') : 'Detail'}
                    </div>
                  </div>
                </Button>
                {errors?.items?.[index]?.batches && (
                  <FormErrorMessage>
                    {errors?.items?.[index]?.batches?.message}
                  </FormErrorMessage>
                )}
              </Td>
              <Td id={`cell-${columns[4].id}`}>
                <Button
                  variant="subtle"
                  type="button"
                  color="danger"
                  id={`delete-material-add-stock-${index}`}
                  onClick={() => {
                    setModalRemove(true, index) // Open modal
                    setCustomFunction((param: number) =>
                      handleDeleteItemConsumption(param)
                    ) // Set the function remove material
                  }}
                >
                  {t('delete')}
                </Button>
              </Td>
            </Tr>
          ))}
        </Tbody>
        <TableEmpty>
          <EmptyState
            title={t('common:message.empty.title')}
            description={t('common:message.empty.description')}
            withIcon
          />
        </TableEmpty>
      </Table>
      {items?.length > 0 && (
        <TransactionCreateMaterialDropdown
          colSpan={columns.length}
          onSelect={(stock) => handleAddItemConsumption({ item: stock })}
          className="ui-w-[294px] ui-font-normal"
        />
      )}
      <TransactionCreateConsumptionDetail
        handleClose={setIsOpenDrawer}
        isOpen={isOpenDrawer}
        idRow={indexRow}
        items={items as CreateTransactionConsumption['items']}
        setValueParent={setValue}
        triggerParent={trigger}
        errorsParent={errors}
      />
      <TransactionCreateConsumptionCompletedSequence
        entity_id={entity?.value}
        activity_id={activity?.value}
        protocol_id={items?.find((item) => item.protocol_id)?.protocol_id}
      />
    </div>
  )
}

export default TransactionCreateConsumptionTabel
