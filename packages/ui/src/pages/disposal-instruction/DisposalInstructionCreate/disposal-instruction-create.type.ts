import { OptionType } from '#components/react-select'

import { DisposalItemStockDetail } from '../../disposal/distribution-disposal/types/DistributionDisposal'
import { SelectedMaterialDetailStock } from './use-cases/material-selection/material-selection.type'

export namespace DisposalInstructionCreateFormValues {
  export type Root = {
    entity?: OptionType | null
    activity?: OptionType | null
    instruction_type?: OptionType | null
    disposal_items: DisposalItem[]
    bast_no: string | null
    disposal_comments: string | null
  }

  export type DisposalItem = {
    material: DisposalItemStockDetail['material'] | null
    qty: number
    stocks: Stock[]
  }

  export type Stock = {
    batch?: SelectedMaterialDetailStock['batch']
    activity: SelectedMaterialDetailStock['activity']
    stock_id: SelectedMaterialDetailStock['id']
    stock_qty: SelectedMaterialDetailStock['disposal_qty']
    disposal_stocks: Array<DisposalStock> | null
  }

  export type DisposalStock = {
    disposal_discard_qty: number | null
    discard_qty: number | null
    disposal_received_qty: number | null
    received_qty: number | null
    disposal_stock_id: number | null
    consumption_unit_per_distribution_unit: number | undefined
    transaction_reasons: {
      id: number
      title: string
    } | null
  }
}
