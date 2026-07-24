'use client'

import { Button } from '#components/button'
import {
  Dialog,
  DialogCloseButton,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from '#components/dialog'
import { useTranslation } from 'react-i18next'
import { useModalWarningStore } from '../store/modal-warning.store'

function TransactionCreateModalWarningItem() {
  const { t } = useTranslation('common')
  const {
    modalWarning,
    setModalWarning
  } = useModalWarningStore()

  const handleClose = () => setModalWarning(false, '')

  return (
    <Dialog
      open={modalWarning.open}
      onOpenChange={handleClose}
      size="lg"
      className="z-10"
      classNameOverlay="z-10"
      verticalCentered
    >
      <DialogCloseButton />
      <DialogHeader className="">
        <p className="ui-text-xl ui-font-medium ui-text-dark-teal">
          {t('confirmation')}
        </p>
      </DialogHeader>
      <DialogContent>
        <p className='ui-text-justify ui-text-base ui-font-normal ui-text-neutral-500'>{modalWarning.description}</p>
      </DialogContent>
      <DialogFooter className="ui-justify-center">
        <Button
          id="btn-close-modal-confirmation"
          variant="outline"
          type="button"
          onClick={handleClose}
          className="ui-w-full"
        >
          {t('close')}
        </Button>
      </DialogFooter>
    </Dialog>
  )
}

export default TransactionCreateModalWarningItem
