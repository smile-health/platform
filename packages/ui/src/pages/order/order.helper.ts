import { MutableRefObject } from 'react'
import { orderTypeList } from '#constants/order'
import { TFunction } from 'i18next'

export function getOrderType(type: number, t: TFunction) {
  const orderType = orderTypeList(t)?.find((item) => item?.value === type)

  return orderType?.label || '-'
}

export function handleExternalSubmit(
  ref: MutableRefObject<HTMLFormElement | null>
) {
  ref?.current?.dispatchEvent(
    new Event('submit', { cancelable: true, bubbles: true })
  )
}

// format date is YYYY-MM-DD
export function isLessThanToday(date: string) {
  const selectedDate = new Date(date)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return selectedDate < today
}
