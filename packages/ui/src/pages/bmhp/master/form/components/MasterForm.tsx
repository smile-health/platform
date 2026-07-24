// components/MasterForm.tsx
import React, { useEffect, useState } from 'react'
import { Button } from '#components/button'
import { ModalConfirmation } from '#components/modules/ModalConfirmation'
import useSmileRouter from '#hooks/useSmileRouter'
import {
  useFormBuilder,
  UseFormBuilderSchema,
} from '#pages/bmhp/hooks/useFormBuilder'
import { FormProvider } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import * as Yup from 'yup'

export interface MasterFormProps<T = any> {
  id?: string
  title: string
  validation: Yup.ObjectSchema<any>
  initialValues: T
  fields: UseFormBuilderSchema
  onSubmit: (data: T) => void | Promise<void>
  onReset?: () => void
  isLoading?: boolean
  submitButtonText?: string
  resetButtonText?: string
  showResetButton?: boolean
  backButtonText?: string
}

const MasterForm = <T extends Record<string, any>>({
  id,
  title,
  validation,
  initialValues,
  fields,
  onSubmit,
  onReset,
  isLoading = false,
  submitButtonText = 'Send',
  // resetButtonText = 'Reset',
  // showResetButton = true,
  backButtonText = 'Back',
}: MasterFormProps<T>) => {
  const { t } = useTranslation(['masterBmhp', 'common'])
  const router = useSmileRouter()
  const [showModalReset, setShowModalReset] = useState(false)
  const [showModalSave, setShowModalSave] = useState(false)

  const { methods, renderField } = useFormBuilder<T>({
    schema: fields,
    validation,
    defaultValues: initialValues,
    mode: 'onSubmit',
  })

  const { handleSubmit, reset } = methods

  // Reset form when initialValues change (for edit mode)
  useEffect(() => {
    if (id && initialValues) {
      reset(initialValues)
    }
  }, [id, initialValues, reset])

  const resetAction = () => {
    reset(initialValues)
    setShowModalReset(false)
    onReset?.()
  }

  const handleBack = () => {
    onReset?.()
    router.back()
  }

  const handleFormSubmit = async (_: T) => {
    setShowModalSave(true)
  }

  const confirmSubmit = async () => {
    const data = methods.getValues()
    await onSubmit(data as T)
    setShowModalSave(false)
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <div className="mt-6 flex flex-row">
          <div className="ui-border ui-border-[#d2d2d2] ui-w-full ui-p-6 !ui-h-auto">
            <div className="ui-mb-4 ui-font-bold !ui-text-[#0C3045]">
              {title}
            </div>
            <div className="ui-space-y-4">{renderField()}</div>
          </div>
        </div>

        <div className="ui-mt-6">
          <div className="ui-flex ui-flex-row-reverse">
            <Button
              id="form-button-send"
              color="primary"
              type="submit"
              disabled={isLoading}
              className="ui-w-40"
            >
              {submitButtonText}
            </Button>
            <Button
              id="form-button-reset"
              color="primary"
              variant="outline"
              type="button"
              onClick={() => handleBack()}
              className="ui-mr-4 ui-w-40"
            >
              {backButtonText}
            </Button>
          </div>
        </div>

        <ModalConfirmation
          open={showModalReset}
          onSubmit={resetAction}
          setOpen={() => setShowModalReset(!showModalReset)}
          title="Reset Form"
          description="Are you sure you want to reset the form? All entered data will be lost."
        />

        <ModalConfirmation
          isLoading={isLoading}
          open={showModalSave}
          onSubmit={confirmSubmit}
          setOpen={() => setShowModalSave(!showModalSave)}
          title={t('masterBmhp:common.save_data', {
            type: id
              ? t('masterBmhp:common.update')
              : t('masterBmhp:common.save'),
          })}
          description={t('masterBmhp:message.are_you_sure', {
            type: id
              ? t('masterBmhp:common.update')
              : t('masterBmhp:common.save'),
          })}
        />
      </form>
    </FormProvider>
  )
}

export default MasterForm
