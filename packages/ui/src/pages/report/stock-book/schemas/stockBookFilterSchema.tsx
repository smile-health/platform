import { UseFilter } from '#components/filter'
import { loadActivityOptions } from '#services/activity'
import { loadEntities } from '#services/entity'
import { loadProvinces, loadRegencies } from '#services/location'
import { hasPermission } from '#shared/permission/index'
import { getUserStorage } from '#utils/storage/user'
import dayjs from 'dayjs'
import { TFunction } from 'i18next'

export default function stockBookFilterSchema(t: TFunction<'stockBook'>) {
  const isManager = hasPermission('report-manager-location-filter')
  const user = getUserStorage()

  const useInitialProvince = Boolean(user?.entity?.province)
  const useInitialRegency = Boolean(user?.entity?.regency)
  const isDisableProvince = isManager && useInitialProvince
  const isDisableRegency = isManager && useInitialRegency
  const provinceInitialOption = {
    label: user?.entity?.province?.name ?? '',
    value: user?.entity?.province?.id,
  }
  const regencyInitialOption = {
    label: user?.entity?.regency?.name ?? '',
    value: user?.entity?.regency?.id,
  }
  return [
    {
      id: 'select-activity',
      type: 'select-async-paginate',
      name: 'activity',
      label: t('form.activity.label'),
      placeholder: t('form.activity.placeholder'),
      loadOptions: loadActivityOptions,
      additional: { page: 1 },
      required: t('form.activity.required'),
      defaultValue: null,
    },
    {
      id: 'select-province',
      type: 'select-async-paginate',
      name: 'province',
      label: t('form.province.label'),
      placeholder: t('form.province.placeholder'),
      loadOptions: loadProvinces,
      disabled: isDisableProvince,
      clearOnChangeFields: ['regency', 'entity'],
      additional: { page: 1 },
      required: t('form.province.required'),
      defaultValue: useInitialProvince ? provinceInitialOption : null,
    },
    {
      id: 'select-regency',
      type: 'select-async-paginate',
      name: 'regency',
      label: t('form.regency.label'),
      placeholder: t('form.regency.placeholder'),
      disabled: ({ getValue }) => !getValue('province') || isDisableRegency,
      loadOptions: loadRegencies,
      clearOnChangeFields: ['entity'],
      additional: ({ getReactSelectValue }) => ({
        parent_id: getReactSelectValue('province'),
        page: 1,
      }),
      defaultValue: useInitialRegency ? regencyInitialOption : null,
    },
    {
      id: 'select-primary-health-care',
      type: 'select-async-paginate',
      name: 'entity',
      label: t('form.health_facilities.label'),
      placeholder: t('form.health_facilities.placeholder'),
      loadOptions: loadEntities,
      disabled: ({ getValue }) => !getValue('province') || !getValue('regency'),
      additional: ({ getReactSelectValue }) => ({
        page: 1,
        is_vendor: 1,
        type_ids: 3,
        province_ids: getReactSelectValue('province'),
        regency_ids: getReactSelectValue('regency'),
      }),
      defaultValue: null,
    },
    {
      id: 'periode-date',
      type: 'month-year-picker',
      name: 'periode',
      label: t('form.period.label'),
      placeholder: t('form.period.placeholder'),
      defaultValue: {
        start: dayjs().startOf('month').format('YYYY-MM-DD'),
        end: dayjs().endOf('month').format('YYYY-MM-DD'),
      },
    },
  ] satisfies UseFilter
}
