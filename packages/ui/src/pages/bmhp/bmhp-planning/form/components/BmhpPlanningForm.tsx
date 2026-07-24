import React from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  FormControl,
  FormErrorMessage,
  FormLabel,
} from '#components/form-control'
import { OptionType, ReactSelect } from '#components/react-select'
import { Control, Controller } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { generatedYearOptions } from '../../libs/bmhp-planning.common'
import { getExistingYears } from '../../services/bmhp-planning.services'

export interface BmhpPlanningFormProps {
  control: Control<any, any>
  errors: any
}

const BmhpPlanningForm: React.FC<BmhpPlanningFormProps> = ({
  control,
  errors,
}) => {
  const { t } = useTranslation(['common', 'bmhpPlanning'])

  const { data: existingYears = [] } = useQuery({
    queryKey: ['bmhp-planning-existing-years'],
    queryFn: () => getExistingYears(),
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    // enabled: openCreateModal,
  })
  return (
    <FormControl>
      <FormLabel required>{t('bmhpPlanning:form.year_label')}</FormLabel>
      <Controller
        name="year"
        control={control}
        render={({ field }) => (
          <ReactSelect
            {...field}
            id="year"
            isClearable
            isSearchable
            options={generatedYearOptions(existingYears, t)}
            // value={
            //   generatedYearOptions(existingYears, t).find(
            //     (opt) => opt.value === field.value
            //   ) || null
            // }
            // onChange={(option: OptionType | null) => {
            //   field.onChange(option ? option.value : '')
            // }}
            onChange={(option: OptionType) => {
              field.onChange(option)
            }}
            placeholder={t('bmhpPlanning:placeholder.select_year')}
            menuPosition="fixed"
          />
        )}
      />
      {errors.year && (
        <FormErrorMessage>{errors.year.value.message}</FormErrorMessage>
      )}
    </FormControl>
  )
}

export default BmhpPlanningForm
