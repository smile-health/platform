import { UseFilter } from '#components/filter'
import { ProgramEnum } from '#constants/program'
import { USER_ROLE } from '#constants/roles'
import { loadActivityOptions } from '#services/activity'
import { loadEntities, loadEntityTags } from '#services/entity'
import { loadProvinces, loadRegencies } from '#services/location'
import { getProgramStorage } from '#utils/storage/program'
import { getUserStorage } from '#utils/storage/user'
import { OptionType } from 'dayjs'
import { useTranslation } from 'react-i18next'

import { getDefaultImmunizationActivities } from '../../../../dashboard/dashboard.constant'
import { loadDisposalInstructionTypeOptions } from '../../disposal-instruction-list.service'

export default function useDisposalInstructionFilterSchema() {
  const { t } = useTranslation([
    'common',
    'disposalInstruction',
    'disposalInstructionList',
  ])

  const { t: tDashboard } = useTranslation('dashboard')

  const user = getUserStorage()
  const program = getProgramStorage()
  const defaultActivities =
    program?.key === ProgramEnum.Immunization
      ? getDefaultImmunizationActivities(tDashboard)[0]
      : null

  const isManager = user?.role === USER_ROLE.MANAGER

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
      id: 'bast_no',
      name: 'bast_no',
      type: 'text',
      label: t('disposalInstruction:field.disposal_report_number.label'),
      placeholder: t(
        'disposalInstruction:field.disposal_report_number.placeholder'
      ),
      className: '',
      defaultValue: '',
    },
    {
      id: 'instruction_type',
      name: 'instruction_type',
      type: 'select-async-paginate',
      label: t('disposalInstruction:field.disposal_instruction_type.label'),
      placeholder: t(
        'disposalInstruction:field.disposal_instruction_type.placeholder'
      ),
      loadOptions: loadDisposalInstructionTypeOptions,
      additional: { page: 1 },
      defaultValue: null,
    },
    {
      id: 'created_date',
      name: 'created_date',
      type: 'date-range-picker',
      withPreset: true,
      multicalendar: true,
      label: t('disposalInstruction:field.created_date.label'),
      className: '',
      defaultValue: null,
    },
    {
      id: 'activity',
      name: 'activity',
      type: 'select-async-paginate',
      label: t('disposalInstruction:field.activity.label'),
      placeholder: t('disposalInstruction:field.activity.placeholder'),
      loadOptions: loadActivityOptions,
      additional: { page: 1 },
      defaultValue: defaultActivities,
    },
    {
      id: 'select-entity-tag',
      type: 'select-async-paginate',
      name: 'entity_tag_id',
      label: t('common:form.entity_tag.label'),
      placeholder: t('common:form.entity_tag.placeholder'),
      className: '',
      defaultValue: null,
      loadOptions: loadEntityTags,
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
      name: 'entity',
      label: t('common:form.primary_health_care.label'),
      placeholder: t('common:form.primary_health_care.placeholder'),
      loadOptions: loadEntities,
      disabled: ({ getValue }) => {
        const entityTags = getValue('entity_tags') as OptionType[]
        return entityTags?.length > 0
      },
      additional: ({ getReactSelectValue }) => ({
        page: 1,
        is_vendor: 1,
        type_ids: 3,
        province_ids: getReactSelectValue('province'),
        regency_ids: getReactSelectValue('regency'),
      }),
      defaultValue: null,
    },
  ] satisfies UseFilter
}
