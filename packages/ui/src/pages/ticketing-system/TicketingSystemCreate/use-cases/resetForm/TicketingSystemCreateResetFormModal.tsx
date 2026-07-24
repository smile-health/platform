import { Button } from '#components/button'
import {
  Dialog,
  DialogCloseButton,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from '#components/dialog'
import { useTranslation } from 'react-i18next'

import { useTicketingSystemCreateContext } from '../../TicketingSystemCreateProvider'
import useTicketingSystemCreateResetForm from './useTicketingSystemCreateResetForm'

const TicketingSystemCreateResetFormModal = () => {
  const { t } = useTranslation('ticketingSystemCreate')

  const { form } = useTicketingSystemCreateContext()
  const resetForm = useTicketingSystemCreateResetForm({ form })

  return (
    <Dialog
      size="lg"
      open={resetForm.modal.isOpen}
      onOpenChange={resetForm.modal.open}
    >
      <DialogCloseButton />
      <DialogHeader className="ui-text-center ui-text-xl">
        {t('modal.reset.title')}
      </DialogHeader>
      <DialogContent className="ui-space-y-4">
        <p className="ui-text-center ui-text-neutral-500">
          {t('modal.reset.description')}
        </p>
      </DialogContent>
      <DialogFooter className="ui-justify-center">
        <div className="ui-grid ui-grid-cols-2 ui-gap-4 ui-w-full mx-auto">
          <Button
            id="btn-close-modal-confirmation"
            type="button"
            variant="outline"
            onClick={resetForm.modal.close}
          >
            {t('common:cancel')}
          </Button>
          <Button
            id="btn-reset-modal-confirmation"
            type="button"
            color="primary"
            onClick={resetForm.reset}
          >
            {t('common:yes')}
          </Button>
        </div>
      </DialogFooter>
    </Dialog>
  )
}

export default TicketingSystemCreateResetFormModal
