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
import { EmptyState } from '#components/empty-state'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'
import { FormProvider, useFieldArray, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import AnnualPlanningTargetGroupListContext from '../../list/libs/annual-planning-target-group-list.context'
import { useSubmitAnnualPlanningTargetGroup } from '../hooks/useSubmitAnnualPlanningTargetGroup'
import { annualPlanningTargetGroupProgramFormValidation } from '../libs/annual-planning-target-group-form.validation-schema'
import AnnualPlanningTargetGroupPopUpProgramFormInfo from './AnnualPlanningTargetGroupPopUpProgramFormInfo'
import AnnualPlanningTargetGroupPopUpProgramFormInputForm from './AnnualPlanningTargetGroupPopUpProgramFormInputForm'

export default function AnnualPlanningTargetGroupPopUpProgramForm() {
  const { t } = useTranslation(['common', 'annualPlanningTargetGroup'])
  const { setOpenCreateProgramModal, openCreateProgramModal } = useContext(
    AnnualPlanningTargetGroupListContext
  )

  const methods = useForm({
    mode: 'onChange',
    defaultValues: {
      target_group: [],
    },
    resolver: yupResolver(annualPlanningTargetGroupProgramFormValidation(t)),
  })

  const { handleSubmit, setError, control } = methods

  const { fields, remove, append } = useFieldArray({
    control,
    name: 'target_group',
  })

  const handleClose = () => {
    methods.clearErrors()
    methods.resetField('target_group')
    setOpenCreateProgramModal(false)
  }

  const { mutate, isPending } = useSubmitAnnualPlanningTargetGroup({
    setError,
    isGlobal: false,
    handleClose,
  })

  useSetLoadingPopupStore(isPending)

  return (
    <Dialog open={openCreateProgramModal} size="2xl">
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit((data) => mutate(data))}>
          <DialogCloseButton onClick={handleClose} />
          <DialogHeader className="ui-text-center ui-text-xl" border>
            {t('annualPlanningTargetGroup:add')}
          </DialogHeader>
          <DialogContent className="ui-px-6 ui-min-h-80 ui-overflow-auto ui-max-h-md">
            <div className="ui-mt-4 ui-space-y-6">
              <AnnualPlanningTargetGroupPopUpProgramFormInfo append={append} />
              {fields.length > 0 ? (
                fields?.map((field: { id: string }, index: number) => (
                  <AnnualPlanningTargetGroupPopUpProgramFormInputForm
                    key={index?.toString()}
                    index={index}
                    remove={remove}
                    field={field}
                  />
                ))
              ) : (
                <EmptyState
                  withIcon
                  title={t('common:message.empty.title')}
                  description={t(
                    'common:message.empty.description_empty_list_only'
                  )}
                />
              )}
            </div>
          </DialogContent>
          <DialogFooter className="ui-justify-center" border>
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
