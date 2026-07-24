export type APIResponse<T> = {
  item_per_page: number
  list_pagination: number[]
  data?: T
  page: number
  total_item: number
  total_page: number
}
