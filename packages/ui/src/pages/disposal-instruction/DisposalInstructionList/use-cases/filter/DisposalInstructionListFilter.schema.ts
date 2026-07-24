import { UseFilter } from '#components/filter'
import { loadActivityOptions } from '#services/activity'
import { TFunction } from 'i18next'

import { loadDisposalInstructionTypeOptions } from '../../disposal-instruction-list.service'

export default function disposalInstructionFilterSchema(
  t: TFunction<['common', 'disposalInstruction']>
) {
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
      defaultValue: null,
    },
  ] satisfies UseFilter
}
