import { removeEmptyObject } from '#utils/object'
import { getReactSelectValue } from '#utils/react-select'
import { Values } from 'nuqs'

export function getSelfDisposalilter(
  isDownload: boolean = false,
  query: Values<Record<string, any>>
) {

  const filter = {
    ...(!isDownload ? { page: query?.page, paginate: query?.paginate } : {}),
    activity_id: query?.activity_id?.value,
    is_vaccine: query?.is_vaccine?.value,
    material_id: getReactSelectValue(query?.material_id),
    extermination_transaction_type_id: query?.type_id?.value,
    order_status: query?.order_status?.value,
    transaction_reason_id: query?.transaction_reason_id?.value,
    start_date: query?.start_date,
    end_date: query?.end_date,
    ...(query?.date_range && {
      start_date: query?.date_range.start,
      end_date: query?.date_range.end,
    }),
    entity_tag_id: query?.entity_tag_id?.value,
    province_id: query?.province_id?.value,
    regency_id: query?.regency_id?.value,
    material_type_id: getReactSelectValue(query?.material_type_id),
    ...query?.primary_health_care && {
      entity_id: query?.primary_health_care?.value,
    },
    disposal_method_id: query?.disposal_method_id?.value,
    ...query?.primary_vendor_id && {
      entity_id: query?.primary_vendor_id?.value,
    }
  }

  return removeEmptyObject(filter)
}
