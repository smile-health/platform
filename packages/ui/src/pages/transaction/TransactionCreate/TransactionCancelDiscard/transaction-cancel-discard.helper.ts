import { CreateCancelTransactionDiscard, PayloadCancelTransactionDiscard } from "./transaction-cancel-discard.type";

export const createPayloadCancelTransactionDiscard = (values: CreateCancelTransactionDiscard): PayloadCancelTransactionDiscard => {
  const transactions: PayloadCancelTransactionDiscard['transactions'] = values.items.map(item => ({
    stock_id: item.stock_id,
    transaction_reason_id: item.transaction_reason?.value || 0,
    transaction_ids: item.details.map(x => x.id)
  }))

  const activityId = values.activity && 'value' in values.activity ? values.activity.value : values.activity

  return {
    entity_id: values.entity?.value,
    activity_id: activityId,
    entity_activity_id: values?.entity_activity_id,
    transactions
  }
}