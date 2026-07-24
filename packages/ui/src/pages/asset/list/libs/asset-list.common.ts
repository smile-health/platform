import { OptionType } from '#components/react-select'
import { ENTITY_TYPE } from '#constants/entity'
import { hasPermission } from '#shared/permission/index'
import { RequestloginResponse } from '#types/auth'
import { isObject } from '#utils/object'

import { ListAssetParams, TAncientResponse } from './asset-list.types'

export const processParams = ({
  params,
  isExport = false,
}: {
  params: ListAssetParams | Omit<ListAssetParams, 'paginate' | 'page'>
  isExport: boolean
}) =>
  Object.entries(params).reduce((acc, [key, value]) => {
    if (isObject(value)) return { ...acc, [key]: (value as OptionType)?.value }
    if (isExport && ['paginate', 'page']?.includes(key)) return acc
    return { ...acc, [key]: value }
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

export const filterOfUser = (user?: RequestloginResponse) => {
  const userEntity = user?.entity
  const isDisabledProvinceByRole = !hasPermission('transaction-view')
  const isDisabledRegencyByRole =
    !hasPermission('transaction-view') &&
    Number(userEntity?.type) !== ENTITY_TYPE.PROVINSI

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
    isDisabledProvinceByRole,
    isDisabledRegencyByRole,
    defaultProvince,
    defaultRegency,
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
