import { TProgram } from './program'

export type TManufacturer = {
  id: number
  name: string
  reference_id: string
  description: string
  contact_name: string
  phone_number: string
  email: string
  address: string
  status: number
  created_by: number
  updated_by: number
  created_at: string
  updated_at: string
  manufacture_type: {
    id: number
    name: string
  }
  programs: (TProgram & {
    manufacture_id: number
  })[]
  user_created_by: TManufacturerUserCreated
  user_updated_by: TManufacturerUserCreated
}

type TManufacturerUserCreated = {
  id: number
  username: string
  firstname: string
  lastname: string
}
