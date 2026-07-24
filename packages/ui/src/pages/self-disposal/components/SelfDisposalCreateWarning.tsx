import {
  Dialog,
  DialogCloseButton,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from '#components/dialog'
import { Button } from '#components/button'
import { useTranslation } from 'react-i18next'

export default function SelfDisposalCreateWarning({
  isOpen,
  onClose,
}: {
  isOpen: boolean
  onClose: () => void
}) {
  const { t } = useTranslation(['common', 'selfDisposal'])

  return (
    <Dialog
      open={isOpen}
      onOpenChange={onClose}
      size="lg"
      className="z-10"
      classNameOverlay="z-10"
      verticalCentered
    >
      <DialogCloseButton />
      <DialogHeader className="ui-text-xl ui-font-medium ui-text-dark-teal">
        {t('confirmation')}
      </DialogHeader>
      <DialogContent>
        <p className="ui-text-justify ui-text-base ui-font-normal ui-text-neutral-500">
          {t('selfDisposal:create.validation.material_items')}
        </p>
      </DialogContent>
      <DialogFooter className="ui-justify-center">
        <Button
          id="btn-close-modal-confirmation"
          variant="outline"
          type="button"
          onClick={onClose}
          className="ui-w-full"
        >
          {t('close')}
        </Button>
      </DialogFooter>
    </Dialog>
  )
}