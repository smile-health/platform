import { OptionType } from '#components/react-select'
import { TFunction } from 'i18next'

import { PROGRAM_PLAN_APPROACH } from './program-plan-form.constant'
import { CopyItem, ProgramPlanSubmitForm } from './program-plan-form.type'

const LIMIT_YEAR = 100

export const generatedYearOptions = (
  yearsDisabled: number[] = [],
  t?: TFunction
): Array<OptionType> => {
  const nextYear = new Date().getFullYear() + LIMIT_YEAR
  const startYear = new Date().getFullYear()
  const options = []

  for (let i = startYear; i <= nextYear; i++) {
    const year = t ? `${i.toString()} (${t('status.active')})` : i.toString()
    options.push({
      value: i,
      label: yearsDisabled.includes(i) ? year : i.toString(),
      isDisabled: yearsDisabled.includes(i),
    })
  }

  return options
}

export const processPayload = (data: ProgramPlanSubmitForm) => {
  if (data.use_data_from_prev_year)
    return {
      target_year:
        data.target_year?.value ? Number(data.target_year.value) : null,
      source_id: data.source_id?.value ? Number(data.source_id.value) : null,
      copy_items:
        data.copy_items.length > 0
          ? [...data.copy_items, 'program_plan']
          : null,
      approach_id: PROGRAM_PLAN_APPROACH.VACCINATION,
    }
  return {
    year: data.target_year?.value ? String(data.target_year.value) : null,
    approach_id: PROGRAM_PLAN_APPROACH.VACCINATION,
  }
}

export const toggleCopyItem = ({
  key,
  removes,
  methods,
}: {
  key: CopyItem
  removes?: CopyItem[]
  methods: {
    watch: (field: string) => unknown
    setValue: (field: string, value: unknown) => void
    trigger: (field: string) => Promise<boolean>
  }
}) => {
  const { watch, setValue, trigger } = methods
  const current = watch('copy_items') as CopyItem[]
  if (current.includes(key)) {
    if (removes?.length) {
      const removeSet = new Set([key, ...removes])
      setValue(
        'copy_items',
        current.filter((item) => !removeSet.has(item))
      )
    } else {
      setValue(
        'copy_items',
        current.filter((item) => item !== key)
      )
    }
  } else {
    setValue('copy_items', [...current, key])
  }

  trigger('copy_items')
}
