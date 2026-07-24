import { UseFilter } from '#components/filter'
import { OptionType } from '#components/react-select'
import { USER_ROLE } from '#constants/roles'
import { loadCoreEntities, loadEntityTags } from '#services/entity'
import { loadProvinces, loadRegencies } from '#services/location'
import { loadNotificationTypes } from '#services/notification'
import { listPrograms } from '#services/program'
import { getUserStorage } from '#utils/storage/user'
import { parseDate } from '@internationalized/date'
import dayjs from 'dayjs'
import { TFunction } from 'i18next'

export default function notificationFilterFormSchema(
  t: TFunction<['common', 'notification']>
) {
  const paramsFilter = { page: 1, paginate: 50 }
  const userData = getUserStorage()

  const isSuperAdmin = [USER_ROLE.SUPERADMIN, USER_ROLE.ADMIN].includes(
    userData?.role as USER_ROLE
  )

  const userProvince =
    isSuperAdmin && Boolean(userData?.entity?.province?.name)
      ? null
      : ({
          label: userData?.entity?.province?.name,
          value: userData?.entity?.province?.id,
        } as OptionType)
  const userRegency =
    isSuperAdmin && Boolean(userData?.entity?.regency?.name)
      ? null
      : ({
          label: userData?.entity?.regency?.name,
          value: userData?.entity?.regency?.id,
        } as OptionType)

  return [
    {
      id: 'notification_type',
      type: 'select-async-paginate',
      name: 'notification_type',
      isMulti: false,
      label: t('notification:filter.notification_type.label'),
      placeholder: t('notification:filter.notification_type.placeholder'),
      loadOptions: loadNotificationTypes,
      additional: { page: 1 },
      defaultValue:null,
    },
    {
      id: 'program_ids',
      type: 'select',
      name: 'program_ids',
      isMulti: true,
      label: t('notification:filter.program.label'),
      placeholder: t('notification:filter.program.placeholder'),
      loadOptions: async () => {
        const result = await listPrograms({ ...paramsFilter, is_user_program: 1})
        const reformatResult =
          result?.data?.map((x) => ({ value: x.id, label: x.name })) || []
        return reformatResult
      },
      defaultValue:null,
    },
    {
      id: 'receive_date',
      type: 'date-picker',
      name: 'receive_date',
      label: t('notification:filter.receive_date.label'),
      className: '',
      maxValue: parseDate(
              dayjs(new Date()).add(1, 'day').format('YYYY-MM-DD')
            ).toString(),
      defaultValue: dayjs().toISOString(),
    },
    {
      id: 'province_id',
      type: 'select-async-paginate',
      name: 'province_id',
      isMulti: false,
      label: t('common:form.province.label'),
      placeholder: t('common:form.province.placeholder'),
      loadOptions: loadProvinces,
      additional: { page: 1 },
      defaultValue: userProvince?.label ? userProvince : null,
      disabled: !isSuperAdmin || !userProvince,
    },
    {
      id: 'city_district',
      type: 'select-async-paginate',
      name: 'regency_id',
      isMulti: false,
      label: t('common:form.city.label'),
      placeholder: t('common:form.city.placeholder'),
      loadOptions: loadRegencies,
      defaultValue: userRegency?.label ? userRegency : null,
      disabled: ({ getReactSelectValue }) => {
        const province = getReactSelectValue('province_id')
        return isSuperAdmin ? !province : userRegency?.value ? true : false
      },
      additional: ({ getReactSelectValue }: { getReactSelectValue: any }) => ({
        page: 1,
        ...(getReactSelectValue('province_id') && {
          parent_id: getReactSelectValue('province_id'),
        }),
      }),
    },
    {
      id: 'health_center',
      type: 'select-async-paginate',
      name: 'health_center_id',
      isMulti: false,
      label: t('notification:filter.health_center.label'),
      placeholder: t('notification:filter.health_center.placeholder'),
      className: '',
      defaultValue: null,
      loadOptions: loadCoreEntities,
      additional: ({ getReactSelectValue }: { getReactSelectValue: any }) => ({
        page: 1,
        isGlobal: true,
        ...(getReactSelectValue('province_id') && {
          province_ids: getReactSelectValue('province_id'),
        }),
        ...(getReactSelectValue('regency_id') && {
          regency_ids: getReactSelectValue('regency_id'),
        }),
        ...(getReactSelectValue('regency_id') && {
          entity_tag_ids: getReactSelectValue('entity_tag_id'),
        }),
      }),
    },
    {
      id: 'entity_tag',
      type: 'select-async-paginate',
      name: 'entity_tag_ids',
      isMulti: true,
      label: t('notification:filter.entity_tag.label'),
      placeholder: t('notification:filter.entity_tag.placeholder'),
      className: '',
      defaultValue: null,
      loadOptions: loadEntityTags,
      additional: { page: 1, isGlobal: true },
    },
  ] satisfies UseFilter
}
