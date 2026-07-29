import { OptionType } from '#components/react-select'
import { userRoleList } from '#constants/roles'
import { UserChangeHistoryType } from '#services/user'
import { TUserDetail } from '#types/user'
import { parseDateTime } from '#utils/date'
import { removeEmptyObject } from '#utils/object'
import { getReactSelectValue } from '#utils/react-select'
import { capitalize } from '#utils/strings'
import { getDeviceLogin, getEntityType } from '#utils/user'
import dayjs from 'dayjs'
import { TFunction } from 'i18next'
import { Values } from 'nuqs'

import { USER_GENDER } from './user.constants'

export function determineEntityValue(
  primary_vendor_id: string,
  primary_health_care_id: string
) {
  if (primary_vendor_id) {
    return primary_vendor_id
  }
  return primary_health_care_id
}

export function handleFilterParams(values: Values<Record<string, any>>) {
  const entity_id = determineEntityValue(
    values?.primary_vendor?.value,
    values?.primary_health_care?.value
  )

  const newData = {
    page: values?.page,
    paginate: values?.paginate,
    keyword: values?.keyword,
    role: values?.role?.value,
    status: values?.status,
    entity_id,
    province_id: getReactSelectValue(values?.province),
    regency_id: getReactSelectValue(values?.regency),
    beneficiaries_ids: getReactSelectValue(values?.beneficiaries_ids),
    program_ids: getReactSelectValue(values?.program_ids),
    ...(values?.date_range?.start && {
      start_date: `${values?.date_range?.start} 00:00:00`,
    }),
    ...(values?.date_range?.end && {
      end_date: `${values?.date_range?.end} 23:59:59`,
    }),
  }

  return removeEmptyObject(newData)
}

export function getUserPrograms(data?: TUserDetail) {
  const programs =
    data?.entity?.programs?.filter((program) => {
      return data?.program_ids?.indexOf(program?.id) >= 0
    }) || []

  return programs
}

export function getUserBeneficiaries(data?: TUserDetail) {
  const beneficiaries =
    data?.entity?.beneficiaries?.filter((beneficiary) => {
      return data?.beneficiaries_ids?.indexOf(beneficiary?.id) >= 0
    }) || []

  return beneficiaries
}

export function getGender(t: TFunction<['common', 'user']>, gender: number) {
  const genderMap = {
    [USER_GENDER.MALE]: t('user:form.gender.male'),
    [USER_GENDER.FEMALE]: t('user:form.gender.female'),
  }

  return genderMap?.[gender]
}

export function generateUserDetail(
  t: TFunction<['common', 'user']>,
  detail?: TUserDetail
) {
  const roleLabel = userRoleList.find(
    (role) => role?.value === detail?.role
  )?.label
  const entityAddress =
    !!detail?.entity?.address && detail?.entity?.address !== '-'
      ? detail?.entity?.address
      : detail?.entity?.location
  return {
    id: detail?.id,
    status: detail?.status,
    main: [
      {
        label: t('user:column.username'),
        value: detail?.username ?? '-',
      },
      {
        label: t('user:column.role'),
        value: detail?.role_label ?? roleLabel ?? '-',
      },
      {
        label: 'Email',
        value: detail?.email ?? '-',
      },
      {
        label: capitalize(t('user:form.email.daily_recap_email')),
        value:
          detail?.daily_recap_email === 0 ? t('common:no') : t('common:yes'),
      },
      {
        label: t('user:column.firstname'),
        value: detail?.firstname ?? '-',
      },
      {
        label: t('user:column.lastname'),
        value: detail?.lastname ?? '-',
      },
      {
        label: t('user:column.location'),
        value: detail?.address ?? '-',
      },
      {
        label: t('user:column.mobile_phone'),
        value: detail?.mobile_phone ?? '-',
      },
      {
        label: t('user:column.birthdate'),
        value: detail?.date_of_birth
          ? parseDateTime(detail?.date_of_birth, 'DD/MM/YYYY')
          : '-',
      },
      {
        label: t('user:column.gender'),
        value: getGender(t, Number(detail?.gender)) ?? '-',
      },
    ],
    log: [
      {
        label: t('user:column.last.login'),
        value: parseDateTime(detail?.last_login),
      },
      {
        label: t('user:column.last.device'),
        value: getDeviceLogin(detail?.last_device) ?? '-',
      },
    ],
    entity: [
      {
        label: t('user:column.entity.name'),
        value: detail?.entity?.name ?? '-',
      },
      {
        label: t('user:column.entity.address'),
        value: entityAddress ?? '-',
      },
      {
        label: t('type'),
        value: getEntityType(detail?.entity?.type),
      },
      {
        label: 'Tag',
        value: detail?.entity?.tag ?? '-',
      },
    ],
  }
}

