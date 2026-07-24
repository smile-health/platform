import { Dispatch, SetStateAction } from 'react'
import { Button } from '#components/button'
import {
  Dialog,
  DialogCloseButton,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from '#components/dialog'
import { SubmitHandler, UseFormReturn } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

type AssetInventoryDetailModalDeleteConfirmation = {
  onSubmit: SubmitHandler<{ reason: string }>
  methods: UseFormReturn<
    {
      reason: string
    },
    any,
    {
      reason: string
    }
  >
  open?: boolean
  setOpen?: Dispatch<SetStateAction<boolean>>
  children?: React.ReactNode
}

export default function AssetInventoryDetailModalDeleteConfirmation({
  open,
  setOpen,
  onSubmit,
  children,
  methods,
}: Readonly<AssetInventoryDetailModalDeleteConfirmation>) {
  const { t } = useTranslation(['common', 'assetInventory'])

  const { handleSubmit, reset } = methods

  return (
    <Dialog size="lg" open={open} onOpenChange={setOpen}>
      <DialogCloseButton />
      <form onSubmit={handleSubmit(onSubmit)} {...methods}>
        <DialogHeader className="ui-text-center ui-text-xl">
          {t('common:confirmation')}
        </DialogHeader>
        <DialogContent className="ui-space-y-4">
          <p className="ui-text-center ui-text-neutral-500">
            {t('assetInventory:deletion.delete_confirmation')}
          </p>
          {children}
        </DialogContent>
        <DialogFooter className="ui-justify-center">
          <div className="ui-grid ui-grid-cols-2 ui-gap-4 ui-w-full mx-auto">
            <Button
              id="delete__asset__confirmation__cancel"
              color="primary"
              onClick={() => {
                setOpen?.(!open)
                reset()
              }}
              type="button"
            >
              {t('common:cancel')}
            </Button>
            <Button
              id="delete__asset__confirmation"
              color="primary"
              variant="outline"
              type="submit"
            >
              {t('assetInventory:deletion.delete')}
            </Button>
          </div>
        </DialogFooter>
      </form>
    </Dialog>
  )
}
