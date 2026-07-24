import { UseFilter } from '#components/filter'
import { USER_ROLE } from '#constants/roles'
import { loadAssetModelWithData } from '#services/asset-model'
import { loadCoreEntities, loadEntityTags } from '#services/entity'
import { loadProvinces, loadRegencies } from '#services/location'
import { loadManufacturers } from '#services/manufacturer'
import { getUserStorage } from '#utils/storage/user'
import { useTranslation } from 'react-i18next'

import { assetRelation } from '../../../../../asset/list/libs/asset-list.constants'
import { monitoringDeviceInventoryStatus } from '../../../monitoring-device-inventory.constants'
import { loadOperationalStatus } from '../../monitoring-device-inventory-list.service'

const useListFilterSchema = (assetTypeIds: string): UseFilter => {
  const { t } = useTranslation(['common', 'monitoringDeviceInventoryList'])

  const user = getUserStorage()

  const isManager = user?.role === USER_ROLE.MANAGER
  const isVendor = user?.role === USER_ROLE.VENDOR_IOT

  const enableProvincePreselection =
    isManager && Boolean(user?.entity?.province)
  const enableRegencyPreselection = isManager && Boolean(user?.entity?.regency)
  const enableManufacturePreselection = isVendor && Boolean(user?.manufacture)
  const provinceInitialOption = {
    label: user?.entity?.province?.name ?? '',
    value: user?.entity?.province?.id,
  }
  const regencyInitialOption = {
    label: user?.entity?.regency?.name ?? '',
    value: user?.entity?.regency?.id,
  }
  const manufactureInitialOption = [
    {
      label: user?.manufacture?.name ?? '',
      value: user?.manufacture?.id,
    },
  ]

  return [
    {
      type: 'text',
      name: 'keyword',
      label: t('monitoringDeviceInventoryList:filter.serial_number.label'),
      placeholder: t(
        'monitoringDeviceInventoryList:filter.serial_number.placeholder'
      ),
      maxLength: 255,
      id: 'input-search-by-serial-number',
      defaultValue: '',
    },
    {
      id: 'select-manufacture',
      type: 'select-async-paginate',
      name: 'manufactures',
      isMulti: true,
      label: t('monitoringDeviceInventoryList:filter.manufacturer.label'),
      placeholder: t(
        'monitoringDeviceInventoryList:filter.manufacturer.placeholder'
      ),
      className: '',
      defaultValue: enableManufacturePreselection
        ? manufactureInitialOption
        : null,
      loadOptions: loadManufacturers,
      additional: { page: 1 },
      multiSelectCounterStyle: enableManufacturePreselection
        ? 'normal'
        : 'counter',
      disabled: enableManufacturePreselection,
    },
    {
      id: 'select-operational-status',
      type: 'select-async-paginate',
      name: 'rtmd_status',
      isMulti: false,
      label: t('monitoringDeviceInventoryList:filter.operational_status.label'),
      placeholder: t(
        'monitoringDeviceInventoryList:filter.operational_status.placeholder'
      ),
      className: '',
      defaultValue: null,
      loadOptions: loadOperationalStatus,
      additional: { page: 1, isGlobal: true },
    },
    {
      id: 'select-asset-relation',
      type: 'select',
      name: 'is_device_related',
      isMulti: false,
      label: t('monitoringDeviceInventoryList:filter.asset_relation.label'),
      placeholder: t(
        'monitoringDeviceInventoryList:filter.asset_relation.placeholder'
      ),
      options: assetRelation(t),
      className: '',
      defaultValue: null,
    },
    {
      id: 'select-device-status',
      type: 'select',
      name: 'device_status_id',
      isMulti: false,
      label: t('monitoringDeviceInventoryList:filter.device_status.label'),
      placeholder: t(
        'monitoringDeviceInventoryList:filter.device_status.placeholder'
      ),
      className: '',
      defaultValue: null,
      options: monitoringDeviceInventoryStatus(t),
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
      name: 'city',
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
        regency_ids: getReactSelectValue('city'),
      }),
      defaultValue: null,
    },
    {
      id: 'select-entity-tag',
      type: 'select-async-paginate',
      name: 'entity_tag',
      isMulti: true,
      label: t('monitoringDeviceInventoryList:filter.entity_tag.label'),
      placeholder: t(
        'monitoringDeviceInventoryList:filter.entity_tag.placeholder'
      ),
      className: '',
      defaultValue: null,
      loadOptions: loadEntityTags,
      additional: { page: 1, isGlobal: true },
    },
    {
      id: 'select-asset-model',
      type: 'select-async-paginate',
      name: 'asset_model',
      isMulti: true,
      label: t('monitoringDeviceInventoryList:filter.asset_model.label'),
      placeholder: t(
        'monitoringDeviceInventoryList:filter.asset_model.placeholder'
      ),
      className: '',
      defaultValue: null,
      loadOptions: loadAssetModelWithData,
      additional: { page: 1, asset_type_ids: assetTypeIds },
    },
  ]
}

export default useListFilterSchema