export function handleDefaultValue(defaultValue?: TUserDetail) {
  const programs = defaultValue?.entity?.programs
  const beneficiaries = defaultValue?.entity?.beneficiaries
  const province = defaultValue?.location?.province
  const regency = defaultValue?.location?.regency
  const subdistrict = defaultValue?.location?.subdistrict
  const village = defaultValue?.location?.village
  const roleId = defaultValue?.external_properties?.role?.id || defaultValue?.role
  const roleLabel =
    defaultValue?.external_properties?.role?.name || defaultValue?.role_label
  return {
    username: defaultValue?.username ?? '',
    role: roleId && roleLabel ? { label: roleLabel, value: roleId } : null,
    firstname: defaultValue?.firstname ?? '',
    lastname: defaultValue?.lastname ?? '',
    email: defaultValue?.email ?? '',
    gender: defaultValue?.gender ? String(defaultValue?.gender) : undefined,
    view_only: Boolean(defaultValue?.view_only),
    province: province
      ? {
          value: province?.id,
          label: province?.name,
        }
      : null,
    regency: regency
      ? {
          value: regency?.id,
          label: regency?.name,
        }
      : null,
    sub_district: subdistrict
      ? {
          value: subdistrict?.id,
          label: subdistrict?.name,
        }
      : null,
    village: village
      ? {
          value: village?.id,
          label: village?.name,
        }
      : null,
    village_id: defaultValue?.village_id ?? '',
    address: defaultValue?.address ?? '',
    date_of_birth: defaultValue?.date_of_birth
      ? dayjs(defaultValue?.date_of_birth).format('YYYY-MM-DD')
      : '',
    mobile_phone: defaultValue?.mobile_phone ?? '',
    entity: defaultValue?.entity
      ? {
          label: defaultValue?.entity?.name || '',
          value: defaultValue?.entity?.id,
          programs,
          beneficiaries,
          integration_client_id: defaultValue?.entity?.integration_client_id,
        }
      : null,
    manufacturer: defaultValue?.manufacture
      ? {
          value: defaultValue?.manufacture?.id,
          label: defaultValue?.manufacture?.name,
        }
      : null,
    program_ids: defaultValue?.program_ids ?? [],
    beneficiaries_ids: defaultValue?.beneficiaries_ids ?? [],
    daily_recap_email: !!defaultValue?.daily_recap_email,
    integration_client_id: defaultValue?.integration_client_id ?? null,
  }
}

export function getUpdatedHistory(data: UserChangeHistoryType) {
  return `${parseDateTime(data?.updated_at, 'DD MMMM YYYY HH:mm')} ${data?.updated_by}`
}

export function getHistoryValue(
  t: TFunction<['common', 'user']>,
  oldValue: string | number,
  newValue: string | number,
  isPassword?: boolean
) {
  const isAdded = !oldValue && !!newValue
  const isChanged = !!oldValue && !!newValue
  const isRemoved = !!oldValue && !newValue

  if (isPassword) {
    return t('user:history.password', { date: newValue })
  }

  if (isAdded) {
    return `${t('user:history.add')} ${newValue}`
  }

  if (isChanged) {
    return `${t('user:history.changed')} ${newValue}`
  }

  if (isRemoved) {
    return `${t('user:history.removed')} ${oldValue}`
  }

  return null
}

export function handleHistoryValue(
  t: TFunction<['common', 'user']>,
  data: UserChangeHistoryType
) {
  const dataTitle: Record<string, string> = {
    firstname: t('user:column.firstname'),
    lastname: t('user:column.lastname'),
    gender: t('user:column.gender'),
    email: 'Email',
    mobile_phone: t('user:column.mobile_phone'),
    password: t('user:form.password.label'),
  }

  const list: OptionType[] = []
  const keys = Object.keys(data?.new_value) || []

  keys.forEach((key) => {
    const label = dataTitle[key]

    if (label) {
      const isGender = key === 'gender'
      const isPassword = key === 'password'
      const oldValues = isPassword ? '' : data?.old_value?.[key]
      const newValues = isPassword
        ? parseDateTime(data?.updated_at)
        : data?.new_value?.[key]

      list.push({
        label: dataTitle[key],
        value: getHistoryValue(
          t,
          isGender ? getGender(t, Number(oldValues)) : oldValues,
          isGender ? getGender(t, Number(newValues)) : newValues,
          isPassword
        ),
      })
    }
  })

  return {
    updated: getUpdatedHistory(data),
    list,
  }
}
