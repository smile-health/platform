import { Button } from '#components/button'
import {
  Dialog,
  DialogCloseButton,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from '#components/dialog'
import { useTranslation } from 'react-i18next'

type DetailDeleteModalProps = {
  open: boolean
  setOpen: (open: boolean) => void
  onConfirm: () => void
  isDeleting: boolean
}

export const DetailDeleteModal = ({
  open,
  setOpen,
  onConfirm,
  isDeleting,
}: DetailDeleteModalProps) => {
  const { t } = useTranslation(['common', 'monitoringDeviceInventoryDetail'])

  const handleConfirm = () => {
    onConfirm()
  }

  return (
    <Dialog size="md" open={open} onOpenChange={setOpen}>
      <DialogCloseButton />
      <DialogHeader className="ui-text-center ui-text-xl">
        {t('common:confirmation')}
      </DialogHeader>
      <DialogContent className="ui-space-y-4">
        <p className="ui-text-center ui-text-neutral-500">
          {t('monitoringDeviceInventoryDetail:modal.delete_confirmation')}
        </p>
      </DialogContent>
      <DialogFooter className="ui-justify-center">
        <div className="ui-grid ui-grid-cols-2 ui-gap-4 ui-w-full ui-mx-auto">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isDeleting}
          >
            {t('common:cancel')}
          </Button>
          <Button
            color="danger"
            onClick={handleConfirm}
            loading={isDeleting}
            disabled={isDeleting}
          >
            {t('common:delete')}
          </Button>
        </div>
      </DialogFooter>
    </Dialog>
  )
}
