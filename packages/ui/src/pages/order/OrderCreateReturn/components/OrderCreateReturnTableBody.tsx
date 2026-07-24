import React, { Fragment } from 'react'
import { Button } from '#components/button'
import { Exists } from '#components/exists'
import { FormErrorMessage } from '#components/form-control'
import Plus from '#components/icons/Plus'
import { Td, Tr } from '#components/table'
import { parseDateTime } from '#utils/date'
import { getBackgroundStock, numberFormatter } from '#utils/formatter'
import { useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { columnsOrderReturnCreateTableHeader } from '../order-create-return-constants'
import { OrderItem, TOrderCreateReturnForm } from '../order-create-return.type'
import { handleButtonName, isHasQty } from '../utils'

export type OrderCreateReturnTableBodyProps = {
  onOpenBatch: (value: number) => void
  onDeleteItem: (item: OrderItem) => void
}

export const OrderCreateReturnTableBody = ({
  onOpenBatch,
  onDeleteItem,
}: OrderCreateReturnTableBodyProps) => {
  const {
    t,
    i18n: { language },
  } = useTranslation(['common', 'orderCreateReturn'])

  const {
    watch,
    formState: { errors },
  } = useFormContext<TOrderCreateReturnForm>()

  const columns = columnsOrderReturnCreateTableHeader(t)

  const { order_items, activity_id } = watch()
  return (
    <Fragment>
      {order_items?.map((item: OrderItem, index: number) => {
        const allMaterialStocks = [
          ...item.material_stocks.valid,
          ...item.material_stocks.expired,
        ]

        return (
          <Tr
            id={`row-material-${item?.material_id}`}
            key={item?.material_id}
            className="ui-text-sm ui-text-dark-blue ui-font-normal"
          >
            <Td id={`cell-${columns[0].id}`} className="ui-align-top">
              {index + 1}
            </Td>
            <Td id={`cell-${columns[1].id}`} className="ui-align-top">
              <div className="ui-font-bold ui-mb-1 ui-align-top">
                {item?.material_name}
              </div>
              <div>
                {t('orderCreateReturn:list.selected.column.activity', {
                  activity: activity_id?.label,
                })}
              </div>
            </Td>

            <Td
              id={`cell-${columns[2].id}`}
              className={`ui-flex-row ui-align-top ${getBackgroundStock(item.material_total_qty ?? 0, item.material_min ?? 0, item.material_max ?? 0)}`}
            >
              <div>
                {t(
                  'orderCreateReturn:list.selected.column.stock_info.stock_on_hand',
                  {
                    stock_on_hand: numberFormatter(
                      item.material_total_qty ?? 0,
                      language
                    ),
                  }
                )}
              </div>
              <div>
                {t(
                  'orderCreateReturn:list.selected.column.stock_info.available_stock',
                  {
                    available_stock: numberFormatter(
                      item.material_available_qty ?? 0,
                      language
                    ),
                  }
                )}
              </div>
              <div className="ui-text-gray-500">
                (
                {t('orderCreateReturn:list.selected.column.stock_info.min', {
                  value: numberFormatter(item.material_min ?? 0, language),
                })}
                ,{' '}
                {t('orderCreateReturn:list.selected.column.stock_info.max', {
                  value: numberFormatter(item.material_max ?? 0, language),
                })}
                )
              </div>
            </Td>
            <Td
              id={`cell-${columns[3].id}`}
              key={`cell-${index}-${allMaterialStocks?.length}`}
              className="ui-align-top"
            >
              <Exists useIt={isHasQty(item?.material_stocks)}>
                <div className="ui-flex ui-flex-col">
                  {allMaterialStocks?.map((stock, indexBatch) => (
                    <Exists
                      key={JSON.stringify(stock)}
                      useIt={!!stock?.batch_ordered_qty}
                    >
                      <div
                        className="ui-flex ui-flex-col ui-mb-5"
                        key={`${index}-${indexBatch}`}
                      >
                        <div className="ui-mb-1">
                          {t(
                            'orderCreateReturn:list.selected.column.quantity.detail.batch_code',
                            { code: stock?.batch_code ?? '-' }
                          )}
                        </div>
                        <div className="ui-mb-1">
                          {t(
                            'orderCreateReturn:list.selected.column.quantity.detail.expired_date',
                            {
                              date:
                                parseDateTime(
                                  stock?.batch_expiry_date,
                                  'DD MMM YYYY',
                                  language
                                ) ?? '-',
                            }
                          )}
                        </div>
                        <div className="ui-mb-1">
                          {t(
                            'orderCreateReturn:list.selected.column.quantity.detail.stock_from_activity',
                            {
                              activity: stock?.batch_activity?.name ?? '-',
                            }
                          )}
                        </div>
                        <div className="ui-font-bold">
                          {t(
                            'orderCreateReturn:list.selected.column.quantity.detail.qty',
                            {
                              value: numberFormatter(
                                stock?.batch_ordered_qty ?? 0,
                                language
                              ),
                            }
                          )}
                        </div>
                      </div>
                    </Exists>
                  ))}
                </div>
              </Exists>

              <Button
                variant="outline"
                onClick={() => onOpenBatch(index)}
                id={`see-detail-material-add-stock-${index}`}
              >
                <div className="ui-flex ui-space-x-2">
                  {!isHasQty(item?.material_stocks) && (
                    <span>
                      <Plus />
                    </span>
                  )}

                  <div className="ui-text-sm">
                    {handleButtonName(
                      Boolean(item?.material_is_managed_in_batch),
                      item?.material_stocks,
                      t
                    )}
                  </div>
                </div>
              </Button>
              {errors?.order_items?.[index] && (
                <div className="ui-mt-1">
                  <FormErrorMessage>
                    {errors?.order_items?.[index]?.material_stocks?.message}
                  </FormErrorMessage>
                </div>
              )}
            </Td>
            <Td id={`cell-${columns[4].id}`} className="ui-align-top">
              <Button
                variant="subtle"
                color="danger"
                onClick={() => onDeleteItem(item)}
              >
                {t('orderCreateReturn:list.selected.column.action.remove')}
              </Button>
            </Td>
          </Tr>
        )
      })}
    </Fragment>
  )
}
