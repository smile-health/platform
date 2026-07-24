'use client'

import { ReactNode } from 'react'
import { Button, ButtonColor, ButtonVariant } from '#components/button'
import {
  Dialog,
  DialogCloseButton,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from '#components/dialog'
import { useTranslation } from 'react-i18next'

type StockOpnameModalConfirmationProps = {
  open: boolean
  description: ReactNode
  handleClose: () => void
  handleSubmit: () => void
  buttonProps?: {
    cancel: { variant?: ButtonVariant; color?: ButtonColor }
    submit: { variant?: ButtonVariant; color?: ButtonColor }
  }
}
function StockOpnameModalConfirmation({
  open = false,
  description,
  handleClose,
  handleSubmit,
  buttonProps,
}: Readonly<StockOpnameModalConfirmationProps>) {
  const { t } = useTranslation('common')

  return (
    <Dialog
      open={open}
      onOpenChange={handleClose}
      verticalCentered
      classNameOverlay="ui-z-10"
      className="ui-z-10"
    >
      <DialogCloseButton />
      <DialogHeader className="ui-text-center ui-text-xl">
        <p className="ui-text-xl ui-text-primary-800 ui-font-medium">
          {t('confirmation')}
        </p>
      </DialogHeader>
      <DialogContent>{description}</DialogContent>
      <DialogFooter className="ui-justify-center">
        <div className="ui-grid ui-grid-cols-2 ui-gap-4 ui-w-full">
          <Button
            id="btn-close-modal-confirmation"
            onClick={handleClose}
            {...buttonProps?.cancel}
          >
            {t('cancel')}
          </Button>
          <Button
            id="btn-submit-modal-confirmation"
            onClick={handleSubmit}
            {...buttonProps?.submit}
          >
            {t('yes')}
          </Button>
        </div>
      </DialogFooter>
    </Dialog>
  )
}

export default StockOpnameModalConfirmation
