export type EntityMaterialBulk = {
  file: string
  status: boolean
  notes: {
    [key: string]: string[]
  } | null
  created_at: string
  user_created_by: {
    id: number
    username: string
    firstname: string
    lastname: string
  }
}