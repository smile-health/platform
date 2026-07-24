import { Button } from '#components/button'
import {
  Dialog,
  DialogCloseButton,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from '#components/dialog'
import Book from '#components/icons/Book'
import BookOpen from '#components/icons/BookOpen'
import { numberFormatter } from '#utils/formatter'
import { useTranslation } from 'react-i18next'

import { QtyDetailTable } from './QtyDetailTable'
import { useDisposalItems } from './useDisposalItems'

export const QtyDetailModal = () => {
  const { t, i18n } = useTranslation(['common', 'disposalInstructionDetail'])

  const disposalItems = useDisposalItems()

  return (
    <Dialog
      size="xl"
      open={disposalItems.qtyDetailModal.isShow}
      onOpenChange={disposalItems.qtyDetailModal.close}
    >
      <DialogCloseButton />
      <DialogHeader className="ui-text-center ui-text-xl ui-my-2">
        {t('disposalInstructionDetail:section.view_qty_detail.title')}
      </DialogHeader>

      <div className="ui-h-1 ui-border-t ui-border-neutral-300" />

      <DialogContent className="ui-space-y-4 my-2 mb-4">
        <div className="ui-flex ui-items-center ui-gap-10">
          <div>
            <h2 className="ui-text-sm ui-font-medium ui-text-neutral-500">
              Material
            </h2>
            <p className="ui-font-bold ui-text-primary-800 ui-mb-1">
              {disposalItems.selectedDisposalItem?.master_material?.name}
            </p>
          </div>
        </div>

        <QtyDetailTable />

        <div className="space-y-2">
          <div className="ui-font-semibold ui-text-primary-800 ui-space-y-2">
            {t(
              'disposalInstructionDetail:section.opening_and_closing_of_total_discard.title'
            )}
          </div>
          <div className="ui-grid ui-grid-cols-2 ui-gap-2.5">
            <div className="ui-p-2 ui-rounded-md ui-flex ui-items-center ui-gap-4 ui-border">
              <div className="ui-flex ui-items-center ui-justify-center ui-w-10">
                <BookOpen className="w-5" />
              </div>
              <div className="ui-text-sm ui-space-y-1">
                <div>
                  {t('disposalInstructionDetail:data.opening_of_total_discard')}
                </div>
                <div className="ui-font-semibold">
                  {numberFormatter(
                    disposalItems.selectedDisposalItem?.opening_qty,
                    i18n.language
                  )}
                </div>
              </div>
            </div>
            <div className="ui-p-2 ui-rounded-md ui-flex ui-items-center ui-gap-4 ui-border">
              <div className="ui-flex ui-items-center ui-justify-center ui-w-10">
                <Book className="ui-text-primary-500 size-4" />
              </div>
              <div className="ui-text-sm ui-space-y-1">
                <div>
                  {t('disposalInstructionDetail:data.closing_of_total_discard')}
                </div>
                <div className="ui-font-semibold">
                  {numberFormatter(
                    disposalItems.selectedDisposalItem?.closing_qty,
                    i18n.language
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>

      <div className="ui-h-1 ui-border-t ui-border-neutral-300" />

      <DialogFooter className="ui-justify-center">
        <Button
          id="btn-close-modal-confirmation"
          variant="outline"
          type="button"
          onClick={disposalItems.qtyDetailModal.close}
          fullWidth
        >
          {t('common:close')}
        </Button>
      </DialogFooter>
    </Dialog>
  )
}
