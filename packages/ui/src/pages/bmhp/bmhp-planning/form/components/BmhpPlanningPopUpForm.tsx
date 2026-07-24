'use client'

import { useContext } from 'react'
import { yupResolver } from '@hookform/resolvers/yup'
import { useQuery } from '@tanstack/react-query'
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
import { toast } from '#components/toast'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'
import { Controller, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { generatedYearOptions } from '../../libs/bmhp-planning.common'
import { BmhpPlanningListContext } from '../../list/libs/bmhp-planning-list.context'
import {
  createBmhpPlanningYear,
  getExistingYears,
} from '../../services/bmhp-planning.services'
import { bmhpPlanningFormValidation } from '../libs/bmhp-planning-form.validation'

export default function BmhpPlanningPopUpForm() {
  const { t } = useTranslation(['common', 'bmhpPlanning'])

  const { openCreateModal, setOpenCreateModal, refreshData } = useContext(
    BmhpPlanningListContext
  )

  // Fetch existing years from API to disable them in dropdown
  const { data: existingYears = [] } = useQuery({
    queryKey: ['bmhp-planning-existing-years'],
    queryFn: () => getExistingYears(),
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    enabled: openCreateModal,
  })

  const methods = useForm({
    mode: 'onChange',
    defaultValues: {
      year: undefined,
    },
    resolver: yupResolver(bmhpPlanningFormValidation(t)),
  })

  const {
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    setError,
    reset,
  } = methods

  const handleClose = () => {
    reset()
    setOpenCreateModal?.(false)
  }

  const onSubmit = async (data: { year: OptionType | null }) => {
    if (!data.year?.value) {
      setError('year', { message: t('bmhpPlanning:validation.year_required') })
      return
    }

    try {
      await createBmhpPlanningYear({ year: Number(data.year.value) })
      toast.success({ title: t('bmhpPlanning:message.create_success') })
      reset()
      setOpenCreateModal?.(false)
      refreshData() // Refresh the list
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        t('bmhpPlanning:validation.year_duplicate')
      toast.danger({ title: errorMessage })
      setError('year', { message: errorMessage })
    }
  }

  useSetLoadingPopupStore(isSubmitting)

  return (
    <Dialog open={openCreateModal}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogCloseButton onClick={handleClose} />
        <DialogHeader className="ui-text-center ui-text-xl">
          {t('bmhpPlanning:add_year')}
        </DialogHeader>
        <DialogContent>
          <FormControl className="ui-w-full ui-mb-6">
            <FormLabel htmlFor="year" required={true}>
              {t('bmhpPlanning:year')}
            </FormLabel>
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
                  onChange={(option: OptionType) => {
                    field.onChange(option)
                  }}
                  placeholder={t('bmhpPlanning:placeholder.select_year')}
                  menuPosition="fixed"
                />
              )}
            />
            {errors?.year?.message && (
              <FormErrorMessage>{errors?.year?.message}</FormErrorMessage>
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
              disabled={!methods.formState.isValid || isSubmitting}
            >
              {isSubmitting
                ? t('common:notification.loading')
                : t('bmhpPlanning:confirm')}
            </Button>
          </div>
        </DialogFooter>
      </form>
    </Dialog>
  )
}
