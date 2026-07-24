import { parseDateTime } from '#utils/date'
import { removeEmptyObject } from '#utils/object'
import dayjs from 'dayjs'
import { Values } from 'nuqs'

import { OrderStatusEnum } from '../order.constant'
import { TOrder, TOrderUserUpdateTime } from './order-list.type'

export function determineId(
  primary_vendor_id: string,
  primary_health_care_id: string
) {
  if (primary_vendor_id) {
    return primary_vendor_id
  }

  if (primary_health_care_id) {
    return primary_health_care_id
  }
}

export function handleFilterParams(
  values: Values<Record<string, any>>,
  isCursor = false
) {
  const primaryVendorId = values?.primary_vendor?.value
  const primaryHealthCareId = values?.primary_health_care?.value
  const districtId = values?.district?.value
  const provinceId = values?.province?.value
  const purpose = values?.purpose !== 'all' ? values?.purpose : null
  const isVendor = purpose === 'sales'
  const isCustomer = purpose === 'purchase'

  const id = determineId(primaryVendorId, primaryHealthCareId)

  const newFilter = {
    page: values?.page ?? 1,
    paginate: values?.paginate,
    activity_id: values?.activity?.value,
    order_number: values?.order_number,
    status: values?.status?.value,
    service_type: values?.delivery_type?.value,
    type: values?.type?.value,
    integration: values?.integration_type?.value,
    entity_tag_id: values?.entity_tag?.value,
    entity_id: primaryVendorId,
    province_id: provinceId,
    regency_id: districtId,
    // entity_puskesmas_id: primaryHealthCareId,
    purpose,
    ...(isVendor && {
      vendor_id: id,
    }),
    ...(isCustomer && {
      customer_id: id,
    }),
    ...(values?.date_range?.start && {
      from_date: dayjs(values?.date_range?.start).format('YYYY-MM-DD'),
    }),
    ...(values?.date_range?.end && {
      to_date: dayjs(values?.date_range?.end).format('YYYY-MM-DD'),
    }),
  }

  if (isCursor) {
    delete newFilter.page
  }

  return removeEmptyObject(newFilter)
}

export function determineUpdatedDate(data: TOrder) {
  const dateMapping: Record<OrderStatusEnum, keyof TOrderUserUpdateTime> = {
    [OrderStatusEnum.Pending]: 'created_at',
    [OrderStatusEnum.Confirmed]: 'confirmed_at',
    [OrderStatusEnum.Allocated]: 'allocated_at',
    [OrderStatusEnum.Shipped]: 'shipped_at',
    [OrderStatusEnum.Fulfilled]: 'fulfilled_at',
    [OrderStatusEnum.Cancelled]: 'cancelled_at',
    [OrderStatusEnum.Draft]: 'drafted_at',
  }

  const dateField = dateMapping?.[data?.status]
  return parseDateTime(data?.[dateField], 'DD MMM YYYY HH:mm').toUpperCase()
}
