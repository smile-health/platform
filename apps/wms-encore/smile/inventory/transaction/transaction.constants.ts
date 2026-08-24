// Ported verbatim from apps/main/src/common/constants/transaction.ts — only
// the two constants needed to write ws_transactions rows for the order
// lifecycle's ship/fulfill/cancel transitions (see stock.service.ts). Label
// maps (MAP_TRANSACTION_TYPE_LABEL etc.) intentionally NOT ported — out of
// scope for this pass.
export const TRANSACTION_TYPE = {
  STOCK_COUNT: 1,
  ISSUES: 2,
  RECEIPTS: 3,
  DISCARDS: 4,
  RETURN: 5,
  RECEIPT_OPEN_VIAL: 6,
  ADD_STOCK: 7,
  REMOVE_STOCK: 8,
  CANCEL_DISCARD: 9,
  CONSUMPTION: 10,
  TRANSFER_STOCK: 11,
} as const;

export const TRANSACTION_CHANGE_TYPE = {
  ADD: 1,
  RESTOCK: 2,
  REMOVE: 3,
  TRANSFER: 4,
} as const;
