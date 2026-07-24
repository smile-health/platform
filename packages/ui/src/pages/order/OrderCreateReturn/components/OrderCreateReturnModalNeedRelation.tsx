import { Button } from '#components/button'
import {
  Dialog,
  DialogCloseButton,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from '#components/dialog'
import ExclamationMarkCircleIcon from '#components/icons/ExclamationMarkCircleIcon'
import { useTranslation } from 'react-i18next'

type OrderCreateReturnModalNeedRelationProps = {
  open: boolean
  setOpen: (open: boolean) => void
  header: string
  message: string
  list: string[]
}

export default function OrderCreateReturnModalNeedRelation({
  open,
  setOpen,
  header,
  message,
  list,
}: OrderCreateReturnModalNeedRelationProps) {
  const { t } = useTranslation('common')

  return (
    <Dialog
      open={open}
      onOpenChange={() => setOpen(false)}
      size="lg"
      verticalCentered
    >
      <DialogCloseButton />
      <DialogHeader>
        <ExclamationMarkCircleIcon />
        <p className="ui-text-xl ui-font-medium ui-text-[#DC2626] ui-mt-3">
          {header}
        </p>
      </DialogHeader>
      <DialogContent className="ui-space-y-4">
        <p className="ui-text-base ui-text-neutral-500">{message}</p>
        <ul className="ui-list-disc">
          {list.map((item, index) => (
            <li
              key={index}
              className="ui-border ui-bg-[#F5F5F4] ui-border-[#D4D4D4] ui-list-disc ui-list-inside ui-w-full ui-px-3 ui-py-1 ui-text-left"
            >
              {item}
            </li>
          ))}
        </ul>
      </DialogContent>
      <DialogFooter className="ui-justify-center">
        <Button
          id="btn-close-modal-need-relation"
          variant="outline"
          type="button"
          onClick={() => setOpen(false)}
          className="ui-w-full"
        >
          {t('close')}
        </Button>
      </DialogFooter>
    </Dialog>
  )
}
