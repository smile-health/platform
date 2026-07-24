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
import { Form } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { useDisposalInstructionCreate } from '../../DisposalInstructionCreateContext'
import { useConfirmationForm } from './useConfirmationForm'

export const ConfirmationFormModal = () => {
  const { t } = useTranslation(['common', 'disposalInstructionCreate'])

  const disposalInstructionCreate = useDisposalInstructionCreate()
  const confirmationForm = useConfirmationForm()

  return (
    <Dialog
      size="lg"
      open={confirmationForm.modal.isShow}
      onOpenChange={confirmationForm.modal.close}
    >
      <Form control={confirmationForm.methods.control}>
        <DialogCloseButton />
        <DialogHeader className="ui-text-center ui-text-xl">
          {t('common:confirmation')}
        </DialogHeader>
        <DialogContent className="ui-space-y-4">
          <FormControl>
            <FormLabel required>
              {t('disposalInstructionCreate:field.bast_no.label')}
            </FormLabel>
            <Input
              {...confirmationForm.methods.register('bast_no')}
              id="input-entity-code"
              placeholder={t(
                'disposalInstructionCreate:field.bast_no.placeholder'
              )}
              maxLength={100}
            />
            {confirmationForm.errors?.bast_no?.message && (
              <FormErrorMessage>
                {confirmationForm.errors?.bast_no?.message}
              </FormErrorMessage>
            )}
          </FormControl>
          <FormControl className="ui-space-y-2 ui-w-full">
            <FormLabel>
              {t('disposalInstructionCreate:field.comment.label')}
            </FormLabel>
            <TextArea
              {...confirmationForm.methods.register('disposal_comments')}
              placeholder={t(
                'disposalInstructionCreate:field.comment.placeholder'
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
              type="button"
              onClick={confirmationForm.modal.close}
            >
              {t('cancel')}
            </Button>
            <Button
              id="btn-submit-modal-confirmation"
              color="primary"
              onClick={confirmationForm.methods.handleSubmit(
                disposalInstructionCreate.submitConfirmationForm
              )}
            >
              {t('disposalInstructionCreate:button.submit_confirmation')}
            </Button>
          </div>
        </DialogFooter>
      </Form>
    </Dialog>
  )
}
