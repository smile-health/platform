import { Dispatch, ReactNode, SetStateAction } from 'react'
import { Button } from '#components/button'
import {
  Dialog,
  DialogCloseButton,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from '#components/dialog'
import { useTranslation } from 'react-i18next'
import cx from '#lib/cx'

type ModalConfirmation = {
  open?: boolean
  setOpen?: Dispatch<SetStateAction<boolean>>
  onSubmit?: VoidFunction
  title?: string
  description: ReactNode
  subDescription?: ReactNode
  subDescriptionClassName?: string
  type?: 'delete' | 'update'
  buttonTitle?: string | null
  timeoutTime?: number
  isLoading?: boolean
}

export function ModalConfirmation({
  open,
  setOpen,
  onSubmit,
  title,
  description,
  subDescription,
  type = 'update',
  buttonTitle = null,
  timeoutTime = 300,
  isLoading = false,
  subDescriptionClassName,
}: Readonly<ModalConfirmation>) {
  const { t } = useTranslation()

  const handleSubmit = () => {
    onSubmit?.()
    setTimeout(() => setOpen?.(!open), timeoutTime)
  }

  return (
    <Dialog size="lg" open={open} onOpenChange={setOpen}>
      <DialogCloseButton />
      <DialogHeader className="ui-text-center ui-text-xl">
        {title ?? t('confirmation')}
      </DialogHeader>
      <DialogContent className="ui-space-y-4">
        <p className="ui-text-center ui-text-neutral-500">{description}</p>
        {subDescription && (
          <p className={cx("ui-text-center ui-text-dark-blue ui-font-medium", subDescriptionClassName)}>
            {subDescription}
          </p>
        )}
      </DialogContent>
      <DialogFooter className="ui-justify-center">
        <div className="ui-grid ui-grid-cols-2 ui-gap-4 ui-w-full mx-auto">
          <Button
            id="btn-close-modal-confirmation"
            type="button"
            variant="outline"
            onClick={() => setOpen?.(!open)}
          >
            {t('cancel')}
          </Button>
          <Button
            id="btn-submit-modal-confirmation"
            type="button"
            loading={isLoading}
            disabled={isLoading}
            color={type === 'delete' ? 'danger' : 'primary'}
            onClick={handleSubmit}
          >
            {buttonTitle ?? t('yes')}
          </Button>
        </div>
      </DialogFooter>
    </Dialog>
  )
}
