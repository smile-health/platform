export type DisposalInstructionDetail = {
  activity: Activity
  activity_id: number
  bast_no: string
  created_at: string
  created_by: number
  device_type: number
  disposal_comments: DisposalComment[]
  disposal_items: DisposalItem[]
  id: number
  instruction_type_id: number
  instruction_type_label: string
  receiver: Receiver
  sender: Sender
  sender_id: number
  status: number
  status_label: string
  updated_at: string
  user_created_by: UserCreatedBy
  user_updated_by: UserUpdatedBy
}

export interface Activity {
  id: number
  name: string
}

export interface DisposalComment {
  comment: string
  created_at: string
  id: number
  status: number
  user: User
  user_id: number
}

export interface User {
  firstname: string
  fullname: string
  id: number
  lastname: string
  username: string
}

export interface DisposalItem {
  closing_qty?: number
  created_at?: string
  instruction_disposal_stocks?: InstructionDisposalStock[]
  master_material?: MasterMaterial
  material_id?: string
  opening_qty?: number
  qty?: number
  waste_info?: WasteInfo[]
}

export interface InstructionDisposalStock {
  disposal_discard_qty?: number
  disposal_received_qty?: number
  id?: number
  stock?: Stock
  stock_id?: number
  transaction_reasons?: TransactionReasons
}

export interface Stock {
  activity: StockActivity
  activity_id: number
  batch: Batch
  batch_id: number
  created_at: string
  created_by: number
  stock_id: number
  updated_at: string
  updated_by: number
}

export interface StockActivity {
  id: number
  name: string
}

export interface Batch {
  code: string
  expired_date: string
  id: number
  manufacture: Manufacture
  production_date: string
  status: number
}

export interface Manufacture {
  id: number
  name: string
}

export interface TransactionReasons {
  id: number
  title: string
}

export interface MasterMaterial {
  code: string
  consumption_unit_per_distribution_unit: number
  created_at: string
  created_by: number
  deleted_at: null
  deleted_by: null
  description: string
  global_id: number
  hierarchy_code: string
  id: number
  is_addremove: number
  is_managed_in_batch: number
  is_open_vial: number
  is_stock_opname_mandatory: number
  is_temperature_sensitive: number
  material_level: string
  material_level_id: number
  material_type: string
  material_type_id: number
  max_retail_price: number
  max_temperature: number
  min_retail_price: number
  min_temperature: number
  name: string
  parent_global_id: number
  parent_id: number
  program_id: number
  status: number
  unit_of_consumption: string
  unit_of_consumption_id: number
  unit_of_distribution: string
  unit_of_distribution_id: number
  updated_at: string
  updated_by: number
}

export interface WasteInfo {
  waste_bag_codes?: string
  waste_bag_histories?: WasteBagHistory[]
  waste_bag_total_weight?: string
  waste_bag_type_label?: string
}

export interface WasteBagHistory {
  status_id: string
  status_label: string
  updated_at: string
}

export interface Receiver {
  address: string
  entity_name: string
  id: number
  name: string
  user_uuid: string
  unit: string
}

export interface Sender {
  address: string
  city_name: string
  global_id: number
  id: number
  id_satu_sehat: number
  location: string
  name: string
  province_name: string
  tag: string
  type: number
  updated_at: string
  unit: string
}

export interface UserCreatedBy {
  firstname: string
  fullname: string
  id: number
  lastname: string
  username: string
}

export interface UserUpdatedBy {
  firstname: string
  fullname: string
  id: number
  lastname: string
  username: string
}
