import { DisposalItemStockDetail } from '../../../../disposal/distribution-disposal/types/DistributionDisposal'

export type SelectedMaterial = DisposalItemStockDetail
export type SelectedMaterialDetailStock =
  DisposalItemStockDetail['details'][number]['stocks'][number]
