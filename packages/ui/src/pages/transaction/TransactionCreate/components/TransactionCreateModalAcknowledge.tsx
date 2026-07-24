'use client'

import { useState } from 'react'
import { Button } from '#components/button'
import { Checkbox } from '#components/checkbox'
import {
  Dialog,
  DialogCloseButton,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from '#components/dialog'
import { useTranslation } from 'react-i18next'

type TransactionCreateModalAcknowledgeProps = {
  open: boolean
  handleClose: () => void
  handleSubmit: () => void
}
function TransactionCreateModalAcknowledge({
  open = false,
  handleClose,
  handleSubmit,
}: Readonly<TransactionCreateModalAcknowledgeProps>) {
  const { t } = useTranslation(['common', 'transactionCreate'])
  const [checkAcknowledge, setCheckAcknowledge] = useState(false)
  return (
    <Dialog open={open} onOpenChange={handleClose} verticalCentered>
      <DialogCloseButton />
      <DialogHeader className="ui-text-center ui-text-xl">
        <p className="ui-text-xl ui-text-primary-800 ui-font-medium">
          {t('common:confirmation')}
        </p>
      </DialogHeader>
      <DialogContent>
        <div className="ui-flex ui-flex-col  ui-space-y-5">
          <div className="ui-text-dark-blue ui-font-medium ui-text-center">
            {t(
              'transactionCreate:transaction_transfer_stock.desc_acknowledge_one'
            )}
          </div>
          <div className="ui-text-dark-blue ui-text-sm">
            <Checkbox
              checked={checkAcknowledge}
              defaultChecked={false}
              onChange={() => setCheckAcknowledge((val) => !val)}
              size="sm"
              label={t(
                'transactionCreate:transaction_transfer_stock.desc_acknowledge_two'
              )}
            />
          </div>
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
            disabled={!checkAcknowledge}
            id="btn-submit-modal-confirmation"
            onClick={handleSubmit}
          >
            {t('common:yes')}
          </Button>
        </div>
      </DialogFooter>
    </Dialog>
  )
}

export default TransactionCreateModalAcknowledge
