import React from 'react'
import Link from 'next/link'
import { Button } from '#components/button'
import { Dialog, DialogContent } from '#components/dialog'
import useSmileRouter from '#hooks/useSmileRouter'
import { useExportAsyncPopupStore } from '#store/exportAsync.store'
import { useTranslation } from 'react-i18next'

const ExportAsyncPopup: React.FC = () => {
  const { exportAsyncPopup, setExportAsyncPopup } = useExportAsyncPopupStore()
  const { t } = useTranslation()
  const { getAsLinkGlobal } = useSmileRouter()

  if (!exportAsyncPopup) return null

  return (
    <Dialog
      open={exportAsyncPopup}
      onOpenChange={() => setExportAsyncPopup(false)}
    >
      <DialogContent className="ui-flex ui-flex-col ui-gap-6 ui-items-center ui-p-6">
        <div className="ui-flex ui-flex-col ui-gap-1 ui-items-center">
          <p className="ui-text-sm ui-font-normal ui-text-primary-700">
            {t('modal_export_async_popup.title')}
          </p>
          <p className="ui-text-xs ui-font-normal ui-text-neutral-500">
            {t('modal_export_async_popup.description')}
          </p>
        </div>
        <Link
          className="ui-text-sm ui-font-normal ui-text-primary-500"
          href={getAsLinkGlobal('/v5/export-history')}
          target="_blank"
        >
          <Button
            className="ui-w-max"
            type="button"
            variant="light"
            size="sm"
            onClick={() => setExportAsyncPopup(false)}
          >
            {t('modal_export_async_popup.action')}
          </Button>
        </Link>
      </DialogContent>
    </Dialog>
  )
}

export default ExportAsyncPopup
