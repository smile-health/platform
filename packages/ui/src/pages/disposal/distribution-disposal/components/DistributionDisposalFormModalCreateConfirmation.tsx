import React, { useState } from 'react'
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
import { TextArea } from '#components/text-area'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { createDistributionDisposalConfirmationFormSchema } from '../schemas/distribution-disposal.schema-form'
import { DistributionDisposalConfirmationForm } from '../types/DistributionDisposal'

type Props = {
  open: boolean
  handleClose: () => void
  handleConfirm: (values: DistributionDisposalConfirmationForm) => void
}
type TFormValidationKeys = 'common:validation.required'
const DistributionDisposalFormModalCreateConfirmation: React.FC<Props> = (
  props
) => {
  const { open, handleClose, handleConfirm } = props
  const { t } = useTranslation(['common', 'distributionDisposal'])
  const methods = useForm<DistributionDisposalConfirmationForm>({
    mode: 'onChange',
    defaultValues: {
      comment: '',
      no_document: '',
    },
    resolver: createDistributionDisposalConfirmationFormSchema,
  })
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = methods

  const onSubmit = (values: DistributionDisposalConfirmationForm) => {
    handleConfirm(values)
  }

  return (
    <FormProvider {...methods}>
      <form>
        <Dialog size="lg" open={open} onOpenChange={handleClose}>
          <DialogCloseButton />
          <DialogHeader className="ui-text-center ui-text-xl">
            {t('common:confirmation')}
          </DialogHeader>
          <DialogContent className="ui-space-y-4">
            <FormControl>
              <FormLabel required>
                {t('distributionDisposal:form.label.no_document')}
              </FormLabel>
              <Input
                {...register('no_document')}
                id="input-entity-code"
                placeholder={t(
                  'distributionDisposal:form.placeholder.no_document'
                )}
                maxLength={100}
              />
              {errors?.no_document?.message && (
                <FormErrorMessage>
                  {t(errors?.no_document?.message as TFormValidationKeys)}
                </FormErrorMessage>
              )}
            </FormControl>
            <FormControl className="ui-space-y-2 ui-w-full">
              <FormLabel>
                {t('distributionDisposal:detail.comment.title')}
              </FormLabel>
              <TextArea
                {...register('comment')}
                placeholder={t(
                  'distributionDisposal:detail.comment.placeholder'
                )}
                className="ui-min-h-[80px] ui-text-sm"
              />
            </FormControl>
          </DialogContent>
          <DialogFooter className="ui-justify-center">
            <div className="ui-grid ui-grid-cols-2 ui-gap-4 ui-w-full mx-auto">
              <Button
                id="btn-close-modal-confirmation"
                variant="outline"
                onClick={handleClose}
              >
                {t('cancel')}
              </Button>
              <Button
                id="btn-submit-modal-confirmation"
                color="primary"
                type="button"
                onClick={handleSubmit(onSubmit)}
              >
                {t('distributionDisposal:detail.status_confirmation.submit')}
              </Button>
            </div>
          </DialogFooter>
        </Dialog>
      </form>
    </FormProvider>
  )
}

export default DistributionDisposalFormModalCreateConfirmation
