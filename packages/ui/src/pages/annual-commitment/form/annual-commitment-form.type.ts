import { OptionType } from '#components/react-select'

export type CentralAllocationItem = {
  id?: number
  item_id?: number
  material: OptionType | null
  provinceReceiver: OptionType | null
  numberVial: number | null
  numberDose: number | null
  piecesPerUnit?: number | null
}

export type BufferItem = {
  id?: number
  item_id?: number
  material: OptionType | null
  numberVial: number | null
  numberDose: number | null
  piecesPerUnit?: number | null
}

export type AnnualCommitmentFormValues = {
  contract_number: OptionType | null
  year: OptionType | null
  contract_start_date: Date | null
  contract_end_date: Date | null
  supplier: OptionType | null
  description: string | null
  centralAllocations: CentralAllocationItem[]
  bufferItems: BufferItem[]
}

export type AnnualCommitmentItem = {
  id?: number | null
  province_id?: number | null
  vial_quantity: number | null
  dose_quantity: number | null
  material_id: number | null
}

export type AnnualCommitmentFormPayload = {
  contract_number?: string | number
  year?: number | null
  contract_start_date?: string | null
  contract_end_date?: string | null
  supplier?: number | null
  information?: string | null
  items?: AnnualCommitmentItem[]
  vendor_id?: number | null
}
