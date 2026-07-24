import { usePathname } from 'next/navigation'
import { UseFilter } from '#components/filter'
import { USER_ROLE } from '#constants/roles'
import { loadAssetModelWithData } from '#services/asset-model'
import { loadAssetType } from '#services/asset-type'
import { loadCoreEntities, loadEntityTags } from '#services/entity'
import { loadProvinces, loadRegencies } from '#services/location'
import { loadManufacturers } from '#services/manufacturer'
import { loadStatusAsset } from '#services/status-asset'
import { getUserStorage } from '#utils/storage/user'
import { useTranslation } from 'react-i18next'

import { assetRelation } from '../../../../../asset/list/libs/asset-list.constants'

const useListFilterSchema = (): UseFilter => {
  const user = getUserStorage()
  const pathname = usePathname()
  const isWarehouse = pathname?.split('/').includes('warehouse')

  const { t } = useTranslation(['common', 'storageTemperatureMonitoringList'])

  const isManager = user?.role === USER_ROLE.MANAGER

  const temperatureStatusOptions = [
    {
      label: t('storageTemperatureMonitoringList:temperature_status.normal'),
      value: 'normal',
    },
    {
      label: t(
        'storageTemperatureMonitoringList:temperature_status.above_threshold'
      ),
      value: 'above',
    },
    {
      label: t(
        'storageTemperatureMonitoringList:temperature_status.below_threshold'
      ),
      value: 'below',
    },
  ]

  const enableProvincePreselection =
    isManager && Boolean(user?.entity?.province)
  const enableRegencyPreselection = isManager && Boolean(user?.entity?.regency)
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
      type: 'text',
      name: 'keyword',
      label: t('storageTemperatureMonitoringList:filter.search.label'),
      placeholder: t(
        'storageTemperatureMonitoringList:filter.search.placeholder'
      ),
      maxLength: 255,
      id: 'input-search-storage-temperature-monitoring',
      defaultValue: '',
    },
    {
      id: 'select-asset-type',
      type: 'select-async-paginate',
      name: 'asset_types',
      isMulti: true,
      label: t('storageTemperatureMonitoringList:filter.asset_type.label'),
      placeholder: t(
        'storageTemperatureMonitoringList:filter.asset_type.placeholder'
      ),
      defaultValue: null,
      loadOptions: loadAssetType,
      additional: {
        page: 1,
        is_warehouse: isWarehouse ? 1 : 0,
        is_cce: isWarehouse ? 0 : 1,
      },
    },
    {
      id: 'select-manufacturer',
      type: 'select-async-paginate',
      name: 'manufactures',
      isMulti: true,
      label: t('storageTemperatureMonitoringList:filter.manufacturer.label'),
      placeholder: t(
        'storageTemperatureMonitoringList:filter.manufacturer.placeholder'
      ),
      defaultValue: null,
      loadOptions: loadManufacturers,
      additional: { page: 1 },
    },
    {
      id: 'select-asset-relation',
      type: 'select',
      name: 'is_device_related',
      isMulti: false,
      label: t('storageTemperatureMonitoringList:filter.asset_relation.label'),
      placeholder: t(
        'storageTemperatureMonitoringList:filter.asset_relation.placeholder'
      ),
      options: assetRelation(t),
      className: '',
      defaultValue: null,
    },
    {
      id: 'select-operational-status',
      type: 'select-async-paginate',
      name: 'rtmd_status',
      isMulti: false,
      label: t(
        'storageTemperatureMonitoringList:filter.operational_status.label'
      ),
      placeholder: t(
        'storageTemperatureMonitoringList:filter.operational_status.placeholder'
      ),
      className: '',
      defaultValue: null,
      loadOptions: loadStatusAsset,
      additional: { page: 1 },
    },
    {
      id: 'select-province',
      type: 'select-async-paginate',
      name: 'province',
      label: t('form.province.label'),
      placeholder: t('form.province.placeholder'),
      loadOptions: loadProvinces,
      disabled: enableProvincePreselection,
      clearOnChangeFields: ['regency', 'entity'],
      additional: { page: 1 },
      defaultValue: enableProvincePreselection ? provinceInitialOption : null,
    },
    {
      id: 'select-regency',
      type: 'select-async-paginate',
      name: 'regency',
      label: t('common:form.city.label'),
      placeholder: t('common:form.city.placeholder'),
      disabled: ({ getValue }) =>
        !getValue('province') || enableRegencyPreselection,
      loadOptions: loadRegencies,
      clearOnChangeFields: ['entity'],
      additional: ({ getReactSelectValue }) => ({
        parent_id: getReactSelectValue('province'),
        page: 1,
      }),
      defaultValue: enableRegencyPreselection ? regencyInitialOption : null,
    },
    {
      id: 'select-primary-health-care',
      type: 'select-async-paginate',
      name: 'health_center',
      label: t('common:form.primary_health_care.label'),
      placeholder: t('common:form.primary_health_care.placeholder'),
      loadOptions: loadCoreEntities,
      additional: ({ getReactSelectValue }) => ({
        page: 1,
        type_ids: 3,
        province_ids: getReactSelectValue('province'),
        regency_ids: getReactSelectValue('regency'),
      }),
      defaultValue: null,
    },
    {
      id: 'select-entity-tag',
      type: 'select-async-paginate',
      name: 'entity_tag',
      isMulti: true,
      label: t('storageTemperatureMonitoringList:filter.entity_tag.label'),
      placeholder: t(
        'storageTemperatureMonitoringList:filter.entity_tag.placeholder'
      ),
      className: '',
      defaultValue: null,
      loadOptions: loadEntityTags,
      additional: { page: 1, isGlobal: true },
    },
    {
      id: 'select-temperature-filter',
      type: 'select',
      name: 'temperature_filter',
      isMulti: false,
      label: t(
        'storageTemperatureMonitoringList:filter.temperature_filter.label'
      ),
      placeholder: t(
        'storageTemperatureMonitoringList:filter.temperature_filter.placeholder'
      ),
      defaultValue: null,
      options: temperatureStatusOptions,
    },
    {
      id: 'select-asset-model',
      type: 'select-async-paginate',
      name: 'asset_model',
      isMulti: true,
      label: t('storageTemperatureMonitoringList:filter.asset_model.label'),
      placeholder: t(
        'storageTemperatureMonitoringList:filter.asset_model.placeholder'
      ),
      className: '',
      defaultValue: null,
      loadOptions: loadAssetModelWithData,
      additional: { page: 1, is_cce: isWarehouse ? 0 : 1 },
    },
  ]
}

export default useListFilterSchema
