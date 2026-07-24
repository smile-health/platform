'use client'

import Link from 'next/link'
import { ProgramEnum } from '#constants/program'
import { Button } from '#components/button'
import { Checkbox } from '#components/checkbox'
import {
  FormControl,
  FormErrorMessage,
  FormLabel,
} from '#components/form-control'
import { Input } from '#components/input'
import { Radio, RadioGroup } from '#components/radio'
import { ReactSelect } from '#components/react-select'
import useSmileRouter from '#hooks/useSmileRouter'
import { getProgramStorage } from '#utils/storage/program'
import { Controller } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { ActivityFormProps } from '../activity.type'
import { useActivityCreateEdit } from '../hooks/useActivityCreateEdit'

export default function ActivityForm({
  isEdit,
  defaultValues,
  pathBack,
}: Readonly<ActivityFormProps>) {
  const { t } = useTranslation(['common', 'activity'])
  const router = useSmileRouter()
  const { register, handleSubmit, errors, onValid, control, setValue, watch, environmentalCategoryOptions } =
    useActivityCreateEdit({
      isEdit,
      defaultValues,
      pathBack,
    })

  const program = getProgramStorage()
  const isKesling = program?.key === ProgramEnum.Kesling

  const selectedCategoryIds = watch('environmental_parameter_category_ids') ?? []

  const categoryOptions = environmentalCategoryOptions.map((c) => ({
    value: c.id,
    label: c.name,
  }))

  return (
    <form
      onSubmit={handleSubmit(onValid)}
      className="ui-mt-6 ui-space-y-6 ui-max-w-form ui-mx-auto"
    >
      <div className="ui-p-4 ui-pb-4 ui-mt-6 ui-border ui-border-gray-300 ui-rounded">
        <div className="ui-mb-5 ui-font-bold ui-text-primary ui-text-dark-blue">
          {t('activity:title.information')}
        </div>
        <div className="ui-flex ui-flex-col ui-space-y-5">
          <FormControl>
            <FormLabel htmlFor="name" required>
              {t('activity:form.name.label')}
            </FormLabel>
            <Input
              {...register('name')}
              id="input-activity-name"
              placeholder={t('activity:form.name.placeholder')}
              type="text"
              error={!!errors?.name?.message}
            />
            <FormErrorMessage>{errors?.name?.message}</FormErrorMessage>
          </FormControl>
          <FormControl>
            <FormLabel required>{t('activity:form.process.label')}</FormLabel>
            <div className="ui-flex ui-gap-4">
              <Checkbox {...register('is_ordered_sales')} label="Top Down" />
              <Checkbox {...register('is_ordered_purchase')} label="Bottom Up" />
            </div>
            <FormErrorMessage>
              {errors?.is_ordered_sales?.message ??
                errors?.is_ordered_sales?.message}
            </FormErrorMessage>
          </FormControl>
          {isKesling && (
            <FormControl>
              <FormLabel htmlFor="select-environmental-categories">
                {t('activity:form.environmental_parameter_categories.label')}
              </FormLabel>
              <ReactSelect
                id="select-environmental-categories"
                placeholder={t('activity:form.environmental_parameter_categories.placeholder')}
                isMulti
                options={categoryOptions}
                value={categoryOptions.filter((opt) =>
                  selectedCategoryIds.includes(opt.value)
                )}
                onChange={(selected) => {
                  const ids = (selected as { value: number; label: string }[]).map(
                    (opt) => opt.value
                  )
                  setValue('environmental_parameter_category_ids', ids)
                }}
              />
            </FormControl>
          )}
          {isKesling && (
            <Controller
              control={control}
              name="is_final_distribution"
              render={({ field: { value, onChange }, fieldState: { error } }) => (
                <FormControl>
                  <FormLabel htmlFor="is_final_distribution">
                    {t('activity:form.is_final_distribution.label')}
                  </FormLabel>
                  <RadioGroup>
                    <Radio
                      name="is_final_distribution"
                      label={t('common:yes')}
                      value="true"
                      checked={value === true}
                      onChange={() => onChange(true)}
                    />
                    <Radio
                      name="is_final_distribution"
                      label={t('common:no')}
                      value="false"
                      checked={value === false}
                      onChange={() => onChange(false)}
                    />
                  </RadioGroup>
                  {error?.message && (
                    <FormErrorMessage>{error.message}</FormErrorMessage>
                  )}
                </FormControl>
              )}
            />
          )}
        </div>
      </div>
      <div className="ui-flex ui-justify-end">
        <div className="ui-grid ui-grid-cols-2 ui-w-[300px] ui-gap-2">
          <Button asChild variant="outline">
            <Link href={pathBack ?? router.getAsLink('/v5/activity')}>
              {t('common:back')}
            </Link>
          </Button>
          <Button>{t('common:save')}</Button>
        </div>
      </div>
    </form>
  )
}
