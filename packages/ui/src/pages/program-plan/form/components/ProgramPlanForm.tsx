'use client'

import { useEffect } from 'react'
import { yupResolver } from '@hookform/resolvers/yup'
import { Button } from '#components/button'
import { Checkbox } from '#components/checkbox'
import {
  FormControl,
  FormErrorMessage,
  FormLabel,
} from '#components/form-control'
import {
  OptionType,
  ReactSelect,
  ReactSelectAsync,
} from '#components/react-select'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'
import useSmileRouter from '#hooks/useSmileRouter'
import cx from '#lib/cx'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { useProgramPlanListData } from '../../list/hooks/useProgramPlanListData'
import { loadProgramPlan } from '../../services/program-plan.services'
import { useSubmitProgramPlan } from '../hooks/useSubmitProgramPlan'
import {
  generatedYearOptions,
  toggleCopyItem,
} from '../libs/program-plan-form.common'
import { COPY_ITEMS } from '../libs/program-plan-form.constant'
import { CopyItem } from '../libs/program-plan-form.type'
import { programPlanFormValidation } from '../libs/program-plan-form.validation-schema'

export default function ProgramPlanForm() {
  const { t } = useTranslation(['common', 'programPlan'])
  const router = useSmileRouter()
  const methods = useForm({
    mode: 'onChange',
    defaultValues: {
      target_year: null,
      use_data_from_prev_year: false,
      source_id: null,
      copy_items: [],
    },
    resolver: yupResolver(programPlanFormValidation(t)),
  })
  const {
    handleSubmit,
    control,
    watch,
    register,
    trigger,
    setValue,
    formState: { errors },
    setError,
  } = methods

  const takeFromPrevYear = watch('use_data_from_prev_year')

  const {
    listProgramPlanData,
    isLoadingListProgramPlan,
    isFetchingListProgramPlan,
  } = useProgramPlanListData({
    pagination: { page: 1, paginate: 50 },
    querySorting: {
      sort_by: 'year',
      sort_type: 'desc',
    },
  })

  useEffect(() => {
    if (!takeFromPrevYear) {
      setValue('source_id', null)
      setValue('copy_items', [])
      trigger(['source_id', 'copy_items'])
    }
  }, [takeFromPrevYear, setValue, trigger])

  const handleClose = () => {
    methods.reset()
    router.push('/v5/program-plan')
  }

  const { submitProgramPlan, pendingProgramPlan } = useSubmitProgramPlan({
    setError,
  })

  useSetLoadingPopupStore(pendingProgramPlan)

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(submitProgramPlan)}>
        <div className="ui-w-full ui-max-w-form ui-mx-auto ui-border ui-border-neutral-300 ui-rounded-md ui-p-6">
          <FormControl className="ui-w-full ui-mb-6">
            <FormLabel htmlFor="target_year" required={true}>
              {t('programPlan:table.year_plan')}
            </FormLabel>
            <Controller
              name="target_year"
              control={control}
              render={({ field }) => (
                <ReactSelect
                  {...field}
                  id="target_year"
                  isClearable
                  isSearchable
                  isLoading={
                    isFetchingListProgramPlan || isLoadingListProgramPlan
                  }
                  options={generatedYearOptions(
                    listProgramPlanData?.data.map((item) => item.year) ?? []
                  )}
                  onChange={(option: OptionType) => {
                    field.onChange(option)
                  }}
                  placeholder={t('programPlan:placeholder.select_year')}
                  menuPosition="fixed"
                />
              )}
            />
            {errors?.target_year?.message && (
              <FormErrorMessage>
                {errors?.target_year?.message}
              </FormErrorMessage>
            )}
          </FormControl>
          <FormControl className="ui-w-full ui-mb-6">
            <Checkbox
              {...register('use_data_from_prev_year')}
              label={t('programPlan:use_data_from_prev_year')}
            />
          </FormControl>
          <div
            className={cx(
              'ui-overflow-hidden ui-transition-all ui-duration-300 ui-ease-in-out',
              {
                'ui-max-h-96 ui-pb-2': takeFromPrevYear,
                'ui-max-h-0 ui-pb-0': !takeFromPrevYear,
              }
            )}
          >
            <FormControl className="ui-w-full ui-mb-6">
              <FormLabel htmlFor="source_id">
                {t('programPlan:table.previous_year')}
              </FormLabel>
              <Controller
                name="source_id"
                control={control}
                render={({ field }) => (
                  <ReactSelectAsync
                    {...field}
                    id="source_id"
                    isClearable
                    isSearchable
                    loadOptions={loadProgramPlan}
                    isDisabled={!takeFromPrevYear}
                    onChange={(option: OptionType) => {
                      field.onChange(option)
                    }}
                    placeholder={t(
                      'programPlan:placeholder.select_previous_year'
                    )}
                    menuPosition="fixed"
                    additional={{ page: 1 }}
                  />
                )}
              />
              {errors?.source_id?.message && (
                <FormErrorMessage>
                  {errors?.source_id?.message}
                </FormErrorMessage>
              )}
            </FormControl>
            <FormControl className="ui-w-full">
              <FormLabel htmlFor="select_data_to_be_copied">
                {t('programPlan:table.select_data_to_be_copied')}
              </FormLabel>
              <div className="ui-flex ui-flex-col ui-gap-2 ui-px-2">
                {COPY_ITEMS({ t }).map((item) => {
                  const selected = watch('copy_items') as CopyItem[]
                  const disabled = item.dependsOn
                    ? !selected.includes(item.dependsOn)
                    : false
                  return (
                    <Checkbox
                      key={item.key}
                      {...register('copy_items')}
                      value={item.key}
                      label={item.label}
                      disabled={disabled}
                      onChange={() =>
                        toggleCopyItem({
                          key: item.key,
                          removes: item.removes,
                          methods,
                        })
                      }
                    />
                  )
                })}
              </div>
              {errors?.copy_items?.message && (
                <FormErrorMessage>
                  {errors?.copy_items?.message}
                </FormErrorMessage>
              )}
            </FormControl>
          </div>
        </div>

        <div className="ui-mt-2 ui-flex ui-justify-end ui-items-end ui-max-w-form ui-mx-auto ui-gap-4">
          <Button
            id="btn_close_pop_up_form"
            variant="default"
            type="button"
            onClick={handleClose}
          >
            {t('common:back')}
          </Button>
          <Button id="btn_submit_pop_up_form" type="submit">
            {t('common:save')}
          </Button>
        </div>
      </form>
    </FormProvider>
  )
}
