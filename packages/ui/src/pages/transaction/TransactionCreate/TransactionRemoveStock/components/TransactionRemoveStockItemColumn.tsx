import { useContext } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { Button } from '#components/button'
import { FormErrorMessage } from '#components/form-control'
import Plus from '#components/icons/Plus'
import { OptionType } from '#components/react-select'
import dayjs from 'dayjs'
import { TFunction } from 'i18next'
import { FieldArrayWithId, UseFormReturn } from 'react-hook-form'

import {
  availabilityIndicatorColor,
  quantityButtonLabel,
  textGrouper,
  thousandFormatter,
} from '../transaction-remove-stock.common'
import TransactionRemoveStockContext from '../transaction-remove-stock.context'
import { CreateTransactionRemoveForm } from '../transaction-remove-stock.type'

import 'dayjs/locale/id'
import 'dayjs/locale/en'

export type TColumn = {
  t: TFunction<['transactionCreate', 'common']>
  locale: string
  listDataExists?: boolean
  parentIndex?: number
  methods?: UseFormReturn<CreateTransactionRemoveForm>
  handleDeleteMaterial?: (index: number) => void
}

const TitleBlock = ({
  arrText,
}: {
  arrText: Array<{
    label: string
    className?: string
    isNotExists?: boolean
  }>
}) => (
  <div>
    {arrText
      .filter((item) => !item.isNotExists)
      ?.map(
        (item, index) =>
          item.label && (
            <div
              key={`_${index.toString()}`}
              className={`${item.className ?? 'ui-text-dark-teal'} ui-text-sm`}
            >
              {item.label}
            </div>
          )
      )}
  </div>
)

export const TextBox = ({ text }: { text: string }) => (
  <div className="ui-text-neutral-500 ui-border ui-border-neutral-300 ui-text-sm ui-py-[10px] ui-px-[14px] ui-rounded-md ui-bg-[#1018280D]">
    {text}
  </div>
)

