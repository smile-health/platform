import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { Button } from '#components/button'
import {
  Dialog,
  DialogCloseButton,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from '#components/dialog'
import { useTranslation } from 'react-i18next'

type ThresholdModalProps = {
  open: boolean
  setOpen: (open: boolean) => void
  onConfirm: () => void
  isUpdating?: boolean
}

export const ThresholdModal = ({
  open,
  setOpen,
  onConfirm,
  isUpdating,
}: ThresholdModalProps) => {
  const { t } = useTranslation(['storageTemperatureMonitoringDetail'])

  const handleConfirm = () => {
    onConfirm()
  }

  return (
    <Dialog size="md" open={open} onOpenChange={setOpen}>
      <DialogCloseButton />
      <DialogHeader className="ui-text-center ui-mt-4">
        <ExclamationTriangleIcon className="ui-inline-block ui-w-8 ui-h-8 ui-text-warning-500" />
      </DialogHeader>
      <DialogContent className="ui-space-y-3">
        <p className="ui-text-center ui-text-dark-teal ui-text-xl">
          {t('storageTemperatureMonitoringDetail:modal.change_threshold.title')}
        </p>
        <p className="ui-text-center ui-text-base ui-text-neutral-500">
          {t(
            'storageTemperatureMonitoringDetail:modal.change_threshold.description'
          )}
        </p>
        <div className="ui-border ui-rounded ui-border-warning-500 ui-py-3 ui-px-4 ui-bg-warning-50">
          <div className="ui-flex ui-flex-row ui-items-center ui-mb-1 ui-gap-2">
            <ExclamationTriangleIcon className="ui-inline-block ui-w-8 ui-h-8 ui-text-dark-teal" />
            <p className="ui-text-xs ui-text-grey-500">
              {t(
                'storageTemperatureMonitoringDetail:modal.change_threshold.warning'
              )}
            </p>
          </div>
        </div>
      </DialogContent>
      <DialogFooter className="ui-justify-center">
        <div className="ui-grid ui-grid-cols-2 ui-gap-4 ui-w-full ui-mx-auto">
          <Button
            variant="solid"
            color="primary"
            onClick={() => setOpen(false)}
            disabled={isUpdating}
          >
            {t(
              'storageTemperatureMonitoringDetail:modal.change_threshold.button.cancel'
            )}
          </Button>
          <Button
            color="primary"
            variant="outline"
            onClick={handleConfirm}
            loading={isUpdating}
            disabled={isUpdating}
          >
            {t(
              'storageTemperatureMonitoringDetail:modal.change_threshold.button.yes'
            )}
          </Button>
        </div>
      </DialogFooter>
    </Dialog>
  )
}
