import { OptionType } from "#components/react-select";
import { DetailStock } from "#types/stock";
import { CreateTransactionDetail } from "../transaction-create.type";

type OmitPayloadMateiral =
  'available_qty' |
  'is_temperature_sensitive' |
  'consumption_unit_per_distribution_unit' |
  'stock_quality' |
  'transaction_reason' |
  'is_open_vial' |
  'on_hand'

export type DiscardItem = {
  transaction_type_id: number
  transaction_reason: OptionType | null
  other_reason: null | string
  material_id: number
  stock_id: number
  available_qty: number
  is_temperature_sensitive: number
  stock_quality: OptionType | null
  qty?: number
  consumption_unit_per_distribution_unit: number
  is_open_vial: number
  on_hand: number
  open_vial?: number
  close_vial?: number
}

export type ItemTransactionDiscard =
  DetailStock &
  { material_id: number } &
  { details: DiscardItem[] }

export type ItemsTransactionDiscard = Array<ItemTransactionDiscard>

export type CreateTransactionDiscard = CreateTransactionDetail & {
  type: 'discard'
  items: ItemsTransactionDiscard
}

export type PayloadTransactionDiscard = {
  entity_id: number
  activity_id: number
  entity_activity_id: number | null | undefined
  materials: Array<
    Omit<DiscardItem, OmitPayloadMateiral> &
    { stock_quality_id: number, transaction_reason_id: number }
  >
}
