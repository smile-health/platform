import { TCreateLoggerData } from './asset-inventory-detail.types'

export const underscoredPrefixer = (fieldIndex: number) =>
  fieldIndex > 0 ? `_${fieldIndex + 1}` : ''

export const groupingMultipleObject = ({
  dataObject = {},
  takenKey = [],
  removeNullValue = false,
}: {
  dataObject?: Record<string, any> | null
  takenKey?: string[]
  removeNullValue?: boolean
}) => {
  const groupingData = dataObject
    ? Object.entries(dataObject)?.reduce(
        (acc: Record<string, any>[], [key, value]) => {
          const baseKey =
            takenKey?.find((base) => key?.startsWith(base)) ?? null
          if (baseKey) {
            const suffix = key?.slice(baseKey.length)?.split('_')?.[1] || '0'
            const index = parseInt(suffix, 10)
            acc[index] = acc[index] || {}
            acc[index][key] = value
          }
          return acc
        },
        []
      )
    : []
  if (groupingData) {
    const filteredArrayFromEmpty = groupingData?.filter((itm) => itm !== null)
    if (removeNullValue) {
      return filteredArrayFromEmpty?.filter((itm) =>
        Object.values(itm).some((val) => val !== null)
      )
    }
    return filteredArrayFromEmpty
  }
  return []
}

export const processingLoggerInput = (data: TCreateLoggerData) => ({
  id: data?.asset_name?.value ?? null,
  child_pos: data?.sensor ? Number(data?.sensor) : null,
})
