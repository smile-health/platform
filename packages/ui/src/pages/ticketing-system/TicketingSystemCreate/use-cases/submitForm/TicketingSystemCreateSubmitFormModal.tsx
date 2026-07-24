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
import useTicketingSystemCreateSubmitForm from './useTicketingSystemCreateSubmitForm'

const TicketingSystemCreateSubmitFormModal = () => {
  const { t } = useTranslation('ticketingSystemCreate')

  const { form } = useTicketingSystemCreateContext()
  const submitForm = useTicketingSystemCreateSubmitForm({ form })

  return (
    <Dialog
      open={submitForm.modal.isOpen}
      onOpenChange={submitForm.modal.close}
      size="lg"
    >
      <DialogHeader className="ui-text-center ui-text-xl ui-text-primary-500 p-4 pb-0">
        {t('modal.submission.title')}
        <DialogCloseButton className="ui-top-6 ui-right-4" />
      </DialogHeader>
      <DialogContent className="ui-pt-0 ui-pb-4">
        <div
          className="ui-text-gray-500 text-center"
          dangerouslySetInnerHTML={{
            __html: t('modal.submission.description'),
          }}
        />
      </DialogContent>
      <DialogFooter className="ui-justify-center">
        <Button
          id="btn-close-modal-import"
          variant="default"
          fullWidth
          onClick={submitForm.modal.close}
        >
          {t('common:cancel')}
        </Button>
        <Button
          id="btn-submit-modal-import"
          onClick={submitForm.submit}
          fullWidth
        >
          {t('common:yes')}
        </Button>
      </DialogFooter>
    </Dialog>
  )
}

export default TicketingSystemCreateSubmitFormModal
