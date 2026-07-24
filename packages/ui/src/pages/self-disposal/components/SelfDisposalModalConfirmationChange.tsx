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

type SelfDisposalModalConfirmationChange = {
  open: boolean
  handleClose: () => void
  handleSubmit: () => void
}
function SelfDisposalModalConfirmationChange({
  open = false,
  handleClose,
  handleSubmit,
}: Readonly<SelfDisposalModalConfirmationChange>) {
  const { t } = useTranslation(['common', 'selfDisposal'])

  return (
    <Dialog open={open} onOpenChange={handleClose} verticalCentered>
      <DialogCloseButton />
      <DialogHeader className="ui-text-center ui-text-xl">
        <p className="ui-text-xl ui-text-primary-800 ui-font-medium">
          {t('common:confirmation')}
        </p>
      </DialogHeader>
      <DialogContent>
        <div className="ui-flex ui-justify-center ui-items-center ui-flex-col ui-gap-4">
          <p className="ui-text-base ui-text-neutral-500 ui-font-normal">{t('selfDisposal:create.warning_changes', { returnObjects: true })[0]}</p>
          <p className="ui-text-base ui-text-primary-800 ui-font-medium">{t('selfDisposal:create.warning_changes', { returnObjects: true })[1]}</p>
        </div>
      </DialogContent>
      <DialogFooter className="ui-justify-center">
        <div className="ui-grid ui-grid-cols-2 ui-gap-4 ui-w-full">
          <Button
            id="btn-close-modal-confirmation"
            onClick={handleClose}
            variant="outline"
          >
            {t('common:cancel')}
          </Button>
          <Button
            id="btn-submit-modal-confirmation"
            onClick={handleSubmit}
            color="danger"
          >
            {t('common:yes')}
          </Button>
        </div>
      </DialogFooter>
    </Dialog>
  )
}

export default SelfDisposalModalConfirmationChange
