import { UseFilter } from '#components/filter'
import { ENTITY_TYPE } from '#constants/entity'
import { loadEntityTags } from '#services/entity'
import { loadProvinces, loadRegencies } from '#services/location'
import { hasPermission } from '#shared/permission/index'
import { getUserStorage } from '#utils/storage/user'
import { TFunction } from 'i18next'

import { loadStatusOptions } from '../../../services/status.service'

export default function ticketingSystemFilterSchema(
  t: TFunction<['common', 'ticketingSystemList']>
) {
  const hasLocationFilter = hasPermission('ticketing-system-location-filter')
  const user = getUserStorage()
  const entityType = user?.entity?.type

  const isRegency = entityType === ENTITY_TYPE.KOTA
  const isProvince = isRegency || entityType === ENTITY_TYPE.PROVINSI

  const useInitialProvince = !hasLocationFilter && isProvince
  const useInitialRegency = !hasLocationFilter && isRegency

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
      id: 'input-order-number',
      type: 'number',
      name: 'order_id',
      label: t('ticketingSystemList:field.order_number.label'),
      placeholder: t('ticketingSystemList:field.order_number.placeholder'),
      defaultValue: '',
    },
    {
      id: 'input-parking-slip',
      type: 'text',
      name: 'do_number',
      label: t('ticketingSystemList:field.do_number.label'),
      placeholder: t('ticketingSystemList:field.do_number.placeholder'),
      defaultValue: '',
    },
    {
      id: 'select-status',
      type: 'select',
      name: 'status',
      label: t('ticketingSystemList:field.status.label'),
      placeholder: t('ticketingSystemList:field.status.placeholder'),
      loadOptions: loadStatusOptions,
      defaultValue: null,
    },
    {
      id: 'date-range-ticketing-system',
      type: 'date-range-picker',
      name: 'arrived_date',
      withPreset: true,
      multicalendar: true,
      label: t('ticketingSystemList:field.arrival_date.label'),
      className: '',
      defaultValue: null,
    },
    {
      id: 'select-province',
      type: 'select-async-paginate',
      name: 'province',
      label: t('common:form.province.label'),
      placeholder: t('common:form.province.placeholder'),
      loadOptions: loadProvinces,
      hidden: !hasLocationFilter && !isProvince,
      disabled: useInitialProvince,
      clearOnChangeFields: ['regency', 'phc'],
      additional: { page: 1 },
      options: useInitialProvince ? [provinceInitialOption] : undefined,
      defaultValue: useInitialProvince ? provinceInitialOption : null,
    },
    {
      id: 'select-regency',
      type: 'select-async-paginate',
      name: 'regency',
      label: t('common:form.city.label'),
      placeholder: t('common:form.city.placeholder'),
      disabled: ({ getValue }) => !getValue('province') || useInitialRegency,
      loadOptions: loadRegencies,
      hidden: !hasLocationFilter && !isProvince && !isRegency,
      clearOnChangeFields: ['phc'],
      additional: ({ getReactSelectValue }) => ({
        parent_id: getReactSelectValue('province'),
        page: 1,
      }),
      options: useInitialRegency ? [regencyInitialOption] : undefined,
      defaultValue: useInitialRegency ? regencyInitialOption : null,
    },
    {
      id: 'input-entity-tags',
      type: 'select-async-paginate',
      name: 'entity_tag',
      label: t('common:form.entity_tag.label'),
      placeholder: t('common:form.entity_tag.placeholder'),
      loadOptions: loadEntityTags,
      additional: { page: 1 },
      defaultValue: null,
    },
  ] satisfies UseFilter
}
