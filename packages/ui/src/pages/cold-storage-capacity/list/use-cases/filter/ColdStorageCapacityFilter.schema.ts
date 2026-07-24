import { UseFilter } from '#components/filter'
import { loadActivityOptions } from '#services/activity'
import { loadEntities, loadEntityTags } from '#services/entity'
import { loadProvinces, loadRegencies } from '#services/location'
import { loadMaterial, loadMaterialType } from '#services/material'
import { hasPermission } from '#shared/permission/index'
import { getUserStorage } from '#utils/storage/user'
import dayjs from 'dayjs'
import { TFunction } from 'i18next'

const loadCapacityStatuses = async () => {
  return {
    options: [
      { label: 'Empty (0%)', value: 'empty' },
      { label: 'Low (< 20%)', value: 'low' },
      { label: 'Normal (20% - 80%)', value: 'normal' },
      { label: 'High (> 80%)', value: 'high' },
    ],
    hasMore: false,
  }
}

const createEmptyOptionsLoader = () => async () => ({
  options: [],
  hasMore: false,
})

const loadBatches = createEmptyOptionsLoader()
const loadExpiredDates = createEmptyOptionsLoader()

export default function coldStorageCapacityFilterSchema(
  t: TFunction<['common', 'coldStorageCapacity']>
) {
  const isManager = hasPermission('dashboard-manager-location-filter')
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

  const today = dayjs().format('YYYY-MM-DD')

  return [
    {
      id: 'select-capacity-status',
      type: 'select-async-paginate',
      name: 'capacity_status',
      label: t('coldStorageCapacity:field.capacityStatus.label'),
      placeholder: t('coldStorageCapacity:field.capacityStatus.placeholder'),
      loadOptions: loadCapacityStatuses,
      additional: { page: 1 },
      defaultValue: null,
    },
    {
      id: 'select-province',
      type: 'select-async-paginate',
      name: 'province',
      label: t('coldStorageCapacity:field.province.label'),
      placeholder: t('coldStorageCapacity:field.province.placeholder'),
      loadOptions: loadProvinces,
      clearOnChangeFields: ['city_district', 'health_facility'],
      additional: { page: 1 },
      disabled: isDisableProvince,
      defaultValue: useInitialProvince ? provinceInitialOption : null,
    },
    {
      id: 'select-city-district',
      type: 'select-async-paginate',
      name: 'city_district',
      label: t('coldStorageCapacity:field.cityDistrict.label'),
      placeholder: t('coldStorageCapacity:field.cityDistrict.placeholder'),
      loadOptions: loadRegencies,
      disabled: ({ getValue }) => !getValue('province') || isDisableRegency,
      clearOnChangeFields: ['health_facility'],
      additional: ({ getReactSelectValue }) => ({
        parent_id: getReactSelectValue('province'),
        page: 1,
      }),
      defaultValue: useInitialRegency ? regencyInitialOption : null,
    },
    {
      id: 'select-health-facility',
      type: 'select-async-paginate',
      name: 'health_facility',
      label: t('coldStorageCapacity:field.healthFacility.label'),
      placeholder: t('coldStorageCapacity:field.healthFacility.placeholder'),
      loadOptions: loadEntities,
      disabled: ({ getValue }) => !getValue('city_district'),
      additional: ({ getReactSelectValue }) => ({
        page: 1,
        province_ids: getReactSelectValue('province'),
        regency_ids: getReactSelectValue('city_district'),
        is_vendor: 1,
        isGlobal: true,
      }),
      defaultValue: null,
    },
    {
      id: 'select-entity-tag',
      type: 'select-async-paginate',
      name: 'entity_tag',
      label: t('coldStorageCapacity:field.entityTag.label'),
      placeholder: t('coldStorageCapacity:field.entityTag.placeholder'),
      loadOptions: loadEntityTags,
      additional: {
        page: 1,
        isGlobal: true,
      },
      defaultValue: null,
    },
    {
      id: 'date-period',
      type: 'date-range-picker',
      name: 'period',
      label: t('coldStorageCapacity:field.period.label'),
      withPreset: true,
      multicalendar: true,
      disabled: true,
      clearable: false,
      defaultValue: {
        start: today,
        end: today,
      },
    },
    {
      id: 'select-activity',
      type: 'select-async-paginate',
      name: 'activity',
      label: t('coldStorageCapacity:field.activity.label'),
      placeholder: t('coldStorageCapacity:field.activity.placeholder'),
      loadOptions: loadActivityOptions,
      additional: { page: 1 },
      defaultValue: null,
      disabled: true,
    },
    {
      id: 'select-material-type',
      type: 'select-async-paginate',
      name: 'material_type',
      label: t('coldStorageCapacity:field.materialType.label'),
      placeholder: t('coldStorageCapacity:field.materialType.placeholder'),
      loadOptions: loadMaterialType,
      additional: { page: 1 },
      defaultValue: null,
      disabled: true,
    },
    {
      id: 'select-material-name',
      type: 'select-async-paginate',
      name: 'material_name',
      label: t('coldStorageCapacity:field.materialName.label'),
      placeholder: t('coldStorageCapacity:field.materialName.placeholder'),
      loadOptions: loadMaterial,
      additional: { page: 1 },
      defaultValue: null,
      disabled: true,
    },
    {
      id: 'select-batch',
      type: 'select-async-paginate',
      name: 'batch',
      label: t('coldStorageCapacity:field.batch.label'),
      placeholder: t('coldStorageCapacity:field.batch.placeholder'),
      loadOptions: loadBatches,
      additional: { page: 1 },
      defaultValue: null,
      disabled: true,
    },
    {
      id: 'select-expired-date',
      type: 'select-async-paginate',
      name: 'expired_date',
      label: t('coldStorageCapacity:field.expiredDate.label'),
      placeholder: t('coldStorageCapacity:field.expiredDate.placeholder'),
      loadOptions: loadExpiredDates,
      additional: { page: 1 },
      defaultValue: null,
      disabled: true,
    },
  ] satisfies UseFilter
}
