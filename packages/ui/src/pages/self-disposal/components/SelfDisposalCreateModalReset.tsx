import React from 'react'
import { Button } from '#components/button'
import {
  Dialog,
  DialogCloseButton,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from '#components/dialog'
import { useTranslation } from 'react-i18next'

import { useModalResetStore } from '../self-disposal.store'
import useSmileRouter from '#hooks/useSmileRouter'

const SelfDisposalCreateModalReset = () => {
  const { t } = useTranslation(['common', 'selfDisposal'])
  const { modalReset, setModalReset } = useModalResetStore()
  const router = useSmileRouter()

  const handleClose = () => setModalReset(false)

  return (
    <Dialog
      closeOnOverlayClick={false}
      open={modalReset.open}
      onOpenChange={handleClose}
      size="lg"
    >
      <DialogCloseButton />
      <DialogHeader className='ui-text-center'>
        <h6 className="ui-text-center ui-text-xl ui-text-primary-800 ui-font-medium">
          {t('common:confirmation')}
        </h6>
      </DialogHeader>
      <DialogContent>
        <p className='ui-text-center ui-text-neutral-500'>{t('selfDisposal:reset.description')}</p>
      </DialogContent>
      <DialogFooter className="ui-justify-center">
        <div className="ui-w-full ui-flex ui-flex-row ui-space-x-5">
          <Button
            color="primary"
            variant="outline"
            onClick={handleClose}
            className="ui-w-full"
          >
            {t('common:cancel')}
          </Button>

          <Button
            variant="solid"
            onClick={() => router.reload()}
            className="ui-w-full"
          >
            {t('common:yes')}
          </Button>
        </div>
      </DialogFooter>
    </Dialog>
  )
}

export default SelfDisposalCreateModalReset
