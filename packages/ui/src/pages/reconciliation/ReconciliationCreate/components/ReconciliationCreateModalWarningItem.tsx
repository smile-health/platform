import React from 'react'
import { Button } from '#components/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from '#components/dialog'
import XMark from '#components/icons/XMark'
import { useTranslation } from 'react-i18next'

import { useModalWarningItemStore } from '../store/modal-warning.store'

const ReconciliationCreateModalWarningItem = () => {
  const { t } = useTranslation(['common', 'reconciliation'])
  const { modalRemove, setModalRemove, customFunction, content } =
    useModalWarningItemStore()
  const handleClose = () => setModalRemove(false)
  const handleConfirm = () => {
    if (customFunction) {
      customFunction(modalRemove.open)
    }
    handleClose()
  }
  return (
    <Dialog
      closeOnOverlayClick={false}
      open={modalRemove.open}
      onOpenChange={handleClose}
      size="lg"
    >
      <DialogHeader>
        <div className="ui-flex ui-justify-between">
          <div />
          <h6 className="ui-text-xl ui-text-primary-800 ui-font-medium">
            {t('common:confirmation')}
          </h6>
          <Button
            variant="subtle"
            type="button"
            color="neutral"
            onClick={handleClose}
          >
            <XMark />
          </Button>
        </div>
      </DialogHeader>
      <DialogContent>
        <div className="ui-text-center">
          <div className="ui-text-neutral-500 ui-mb-5">
            {content
              ? content?.title
              : t('reconciliation:create.change_dialog.question_detail')}
          </div>
          <div className="ui-text-dark-blue">
            {content
              ? content?.description
              : t('reconciliation:create.change_dialog.description')}
          </div>
        </div>
      </DialogContent>
      <DialogFooter>
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
            color="danger"
            onClick={handleConfirm}
            className="ui-w-full"
          >
            {t('common:yes')}
          </Button>
        </div>
      </DialogFooter>
    </Dialog>
  )
}

export default ReconciliationCreateModalWarningItem
