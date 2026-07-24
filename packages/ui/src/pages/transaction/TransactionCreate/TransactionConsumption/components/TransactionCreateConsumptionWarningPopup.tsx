import React from 'react'
import { ExclamationCircleIcon } from '@heroicons/react/24/outline'
import { Button } from '#components/button'
import {
  Dialog,
  DialogCloseButton,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from '#components/dialog'
import { useTranslation } from 'react-i18next'

type Props = {
  open: boolean
  description: string
  handleClose: () => void
  handleSubmit: () => void
  isDanger?: boolean
}

const TransactionCreateConsumptionWarningPopup: React.FC<Props> = (props) => {
  const { open, handleClose, description, handleSubmit, isDanger } = props
  const { t } = useTranslation()

  return (
    <Dialog
      open={open}
      onOpenChange={handleClose}
      verticalCentered
      classNameOverlay="ui-z-[19]"
      className="ui-z-[19]"
    >
      <DialogCloseButton />
      <DialogHeader
        className={
          isDanger ? 'ui-text-left ui-text-xl' : 'ui-text-center ui-text-xl'
        }
      >
        {isDanger ? (
          <div className="ui-flex ui-flex-col ui-gap-4">
            <div className="ui-bg-[#FEF2F2] ui-rounded-full ui-w-10 ui-h-10 ui-flex ui-items-center ui-justify-center">
              <ExclamationCircleIcon
                className="ui-text-[#DC2626] ui-w-6 ui-h-6"
                strokeWidth={2}
              />
            </div>
            <p className="ui-text-xl ui-text-[#DC2626] ui-font-medium">
              {t('confirmation')}
            </p>
          </div>
        ) : (
          <p className="ui-text-xl ui-text-primary-800 ui-font-medium">
            {t('confirmation')}
          </p>
        )}
      </DialogHeader>
      <DialogContent>
        <p
          className={`${
            isDanger
              ? 'ui-text-[#0C3045] ui-text-left'
              : 'ui-text-primary-800 ui-text-justify'
          } ui-text-base`}
          dangerouslySetInnerHTML={{ __html: description }}
        />
      </DialogContent>
      <DialogFooter className="ui-justify-center">
        <div className="ui-grid ui-grid-cols-2 ui-gap-4 ui-w-full">
          <Button
            id="btn-close-modal-confirmation"
            onClick={handleClose}
            variant="outline"
            type="button"
          >
            {t('cancel')}
          </Button>
          <Button
            id="btn-submit-modal-confirmation"
            onClick={() => {
              handleSubmit()
              handleClose()
            }}
            type="button"
          >
            {t('yes')}
          </Button>
        </div>
      </DialogFooter>
    </Dialog>
  )
}

export default TransactionCreateConsumptionWarningPopup
