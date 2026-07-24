import { numberFormatter } from "#utils/formatter";
import {
  CreateTransactionDiscard,
  PayloadTransactionDiscard,
} from "./transaction-discard.type";

export const createPayloadTransactionDiscard = (values: CreateTransactionDiscard): PayloadTransactionDiscard => {
  const materials = values.items?.reduce((acc: PayloadTransactionDiscard['materials'], x) => {
    x.details.forEach(y => {
      if (!y.is_open_vial && y.qty) {
        acc.push({
          transaction_type_id: y.transaction_type_id,
          other_reason: null,
          material_id: y.material_id,
          stock_id: y.stock_id,
          stock_quality_id: y.stock_quality?.value || null,
          qty: y.qty || 0,
          transaction_reason_id: y.transaction_reason?.value
        })
      } else if (y.is_open_vial && (y.open_vial || y.close_vial)) {
        acc.push({
          transaction_type_id: y.transaction_type_id,
          other_reason: null,
          material_id: y.material_id,
          stock_id: y.stock_id,
          stock_quality_id: y.stock_quality?.value || null,
          transaction_reason_id: y.transaction_reason?.value,
          open_vial: y.open_vial || 0,
          close_vial: y.close_vial || 0
        })
      }
    })

    return acc
  }, [])

  const activityId = values.activity && 'value' in values.activity ? values.activity.value : values.activity

  return {
    entity_id: values.entity?.value,
    activity_id: activityId,
    entity_activity_id: values?.entity_activity_id,
    materials,
  }
}

export const getValueNumber = (value: number | null | undefined, language: string) =>
  typeof value === 'number' ? numberFormatter(value, language) : '-'