export const MainColumn = ({
  t,
  locale,
  handleDeleteMaterial,
  methods,
}: TColumn) => {
  const { setStockData } = useContext(TransactionRemoveStockContext)

  const schema: Array<
    ColumnDef<FieldArrayWithId<CreateTransactionRemoveForm, 'items', 'id'>>
  > = [
    {
      header: 'SI.No.',
      accessorKey: 'no',
      size: 20,
      cell: ({ row }) => row.index + 1,
    },
    {
      header: t(
        'transactionCreate:transaction_remove_stock.input_table.column.material_info'
      ),
      accessorKey: 'material_info',
      cell: ({ row }) => (
        <TitleBlock
          arrText={[
            {
              label: row?.original?.material?.name ?? '',
              className: 'ui-text-dark-blue ui-text-sm ui-font-bold',
            },
            {
              label: textGrouper({
                text1: t(
                  'transactionCreate:transaction_remove_stock.input_table.column.activity'
                ),
                text2: row?.original?.activity?.name ?? '',
                separator: ': ',
              }),
              className: 'ui-text-dark-blue ui-text-sm',
            },
          ]}
        />
      ),
    },
    {
      header: t(
        'transactionCreate:transaction_remove_stock.input_table.column.stock_info'
      ),
      accessorKey: 'stock_info',
      cell: ({ row }) => (
        <div
          id="stock_on_hand_td"
          className={`ui-px-2 ui-py-3 ${availabilityIndicatorColor({
            availableQty: Number(row.original.total_qty),
            minQty: Number(row.original.min),
            maxQty: Number(row.original.max),
          })}`}
        >
          <TitleBlock
            arrText={[
              {
                label: textGrouper({
                  text1: t(
                    'transactionCreate:transaction_remove_stock.input_table.column.stock_on_hand'
                  ),
                  text2: thousandFormatter({
                    value: Number(row.original.total_qty),
                    locale,
                  }),
                  separator: ': ',
                }),
                className: 'ui-text-dark-blue ui-text-sm',
              },
              {
                label: textGrouper({
                  text1: t(
                    'transactionCreate:transaction_remove_stock.input_table.column.available_stock'
                  ),
                  text2: thousandFormatter({
                    value: Number(row.original.total_available_qty),
                    locale,
                  }),
                  separator: ': ',
                }),
                className: 'ui-text-dark-blue ui-text-sm',
              },
              {
                label: textGrouper({
                  text1: `(min: ${thousandFormatter({
                    value: Number(row.original.min),
                    locale,
                  })}`,
                  text2: `max: ${thousandFormatter({
                    value: Number(row.original.max),
                    locale,
                  })})`,
                  separator: ', ',
                }),
                className: 'ui-text-neutral-500 ui-text-sm',
              },
            ]}
          />
        </div>
      ),
    },
    {
      header: t(
        'transactionCreate:transaction_remove_stock.input_table.column.quantity'
      ),
      accessorKey: 'qty',
      cell: ({ row }) => (
        <>
          {methods
            ?.watch('items')
            ?.[row.index]?.stocks.filter(
              (stock) => Number(stock?.input_qty) > 0
            )
            .map((stock, idx) => (
              <TitleBlock
                key={`index_${idx?.toString()}`}
                arrText={[
                  {
                    label: textGrouper({
                      text1: t(
                        'transactionCreate:transaction_remove_stock.input_table.detail_column.batch_code'
                      ),
                      text2: stock?.batch?.code ?? '',
                      separator: ': ',
                    }),
                    className: 'ui-text-dark-blue ui-text-sm',
                  },
                  {
                    label: textGrouper({
                      text1: t(
                        'transactionCreate:transaction_remove_stock.input_table.detail_column.expired_date'
                      ),
                      text2:
                        dayjs(stock?.batch?.expired_date)
                          .locale(locale)
                          .format('DD MMM YYYY') ?? '',
                      separator: ': ',
                    }),
                    className: 'ui-text-dark-blue ui-text-sm',
                  },
                  {
                    label: textGrouper({
                      text1: t(
                        'transactionCreate:transaction_remove_stock.input_table.column.reason'
                      ),
                      text2:
                        stock?.other_reason ??
                        stock?.transaction_reason?.label ??
                        '',
                      separator: ': ',
                    }),
                    className: 'ui-text-dark-blue ui-text-sm',
                  },
                  {
                    label: textGrouper({
                      text1: t(
                        'transactionCreate:transaction_remove_stock.input_table.detail_column.material_status'
                      ),
                      text2:
                        (stock?.material_status as OptionType)?.label ?? '',
                      separator: ': ',
                    }),
                    className: 'ui-text-dark-blue ui-text-sm',
                    isNotExists: !stock?.material_status,
                  },
                  {
                    label: textGrouper({
                      text1: t(
                        'transactionCreate:transaction_remove_stock.input_table.column.quantity'
                      ),
                      text2: thousandFormatter({
                        value: Number(stock?.input_qty),
                        locale,
                      }),
                      separator: ': ',
                    }),
                    className:
                      'ui-text-dark-blue ui-text-sm ui-font-bold ui-mb-4',
                  },
                ]}
              />
            ))}
          <Button
            onClick={() => setStockData(row.original)}
            leftIcon={<Plus className="h-5 w-5" />}
            type="button"
            variant="outline"
          >
            {quantityButtonLabel({ stocks: row.original.stocks, t })}
          </Button>
          <FormErrorMessage>
            {methods?.formState?.errors?.items?.[row.index]?.stocks?.message}
          </FormErrorMessage>
        </>
      ),
    },
    {
      header: t(
        'transactionCreate:transaction_remove_stock.input_table.column.action'
      ),
      accessorKey: 'action',
      cell: ({ row: { index } }) => (
        <Button
          onClick={() => handleDeleteMaterial && handleDeleteMaterial(index)}
          type="button"
          variant="subtle"
          className="!ui-p-0 ui-text-danger-500"
        >
          {t('common:remove')}
        </Button>
      ),
    },
  ]

  return schema
}

export default {}
