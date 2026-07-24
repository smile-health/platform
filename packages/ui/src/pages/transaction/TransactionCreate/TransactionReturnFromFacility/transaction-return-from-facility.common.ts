import { OptionType } from '#components/react-select'
import { BOOLEAN } from '#constants/common'
import dayjs from 'dayjs'

import { CreateTransactionReturnFromFacilityForm } from './transaction-return-from-facility.type'

export const textGrouper = ({
  text1,
  text2 = null,
  separator = ', ',
}: {
  text1: string
  text2?: string | null
  separator?: string
}) => {
  if (!text2 || text2 === null) return text1
  return `${text1}${separator}${text2}`
}

export const thousandFormatter = ({
  value,
  locale = 'en-US',
}: {
  value: number
  locale: string
}) => {
  return new Intl.NumberFormat(locale).format(value) || ''
}

export const formatDate = (
  date: string,
  locale: string,
  format: string = 'DD MMM YYYY'
) => (date ? dayjs(date).locale(locale).format(format)?.toUpperCase() : '-')

export const defineMinSize = (
  listDataExists: boolean,
  size: number,
  constantSize: number = 20
) => (listDataExists ? size : constantSize)

// Submitter
export const submitTransactionReturnFromFacility = (
  value: CreateTransactionReturnFromFacilityForm
) => {
  const isOpenVial = value?.items?.some(
    (item) => Number(item?.material?.is_open_vial) === BOOLEAN.TRUE
  )
  const process = {
    entity_id: Number(value?.entity?.value),
    customer_id: Number(value?.customer?.value),
    actual_transaction_date: dayjs(value?.actual_date).format('YYYY-MM-DD'),
    activity_id: Number((value?.activity as OptionType)?.value),
    entity_activity_id: value?.entity_activity_id,
    transactions:
      value?.items
        ?.map((transaction) => {
          const qtyObject = isOpenVial
            ? {
                open_vial: transaction?.open_vial_qty
                  ? Number(transaction?.open_vial_qty)
                  : null,
                close_vial: transaction?.return_qty
                  ? Number(transaction?.return_qty)
                  : null,
                broken_open_vial: transaction?.discard_open_vial_qty
                  ? Number(transaction?.discard_open_vial_qty)
                  : null,
                broken_close_vial: transaction?.discard_qty
                  ? Number(transaction?.discard_qty)
                  : null,
              }
            : {
                qty: Number(transaction?.return_qty),
                broken_qty: transaction?.discard_qty
                  ? Number(transaction?.discard_qty)
                  : null,
              }
          return {
            transaction_id: Number(transaction?.id),
            transaction_reason_id: transaction?.discard_reason
              ? Number(transaction?.discard_reason?.value)
              : null,
            stock_id: transaction?.stock?.id
              ? Number(transaction?.stock?.id)
              : null,
            other_reason: transaction?.other_reason ?? null,
            ...qtyObject,
          }
        })
        ?.map((obj) =>
          Object.fromEntries(
            Object.entries(obj).filter(
              ([_, value]) => value !== null && value !== undefined
            )
          )
        ) ?? [],
  }

  return process
}

export default {}
