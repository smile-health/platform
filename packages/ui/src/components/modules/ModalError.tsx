'use client'

import { Button } from '#components/button'
import {
  Dialog,
  DialogCloseButton,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from '#components/dialog'
import Warning from '#components/icons/Warning'
import { Trans, useTranslation } from 'react-i18next'

type ModalErrorProps = {
  errors?: { [key: string]: string[] } | null
  open?: boolean
  handleClose?: () => void
}

const ModalError: React.FC<ModalErrorProps> = (props) => {
  const { t } = useTranslation('common')
  const { errors, open, handleClose } = props || {}

  const currentErrors = errors ? Object.entries(errors) : []

  return (
    <Dialog open={open} onOpenChange={handleClose} modal>
      <DialogCloseButton />
      <DialogHeader className="ui-text-center ui-text-xl">
        <div className="ui-w-12 ui-h-12 ui-rounded-full ui-bg-[#FEE2E2] ui-flex ui-justify-center ui-items-center">
          <Warning className="ui-w-5 ui-h-5 ui-text-red-500" />
        </div>
      </DialogHeader>
      <DialogContent>
        <div className="ui-space-y-4">
          <div className="ui-space-y-2">
            <h6 className="ui-text-red-500 ui-text-xl ui-font-medium">
              <Trans i18nKey="modal_import_error.title">
                {{ total: currentErrors.length }}
              </Trans>
            </h6>
            <p className="ui-text-neutral-500 ui-text-base ui-font-normal">
              {t('modal_import_error.description')}
            </p>
          </div>
          <div className="ui-space-y-5 ui-max-h-48 ui-overflow-y-auto">
            {currentErrors.map((x, index) => (
              <div key={`modal-import-error-${x[0]}`}>
                <p className="ui-text-dark-blue ui-text-base ui-font-bold">
                  <Trans i18nKey="modal_import_error.list.title">
                    {{ row: x[0] }}
                  </Trans>
                </p>
                {x[1].map((y) => (
                  <p key={`modal-import-error-${index}-${y}`} className="ui-text-dark-blue ui-text-base ui-font-medium">
                    {y}
                  </p>
                ))}
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
      <DialogFooter className="ui-justify-center">
        <Button
          id="btn-close-modal-error"
          variant="outline"
          className="ui-w-full"
          onClick={handleClose}
        >
          {t('close')}
        </Button>
      </DialogFooter>
    </Dialog>
  )
}

export default ModalError
