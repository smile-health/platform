import { OptionType } from '#components/react-select'

export type DisposalInstructionListFilterValues = {
  bast_no?: string
  instruction_type?: OptionType
  created_date: {
    start: string
    end: string
  }
  activity?: OptionType
  entity_tag_id?: OptionType
  province?: OptionType
  regency?: OptionType
  entity?: OptionType
}

export type DisposalInstructionTypeListItem = {
  id: number
  title: string
}

export type DisposalInstructionListItem = {
  activity_id: string
  activity_label: string
  bast_no: string
  created_at: string
  device_type: number
  disposal_items_count: number
  id: number
  instruction_type_id: number
  instruction_type_label: string
  sender_entity_name: string
  status_id: number
  status_label: string
  updated_at: string
  user_created_by: {
    email?: null
    firstname: string
    id: number
    lastname?: null
    role_label: string
    username: string
  }
}
