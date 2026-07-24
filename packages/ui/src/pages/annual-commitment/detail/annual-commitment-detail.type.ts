export type CentralAllocationItem = {
  id: number
  material: string
  provinceReceiver: string
  numberVial: number
  numberDose: number
}

export type BufferItem = {
  id: number
  material: string
  numberVial: number
  numberDose: number
}

export type AnnualCommitmentDetail = {
  id: number
  contract_number: string
  contractDate: string
  contract_end_date: string
  year: number
  supplier: string
  information: string | null
  centralAllocations: CentralAllocationItem[]
  bufferItems: BufferItem[]
}
