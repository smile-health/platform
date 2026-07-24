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
  setOpen: (value: boolean) => void
}

export default function OrderCreateBatchModalWarning({
  open,
  setOpen,
}: Readonly<Props>) {
  const { t } = useTranslation('order')

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
      className="z-10"
      classNameOverlay="z-10"
      verticalCentered
    >
      <DialogCloseButton />
      <DialogHeader>{t('batch_warning.title')}</DialogHeader>
      <DialogContent>{t('batch_warning.description')}</DialogContent>
      <DialogFooter className="ui-grid ui-grid-cols-1">
        <Button variant="outline" onClick={() => setOpen(!open)}>
          {t('close')}
        </Button>
      </DialogFooter>
    </Dialog>
  )
}
