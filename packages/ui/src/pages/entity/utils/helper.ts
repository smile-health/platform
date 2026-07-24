import { entityTypeList } from '#constants/entity'
import { ActivityData } from '#types/activity'
import { TDetailEntity } from '#types/entity'
import { parseDateTime } from '#utils/date'
import { TFunction } from 'i18next'
import * as yup from 'yup'

import { formSchema } from '../schema/EntitySchemaForm'
import { IS_CONSUMPTION } from '../utils/constants'

type FormData = yup.InferType<typeof formSchema>
type TLocationsValue = { value: number; label: string } | undefined

const extractLocations = (locations: TDetailEntity['locations']) => {
  const result = {
    province: undefined as TLocationsValue,
    regency: undefined as TLocationsValue,
    sub_district: undefined as TLocationsValue,
    village: undefined as TLocationsValue,
  }

  locations.forEach((x) => {
    if (x.level === 0) result.province = { label: x.name, value: x.id }
    if (x.level === 1) result.regency = { label: x.name, value: x.id }
    if (x.level === 2) result.sub_district = { label: x.name, value: x.id }
    if (x.level === 3) result.village = { label: x.name, value: x.id }
  })

  return result
}

export const reformatFromDetail = (
  values: TDetailEntity,
  activities: ActivityData[]
): FormData => {
  return {
    activities_date:
      activities.map((x) => {
        const currentActivity = values.activities_date?.find(
          (y) => y.id === x.id
        )

        return {
          end_date: currentActivity?.end_date ?? '',
          id: String(x.id),
          start_date: currentActivity?.start_date ?? '',
        }
      }) || [],
    address: values.address,
    code: values.code,
    entity_tag_id: values.entity_tag_id ?? 0,
    is_ayosehat: String(values.is_ayosehat ?? 0),
    is_puskesmas: String(values.is_puskesmas ?? 0),
    is_vendor: String(values.is_vendor ?? 0),
    lat: values.lat,
    lng: values.lng,
    name: values.name,
    postal_code: values.postal_code,
    province_id: values.province_id || undefined,
    regency_id: values.regency_id || undefined,
    rutin_join_date: values.rutin_join_date,
    sub_district_id: values.sub_district_id || undefined,
    type: typeof values.type === 'number' ? values.type : 0,
    village_id: values.village_id ?? undefined,
    id: String(values.id),
    program_ids: values.programs.map((x) => x.id),
    id_satu_sehat: String(values.id_satu_sehat ?? null),
    is_sentinel_lab: values.is_sentinel_lab ?? false,
    sentinel_lab_start_date: values.sentinel_lab_start_date
      ? values.sentinel_lab_start_date.slice(0, 10)
      : null,
    sentinel_lab_end_date: values.sentinel_lab_end_date
      ? values.sentinel_lab_end_date.slice(0, 10)
      : null,
    ...extractLocations(values.locations),
  }
}

export const getEntityTypeName = (id?: number) => {
  if (!id) return ''

  const type = entityTypeList.find((x) => x.value === id)

  return type?.label ?? ''
}

export const generateEntityAdditionalDetail = (
  t: TFunction<['common', 'entity']>,
  data?: TDetailEntity
) => [
  {
    label: t('entity:detail.additional.vendor'),
    value: data?.is_vendor ? t('common:yes') : t('common:no'),
  },
  {
    label: t('entity:detail.additional.is_primary_health_care'),
    value: data?.is_puskesmas ? t('common:yes') : t('common:no'),
  },
  {
    label: t('entity:detail.additional.asik'),
    value: data?.is_ayosehat ? t('common:yes') : t('common:no'),
  },
]

export const generateEntityDetail = (
  t: TFunction<['common', 'entity']>,
  data?: TDetailEntity,
  isGlobal?: boolean,
  location?: string
) => {
  if (!data) return []
  const setValueDetail = (value?: string | number | null) => {
    if (value) return value

    return '-'
  }

  return [
    {
      label: t('entity:form.information.label.name'),
      value: setValueDetail(data?.name),
      id: `detail-information-entity-name`,
    },
    {
      label: t('entity:form.location.title'),
      value: setLocation({ locations: data?.locations, location, isGlobal }),
      id: `detail-information-entity-location`,
    },
    {
      label: 'Latitude',
      value: setValueDetail(data?.lat),
      id: `detail-information-entity-latitude`,
    },
    {
      label: 'Longitude',
      value: setValueDetail(data?.lng),
      id: `detail-information-entity-longitude`,
    },
    {
      label: t('entity:detail.information.entity_type'),
      value:
        typeof data?.type === 'number'
          ? (data?.entity_type?.[0]?.name ?? '-')
          : data?.type,
      id: `detail-information-entity-type`,
    },
    {
      label: t('entity:list.column.tag'),
      value: isGlobal ? data?.entity_tag?.title : data?.entity_tag_name,
      id: `detail-information-entity-tag`,
    },
    {
      label: t('entity:list.column.code'),
      value: setValueDetail(data?.code),
      id: `detail-information-entity-code`,
    },
    {
      label: t('entity:satu_sehat_code'),
      value: setValueDetail(data?.id_satu_sehat),
      id: `detail-information-satu-sehat-code`,
    },
    {
      label: t('entity:form.location.label.address'),
      value: setValueDetail(data?.address),
      id: `detail-information-entity-address`,
    },
    {
      label: t('entity:list.column.update'),
      value: parseDateTime(data?.updated_at ?? data?.last_update ?? ''),
      id: `detail-information-entity-update`,
    },
  ]
}

export const generateActivityImplementationTime = (
  t: TFunction<['common']>,
  data: ActivityData[]
) =>
  data?.map((activity) => ({
    label: activity?.name,
    // value: `${activity?.start_date} - ${activity?.end_date || t('common:empty')}`,
    value: '2021-01-01 - 2021-01-02',
  }))

type TSetLocation = {
  location?: string | null
  locations?: Array<{ id: number; name: string; level: number }>
  isGlobal?: boolean
}
export const setLocation = ({
  location,
  locations,
  isGlobal,
}: TSetLocation) => {
  let result: string[] = []

  if (isGlobal) {
    if (locations && locations?.length > 0) {
      result = locations
        .toSorted((a, b) => b.level - a.level)
        .map((x) => x.name)
    }
  } else {
    return location ?? '-'
  }

  return result.length > 0 ? result.join(', ') : '-'
}

export const dateRegex =
  /^(?:$|((19|20)\d{2}-(0[1-9]|\d[0-2])-(0[1-9]|[12]\d|3[01])))$/

export const combinedTextByDash = ({
  text1,
  text2,
}: {
  text1: string | null
  text2: string | null
}) => {
  if (!text1 && !text2) return null
  if (!text1) return text2
  if (!text2) return text1
  return `${text1} - ${text2}`
}

export const entityCustomerConsumptionType = (
  t: TFunction<['entity', 'common']>,
  isConsumption: IS_CONSUMPTION
) =>
  isConsumption === IS_CONSUMPTION.TRUE
    ? t('entity:detail.information.table_title.consumption_customer')
    : t('entity:detail.information.table_title.distribution_customer')
