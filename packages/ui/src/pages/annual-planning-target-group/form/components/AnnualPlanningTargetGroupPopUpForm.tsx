'use client'

import { useCallback, useContext, useEffect } from 'react'
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
import { Input } from '#components/input'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'
import { FormProvider, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

// import ProgramSelection from '#components/modules/ProgramSelection'

import AnnualPlanningTargetGroupListContext from '../../list/libs/annual-planning-target-group-list.context'
import { useSubmitAnnualPlanningTargetGroup } from '../hooks/useSubmitAnnualPlanningTargetGroup'
import { annualPlanningTargetGroupFormValidation } from '../libs/annual-planning-target-group-form.validation-schema'
import AnnualPlanningTargetGroupPopUpFormInputAge from './AnnualPlanningTargetGroupPopUpFormInputAge'

export default function AnnualPlanningTargetGroupPopUpForm() {
  const { t } = useTranslation(['common', 'annualPlanningTargetGroup'])
  const {
    setOpenCreateModal,
    openCreateModal,
    isGlobal,
    openedRow,
    setOpenedRow,
  } = useContext(AnnualPlanningTargetGroupListContext)

  const methods = useForm({
    mode: 'onChange',
    shouldUnregister: false,
    defaultValues: {
      title: null,
      from_age: {
        year: null,
        month: null,
        day: null,
      },
      to_age: {
        year: null,
        month: null,
        day: null,
      },
    },
    resolver: yupResolver(annualPlanningTargetGroupFormValidation(t)),
  })
  const {
    handleSubmit,
    register,
    formState: { errors },
    setError,
    reset,
    // watch,
    // setValue,
  } = methods

  // const { program_ids } = watch()

  const handleClose = useCallback(() => {
    setOpenCreateModal?.(false)
    setTimeout(() => {
      if (openedRow?.opened_for === 'edit') {
        setOpenedRow(null)
      }
    }, 300)
    reset({
      title: null,
      from_age: {
        year: null,
        month: null,
        day: null,
      },
      to_age: {
        year: null,
        month: null,
        day: null,
      },
    })
  }, [setOpenedRow, setOpenCreateModal, reset, openedRow])

  useEffect(() => {
    if (openedRow?.opened_for === 'edit') {
      reset({
        title: openedRow?.title ?? null,
        from_age: {
          year: openedRow?.from_age?.year ?? null,
          month: openedRow?.from_age?.month ?? null,
          day: openedRow?.from_age?.day ?? null,
        },
        to_age: {
          year: openedRow?.to_age?.year ?? null,
          month: openedRow?.to_age?.month ?? null,
          day: openedRow?.to_age?.day ?? null,
        },
      })
      setOpenCreateModal?.(true)
    }
  }, [openedRow, reset, setOpenCreateModal])

  const { mutate, isPending } = useSubmitAnnualPlanningTargetGroup({
    setError,
    isGlobal,
    handleClose,
  })

  useSetLoadingPopupStore(isPending)

  return (
    <Dialog
      open={openCreateModal}
      size="lg"
      scrollBehavior="outside"
      onOpenChange={(isOpened) => {
        if (!isOpened) handleClose()
      }}
    >
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit((data) => mutate(data))}>
          <DialogCloseButton onClick={handleClose} />
          <DialogHeader className="ui-text-center ui-text-xl">
            {openedRow?.opened_for === 'edit'
              ? t('annualPlanningTargetGroup:edit')
              : t('annualPlanningTargetGroup:add')}
          </DialogHeader>
          <DialogContent>
            <FormControl className="ui-w-full ui-mb-6">
              <FormLabel htmlFor="title" required={true}>
                {t('annualPlanningTargetGroup:table.target_group_name')}
              </FormLabel>
              <Input
                {...register('title')}
                id="input_title_target_group_global_id"
                type="text"
                placeholder={t(
                  'annualPlanningTargetGroup:table.target_group_name'
                )}
                error={!!errors?.title}
              />
              {errors?.title?.message && (
                <FormErrorMessage>{errors?.title?.message}</FormErrorMessage>
              )}
            </FormControl>
            <div className="ui-mb-6">
              <h5 className="ui-font-bold ui-text-sm ui-mb-4 ui-text-dark-teal">
                {t('annualPlanningTargetGroup:age')}
              </h5>
              <div className="ui-flex ui-justify-between ui-items-start ui-gap-6">
                <AnnualPlanningTargetGroupPopUpFormInputAge
                  title={t('annualPlanningTargetGroup:from')}
                  inputName="from_age"
                  triggerInputNames={['from_age', 'to_age']}
                />
                <AnnualPlanningTargetGroupPopUpFormInputAge
                  title={t('annualPlanningTargetGroup:to')}
                  inputName="to_age"
                  triggerInputNames={['from_age', 'to_age']}
                />
              </div>
            </div>
          </DialogContent>
          <DialogFooter className="ui-justify-center">
            <div className="ui-grid ui-grid-cols-2 ui-gap-4 ui-w-full mx-auto">
              <Button
                id="btn_close_pop_up_form_annual_planning_target_group"
                variant="default"
                type="button"
                onClick={handleClose}
              >
                {t('common:cancel')}
              </Button>
              <Button
                id="btn_submit_pop_up_form_for_annual_planning_target_group"
                type="submit"
                disabled={!methods.formState.isValid}
              >
                {t('common:save')}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </FormProvider>
    </Dialog>
  )
}
