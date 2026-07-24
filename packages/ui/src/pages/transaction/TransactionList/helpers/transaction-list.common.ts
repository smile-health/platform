import { hasPermission } from '#shared/permission/index'
import { RequestloginResponse } from '#types/auth'
import { TSingleOptions } from '#types/common'
import { ListTransactionsParams } from '#types/transaction'
import { isObject } from '#utils/object'

export const processParams = ({
  params,
  isExport = false,
}: {
  params:
    | ListTransactionsParams
    | Omit<ListTransactionsParams, 'paginate' | 'page'>
  isExport: boolean
}) =>
  Object.fromEntries(
    Object.entries(params).flatMap(([key, value]): [string, any][] => {
      if (isExport && ['paginate', 'page'].includes(key)) {
        return [] // skip
      }

      if (key === 'material_level_id') {
        return [[key, null]]
      }

      if (key === 'date_range') {
        const { start, end } = (value as { start: string; end: string }) || {}
        return [
          ['start_date', start],
          ['end_date', end],
        ]
      }

      if (key === 'entity_id') {
        const fallback = isObject(params?.entity_user_id)
          ? params?.entity_user_id?.value
          : (value as TSingleOptions)?.value
        return [['entity_id', fallback]]
      }

      if (key === 'entity_user_id') {
        return []
      }

      if (isObject(value)) {
        return [[key, (value as TSingleOptions)?.value]]
      }

      return [[key, value]]
    })
  )

export const capitalize = (text: string) => {
  if (text.includes(' '))
    return text
      .split(' ')
      .map((item) => item.charAt(0).toUpperCase() + item.slice(1).toLowerCase())
      .join(' ')
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase() || ''
}

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
  return `${text1}${text1 ? separator : ''}${text2}`
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

export const handleScrollLeft = (containerId: string) => {
  const targetScroll = document.getElementById(containerId)
  if (targetScroll) {
    setTimeout(() => {
      targetScroll.scrollTo({
        behavior: 'smooth',
        left: 0,
      })
    }, 150)
  }
}

export default {}
