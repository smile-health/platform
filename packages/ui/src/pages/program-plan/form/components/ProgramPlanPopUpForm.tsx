'use client'

import { useContext } from 'react'
import { yupResolver } from '@hookform/resolvers/yup'
import { Button } from '#components/button'
import {
  Dialog,
  DialogCloseButton,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from '#components/dialog'
import {
  FormControl,
  FormErrorMessage,
  FormLabel,
} from '#components/form-control'
import { OptionType, ReactSelect } from '#components/react-select'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'
import { Controller, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import ProgramPlanListContext from '../../list/libs/program-plan-list.context'
import { useSubmitProgramPlan } from '../hooks/useSubmitProgramPlan'
import { generatedYearOptions } from '../libs/program-plan-form.common'
import { programPlanFormValidation } from '../libs/program-plan-form.validation-schema'

export default function ProgramPlanPopUpForm() {
  const { t } = useTranslation(['common', 'programPlan'])

  const { openCreateModal, setOpenCreateModal } = useContext(
    ProgramPlanListContext
  )

  const methods = useForm({
    mode: 'onChange',
    defaultValues: {
      year: null,
    },
    resolver: yupResolver(programPlanFormValidation(t)),
  })
  const {
    handleSubmit,
    control,
    formState: { errors },
    setError,
  } = methods

  const handleClose = () => {
    methods.reset()
    setOpenCreateModal?.(false)
  }

  const { submitProgramPlan, pendingProgramPlan } = useSubmitProgramPlan({
    setError,
  })

  useSetLoadingPopupStore(pendingProgramPlan)

  return (
    <Dialog open={openCreateModal}>
      <form onSubmit={handleSubmit(submitProgramPlan)}>
        <DialogCloseButton onClick={handleClose} />
        <DialogHeader className="ui-text-center ui-text-xl">
          {t('programPlan:add_program_plan')}
        </DialogHeader>
        <DialogContent>
          <FormControl className="ui-w-full ui-mb-6">
            <FormLabel htmlFor="target_year" required={true}>
              {t('programPlan:table.year')}
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
                  options={generatedYearOptions()}
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
        </DialogContent>
        <DialogFooter className="ui-justify-center">
          <div className="ui-grid ui-grid-cols-2 ui-gap-4 ui-w-full mx-auto">
            <Button
              id="btn_close_pop_up_form"
              variant="default"
              type="button"
              onClick={handleClose}
            >
              {t('common:cancel')}
            </Button>
            <Button
              id="btn_submit_pop_up_form"
              type="submit"
              disabled={!methods.formState.isValid}
            >
              {t('programPlan:confirm')}
            </Button>
          </div>
        </DialogFooter>
      </form>
    </Dialog>
  )
}
