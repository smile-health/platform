import { BOOLEAN } from '#constants/common'
import { hasPermission } from '#shared/permission/index'
import { RequestloginResponse } from '#types/auth'
import { TSingleOptions } from '#types/common'
import { isObject } from '#utils/object'

import {
  ListStockOpnameParams,
  TAncientResponse,
} from './stock-opname-list.types'

export const processParams = ({
  params,
  isExport = false,
}: {
  params:
    | ListStockOpnameParams
    | Omit<ListStockOpnameParams, 'paginate' | 'page'>
  isExport: boolean
}) =>
  Object.entries(params).reduce((acc, [key, value]) => {
    switch (key) {
      case 'expired_date_range':
        return {
          ...acc,
          expired_start_date:
            (value as { start: string; end: string })?.start || null,
          expired_end_date:
            (value as { start: string; end: string })?.end || null,
        }
      case 'created_at_range':
        return {
          ...acc,
          created_from:
            (value as { start: string; end: string })?.start || null,
          created_to: (value as { start: string; end: string })?.end || null,
        }
      case 'only_have_qty':
        return {
          ...acc,
          only_have_qty: value === BOOLEAN.TRUE ? BOOLEAN.FALSE : BOOLEAN.TRUE,
        }
      default:
        if (isObject(value) && key !== 'date_range')
          return { ...acc, [key]: (value as TSingleOptions)?.value }
        if (isExport && ['paginate', 'page']?.includes(key)) return acc
        return { ...acc, [key]: value }
    }
  }, {})

export const textGrouper = ({
  text1,
  text2 = null,
  separator = ', ',
}: {
  text1: string
  text2?: string | null
  separator?: string
}) => {
  if (!text2 || text2 === null) return text1
  return `${text1}${separator}${text2}`
}

export const thousandFormatter = ({
  value,
  locale = 'en-US',
}: {
  value: number
  locale: string
}) => {
  return new Intl.NumberFormat(locale).format(value) || ''
}

export const defineMinSize = (
  listDataExists: boolean,
  size: number,
  constantSize: number = 20
) => (listDataExists ? size : constantSize)

export const filterOfUser = (user: RequestloginResponse) => {
  const userEntity = user?.entity

  const hasGlobalPermission = hasPermission('transaction-enable-select-entity')

  const defaultProvince = userEntity?.province
    ? {
        value: userEntity.province.id,
        label: userEntity.province.name,
      }
    : null

  const defaultRegency = userEntity?.regency
    ? {
        value: userEntity.regency.id,
        label: userEntity.regency.name,
      }
    : null

  return {
    defaultProvince: !hasGlobalPermission ? defaultProvince : null,
    defaultRegency: !hasGlobalPermission ? defaultRegency : null,
  }
}

export const overrrideResponse = (response: TAncientResponse) => ({
  item_per_page: Number(response?.perPage),
  total_item: response?.total,
  total_page: Math.ceil(response?.total / Number(response?.perPage)),
  page: Number(response?.page),
  list_pagination: [50, 100, 150, 200],
  data: response?.list,
  statusCode: response?.statusCode,
})

export default {}
