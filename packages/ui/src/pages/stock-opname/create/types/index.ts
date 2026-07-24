import { OptionType } from '#components/react-select'
import {
  DetailStock,
  MaterialDetailStock,
  MaterialStock,
  Stock,
} from '#types/stock'

export type NewOpnameStocks = {
  batch: {
    id: number | null
    production_date: string
    expired_date: string
    code: string
    manufacture: {
      id: number | null
      name: string
      address?: string
    } | null
  } | null
  pieces_per_unit: number
  material_id: number
  activity: {
    id: number
    name: string
  }
  id?: number
  recorded_qty: number
  actual_qty?: number
  in_transit_qty: number
}

export type NewOpnameItems = {
  total_available_qty: number
  is_valid?: boolean
  material_id: number
  parent_material?: MaterialStock | null
  material?: MaterialDetailStock | null
  is_batch: boolean
  last_opname_date: string | null
  new_opname_stocks: NewOpnameStocks[]
}

export type StockOpnameCreateForm = {
  entity: OptionType | null
  periode:
    | (OptionType & {
        month_period: number
        year_period: number
        start_period: string
        end_period: string
      })
    | null
  new_opname_items: NewOpnameItems[]
}

export type StockOpnameCreateItemStocksForm = {
  new_opname_stocks: NewOpnameStocks[]
}

export type PopulatedBatchAndActivity = {
  activity_id?: number | null
  batch_code?: string | null
}

export type StockOpnameCreateItemStockBatchForm = {
  is_batch?: boolean
  activity?: OptionType | null
  batch_code?: string
  expired_date?: string
  production_date?: string
  manufacture?: OptionType | null
  populated_batch?: PopulatedBatchAndActivity[]
}

export type User = {
  id: number
  username: string
  firstname: string
  lastname: string
  fullname: string
}

export type ListPeriodeResponse = {
  statusCode: number
  total_item: number
  page: number
  item_per_page: number
  total_page: number
  list_pagination: number[]
  data: Array<{
    id: number
    start_date: string
    end_date: string
    month_period: number
    year_period: number
    status: number
    created_at: string
    updated_at: string
    name: string
    user_created_by: User
    user_updated_by: User | null
    cutoff_date: string
  }>
}

export type StockOpnameDetailStock = DetailStock & {
  parent_material?: MaterialStock
}

type Material = {
  id: number
  name: string
  unit_of_distribution: string
  code: string
  description: string
  pieces_per_unit: number
  unit: string
  temperature_sensitive: number
  temperature_min: number
  temperature_max: number
  managed_in_batch: number
  status: number
  is_vaccine: number
  is_stockcount: number
  is_addremove: number
  updated_at: string
  is_openvial: number
  kfa_code: string | null
  need_sequence: number
  parent_id: string | null
  kfa_level_id: number
  material_activities: MaterialActivity[]
  new_opname_items: any[]
  is_opname: number
  last_opname_date?: string
}

type MaterialActivity = {
  id: number
  name: string
  is_ordered_sales: number
  is_ordered_purchase: number
  is_patient_id: number
  master_material_has_activities: MasterMaterialHasActivities
}

type MasterMaterialHasActivities = {
  activity_id: number
  material_id: number
}

type Entity = {
  type_label: string
  id: number
  name: string
  address: string
  code: string | null
  type: number
  status: number
  created_at: string | null
  updated_at: string | null
  deleted_at: string | null
  province_id: string | null
  regency_id: string | null
  village_id: string | null
  sub_district_id: string | null
  lat: string | null
  lng: string | null
  postal_code: string | null
  is_vendor: number
  bpom_key: string | null
  is_puskesmas: number
  rutin_join_date: string | null
  is_ayosehat: number
  mapping_entity: string | null
  province: Location
  regency: Location
  sub_district: Location
  entity_tags: EntityTag[]
}

type Location = {
  id: string
  name: string
}

type EntityTag = {
  id: number
  entity_entity_tags: EntityEntityTags
}

type EntityEntityTags = {
  entity_id: number
  entity_tag_id: number
}

type Manufacture = {
  name: string
  address: string
}

type Batch = {
  manufacture_name: string
  id: number
  code: string
  expired_date: string
  production_date: string
  manufacture_id: number
  status: number
  manufacture: Manufacture
}

export type OpnameItemStock = {
  id: number
  entity_has_material_id: number
  batch_id: string | null
  status: string | null
  qty: number
  created_by: string | null
  updated_by: string | null
  updatedAt: string
  createdAt: string
  allocated: number
  activity_id: number
  open_vial: number
  year: string | null
  price: number | null
  total_price: number | null
  batch: Batch | null
  activity: Activity
  unsubmit_distribution_qty: number
  unsubmit_return_qty: number
  stock_in_transit: number
}

type Activity = {
  id: number
  name: string
  is_ordered_sales: number
  is_ordered_purchase: number
  is_patient_id: number
}

export type ListStockResponse = {
  statusCode: number
  total_item: number
  page: number
  item_per_page: number
  total_page: number
  list_pagination: number[]
  data: Stock[]
}

export type ColdStorage = {
  id: number
  entity_id: number
  volume_asset: number
  total_volume: number
  percentage_capacity: number
  projection_volume_asset: number
  projection_total_volume: number
  projection_percentage_capacity: number
  created_at: string
  updated_at: string
  status_capacity: number
  entity: Entity
}

export type ListColdStoragesResponse = {
  statusCode: number
  total: number
  page: string
  perPage: string
  list: ColdStorage[]
}

export type StockOpnameBody = {
  activity_id: number
  stock_id: number | null
  recorded_qty: number
  actual_qty: number
  in_transit_qty: number
  batch_code: string
  expired_date: string
}

export type ItemsOpnameBody = {
  material_id: number
  stocks: StockOpnameBody[]
}

export type CreateStockOpnameBody = {
  entity_id: number
  period_id: number
  items: ItemsOpnameBody[]
}
