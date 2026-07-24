import { FilterFormSchema, UseFilter } from '#components/filter'
import { ENTITY_TYPE } from '#constants/entity'
import { useProgram } from '#hooks/program/useProgram'
import { loadAssetModel } from '#services/asset-model'
import { loadAssetType } from '#services/asset-type'
import { loadCoreEntities, loadEntityTags } from '#services/entity'
import { loadProvinces, loadRegencies } from '#services/location'
import { loadManufacturers } from '#services/manufacturer'
import { loadStatusAsset } from '#services/status-asset'
import { RequestloginResponse } from '#types/auth'
import { getUserStorage } from '#utils/storage/user'
import { TFunction } from 'i18next'
import { useTranslation } from 'react-i18next'

import { anotherOption } from '../../../asset-managements/asset-managements.constants'
import { filterOfuser } from './asset-inventory-list.common'
import {
  ASSET_INVENTORY_STATUS,
  assetRelation,
} from './asset-inventory-list.constants'

type Params = {
  t: TFunction<['common', 'assetInventory']>
}

export const assetFilterSchema = ({ t }: Params): UseFilter => {
  const user = getUserStorage()
  const { defaultProvince, defaultRegency, defaultHealthCenter, isSuperAdmin } =
    filterOfuser(user as RequestloginResponse)
  const { t: tAssetManagements } = useTranslation('assetManagements')

  const { data } = useProgram({
    isCore: true,
    isIncludeWasteManagement: true,
  })

  return [
    {
      type: 'text',
      name: 'keyword',
      label: t('common:search_by'),
      placeholder: t('assetInventory:columns.serial_number'),
      maxLength: 255,
      id: 'input-activity-search',
      defaultValue: '',
    },
    {
      id: 'asset__list__type',
      type: 'select-async-paginate',
      name: 'asset_type_ids',
      isMulti: true,
      label: t('assetInventory:columns.asset_type.label'),
      placeholder: t('assetInventory:columns.asset_type.placeholder'),
      className: '',
      defaultValue: null,
      loadOptions: loadAssetType,
      additional: {
        page: 1,
        another_option: anotherOption(tAssetManagements),
      },
    },
    {
      id: 'asset__list__manufacture',
      type: 'select-async-paginate',
      name: 'manufacture_ids',
      isMulti: true,
      label: t('assetInventory:columns.manufacture.label'),
      placeholder: t('assetInventory:columns.manufacture.placeholder'),
      className: '',
      defaultValue: null,
      loadOptions: loadManufacturers,
      additional: { page: 1 },
    },
    {
      id: 'asset__list__relation',
      type: 'select',
      name: 'is_device_related',
      isMulti: false,
      label: t('assetInventory:columns.relation.label'),
      placeholder: t('assetInventory:columns.relation.placeholder'),
      options: assetRelation(t),
      className: '',
      defaultValue: null,
    },
    {
      id: 'asset__working__status',
      type: 'select-async-paginate',
      name: 'working_status_id',
      isMulti: false,
      label: t('assetInventory:columns.working_status.label'),
      placeholder: t('assetInventory:columns.working_status.placeholder'),
      className: '',
      defaultValue: null,
      loadOptions: loadStatusAsset,
      additional: { page: 1 },
    },
    {
      id: 'asset__list__province_id',
      type: 'select-async-paginate',
      name: 'province_id',
      isMulti: false,
      label: t('common:form.province.label'),
      placeholder: t('common:form.province.placeholder'),
      loadOptions: loadProvinces,
      clearOnChangeFields: ['regency_id', 'entity_id'],
      additional: { page: 1 },
      defaultValue: defaultProvince,
      disabled: !isSuperAdmin || defaultProvince,
    } as FilterFormSchema,
    {
      id: 'asset__list__city_id',
      type: 'select-async-paginate',
      name: 'regency_id',
      isMulti: false,
      label: t('common:form.city.label'),
      placeholder: t('common:form.city.placeholder'),
      loadOptions: loadRegencies,
      disabled: ({ getReactSelectValue }) => {
        const province = getReactSelectValue('province_id')

        if (isSuperAdmin) {
          return !province
        }

        return Boolean(defaultRegency?.value)
      },
      clearOnChangeFields: ['entity_id'],
      additional: ({ getReactSelectValue }: { getReactSelectValue: any }) => ({
        page: 1,
        ...(getReactSelectValue('province_id') && {
          parent_id: getReactSelectValue('province_id'),
        }),
      }),
      defaultValue: !isSuperAdmin ? defaultRegency : null,
    },
    {
      id: 'asset__list__health_center_id',
      type: 'select-async-paginate',
      name: 'health_center_id',
      isMulti: false,
      label: t('assetInventory:filter.primary_health_care.label'),
      placeholder: t('assetInventory:filter.primary_health_care.placeholder'),
      loadOptions: loadCoreEntities,
      additional: ({ getReactSelectValue }: { getReactSelectValue: any }) => ({
        page: 1,
        province_ids: getReactSelectValue('province_id')?.toString() ?? null,
        regency_ids: getReactSelectValue('regency_id')?.toString() ?? null,
        type_ids: ENTITY_TYPE.FASKES.toString(),
      }),
      defaultValue: defaultHealthCenter,
      disabled: Boolean(defaultHealthCenter),
    },
    {
      id: 'asset__entity__tag',
      type: 'select-async-paginate',
      name: 'entity_tag_ids',
      isMulti: true,
      label: t('assetInventory:columns.entity_tag'),
      placeholder: t('assetInventory:columns.entity_tag'),
      className: '',
      defaultValue: null,
      loadOptions: loadEntityTags,
      additional: { page: 1, isGlobal: true },
    },
    {
      id: 'asset__inventory__status',
      type: 'select',
      name: 'status',
      isMulti: false,
      label: t('assetInventory:columns.status.label'),
      placeholder: t('assetInventory:columns.status.placeholder'),
      className: '',
      defaultValue: null,
      options: [
        {
          value: ASSET_INVENTORY_STATUS.INACTIVE,
          label: t('common:status.inactive'),
        },
        {
          value: ASSET_INVENTORY_STATUS.ACTIVE,
          label: t('common:status.active'),
        },
      ],
    },
    {
      id: 'asset__list__asset__model',
      type: 'select-async-paginate',
      name: 'asset_model_ids',
      isMulti: true,
      label: t('assetInventory:columns.asset_model'),
      placeholder: t('assetInventory:columns.asset_model'),
      className: '',
      defaultValue: null,
      loadOptions: loadAssetModel,
      additional: { page: 1, isGlobal: true },
    },
    {
      id: 'asset__list__programs',
      type: 'select',
      name: 'program_ids',
      isMulti: true,
      label: t('assetInventory:columns.related_program.label'),
      placeholder: t('assetInventory:columns.related_program.placeholder'),
      className: '',
      defaultValue: null,
      options: data?.map((item) => ({
        value: item.id,
        label: item.name,
      })),
    },
  ]
}

export default {}
