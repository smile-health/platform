import { Button } from '#components/button'
import {
  Dialog,
  DialogCloseButton,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from '#components/dialog'
import dayjs from 'dayjs'
import { useTranslation } from 'react-i18next'

import { useDisposalItems } from './useDisposalItems'

export const WmsStatusHistoryModal = () => {
  const { t } = useTranslation(['common', 'disposalInstructionDetail'])

  const disposalItems = useDisposalItems()

  return (
    <Dialog
      size="lg"
      open={disposalItems.wmsStatusHistoryModal.isShow}
      onOpenChange={disposalItems.wmsStatusHistoryModal.close}
      className="ui-z-[60]"
      classNameOverlay="ui-z-50"
    >
      <DialogCloseButton />
      <DialogHeader className="ui-text-center ui-text-xl ui-my-2">
        {t('disposalInstructionDetail:section.view_wms_status_history.title')}
      </DialogHeader>

      <div className="ui-h-1 ui-border-t ui-border-neutral-300" />

      <DialogContent className="ui-space-y-4 my-2 mb-4">
        <div className="space-y-2">
          <h2 className="ui-font-medium ui-text-neutral-500">
            {t('disposalInstructionDetail:data.waste_bag_code')}
          </h2>
          <p className="ui-font-bold ui-text-primary-800 ui-mb-1 ui-text-lg">
            {disposalItems.selectedWasteInfo?.waste_bag_codes}
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="ui-font-semibold ui-text-neutral-500">
            {t('disposalInstructionDetail:data.wms_status_history')}
          </h2>

          <div className="ui-text-sm space-y-1">
            {disposalItems.selectedWasteInfo?.waste_bag_histories
              ?.sort(
                (a, b) => dayjs(a.updated_at).unix() - dayjs(b.updated_at).unix()
              )
              ?.map((history) => (
                <div
                  key={history.status_id}
                  className="ui-flex ui-justify-between ui-items-center"
                >
                  <p className="ui-text-gray-500">{history.status_label}</p>
                  <p className="ui-uppercase ui-text-right ui-text-primary-800">
                    {dayjs(history.updated_at).format('DD MMM YYYY HH:mm')}
                  </p>
                </div>
              ))}
          </div>
        </div>
      </DialogContent>

      <div className="ui-h-1 ui-border-t ui-border-neutral-300" />

      <DialogFooter className="ui-justify-center">
        <Button
          id="btn-close-modal-confirmation"
          variant="outline"
          type="button"
          onClick={disposalItems.wmsStatusHistoryModal.close}
          fullWidth
        >
          {t('common:close')}
        </Button>
      </DialogFooter>
    </Dialog>
  )
}
