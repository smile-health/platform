import { isObject } from '#utils/object'

import { STATUS_PLANS } from './program-plan-list.constants'
import {
  ListProgramPlanParams,
  TProgramPlanDataStatus,
} from './program-plan-list.type'

export const processParams = ({
  params,
  isExport = false,
}: {
  params:
    | ListProgramPlanParams
    | Omit<ListProgramPlanParams, 'paginate' | 'page'>
  isExport: boolean
}) =>
  Object.entries(params).reduce((acc, [key, value]) => {
    if (isObject(value)) return { ...acc, [key]: value?.value }
    if (isExport && ['paginate', 'page']?.includes(key)) return acc
    return { ...acc, [key]: value }
  }, {})

export const capitalize = (text: string) => {
  if (text.includes(' '))
    return text
      .split(' ')
      .map((item) => item.charAt(0).toUpperCase() + item.slice(1).toLowerCase())
      .join(' ')
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase() || ''
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

export const statusConverter = (status: TProgramPlanDataStatus | null) => {
  if (!status) return []

  const convertedStatus = Object.keys(status).reduce(
    (acc, key) => {
      acc.push({
        name: key,
        status: status[key as keyof TProgramPlanDataStatus] ?? false,
      })
      return acc
    },
    [] as { name: string; status: boolean }[]
  )

  const sortedStatus = STATUS_PLANS.reduce(
    (acc, item) => {
      const found = convertedStatus.find(
        (statusItem) => statusItem.name === item.name
      )
      if (found) acc.push({ ...found, required: item.required })
      return acc
    },
    [] as { name: string; status: boolean; required: boolean }[]
  )

  return sortedStatus
}
