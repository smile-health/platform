import { UseFilter } from '#components/filter'
import { OptionType } from '#components/react-select'
import { TFunction } from 'i18next'

import {
  listTransactionTypes,
  loadReason,
} from '../../../transaction/transaction.services'
import { defaultEntityTags } from '../../dashboard.constant'
import { ADD_STOCK, REDUCE_STOCK } from '../dashboard-inventory.constant'
import dashboardInventoryFilterSchema from './dashboardInventoryFilterSchema'

export default function dashboardCountStockFilterSchema(
  t: TFunction<'dashboardInventory'>,
  tDashboard: TFunction<'dashboard'>,
  lang = 'en'
) {
  const defaultEntityTag = defaultEntityTags(tDashboard)

  const periods = [
    {
      label: t('data.dayly'),
      value: 'day',
    },
    {
      label: t('data.montly'),
      value: 'month',
    },
  ]

  const initialSchema = dashboardInventoryFilterSchema(
    t,
    tDashboard,
    lang,
    periods,
    defaultEntityTag
  )

  const additionalSchema = [
    {
      id: 'select-transaction-type',
      type: 'select',
      name: 'transaction_type',
      label: t('form.transaction_type.label'),
      placeholder: t('form.transaction_type.placeholder'),
      isClearable: false,
      loadOptions: async () => {
        const response = await listTransactionTypes({
          page: 1,
          paginate: 50,
          is_enable: 1,
        })

        const result: OptionType[] = []

        if (response?.data?.length) {
          response.data.forEach((type) => {
            if (type?.id === ADD_STOCK || type?.id === REDUCE_STOCK) {
              result.push({
                label: type?.title,
                value: type?.id,
              })
            }
          })
        }

        return result
      },
      defaultValue: {
        value: ADD_STOCK,
        label: t('data.stock.add'),
      },
    },
    {
      id: 'select-reason',
      type: 'select-async-paginate',
      name: 'reasons',
      label: t('form.reason.label'),
      placeholder: t('form.reason.placeholder'),
      loadOptions: loadReason,
      isMulti: true,
      additional: ({ getReactSelectValue }) => {
        const transactionTypeId = getReactSelectValue('transaction_type')
        return {
          page: 1,
          transaction_type_id: transactionTypeId,
          status: 1,
        }
      },
      defaultValue: null,
    },
  ] satisfies UseFilter

  return [...initialSchema, ...additionalSchema]
}
