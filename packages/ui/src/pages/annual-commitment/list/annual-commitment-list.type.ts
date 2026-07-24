export type AnnualCommitmentListItem = {
  id: number
  contract_number: string
  year: number
  material: string
  supplier: string
  updated_at: string
  updated_by: {
    firstname: string
    lastname: string
  }
}
