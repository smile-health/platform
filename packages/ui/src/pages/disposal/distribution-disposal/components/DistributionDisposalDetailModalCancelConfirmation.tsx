import React, { useContext } from 'react'
import { Button } from '#components/button'
import {
  Dialog,
  DialogCloseButton,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from '#components/dialog'
import { FormControl, FormLabel } from '#components/form-control'
import { TextArea } from '#components/text-area'
import { useTranslation } from 'react-i18next'

import DistributionDisposalDetailContext from '../utils/distribution-disposal-detail.context'

type Props = {
  open: boolean
  handleClose: () => void
  handleSubmit: (text: string) => void
  type?: 'cancel' | 'receive'
}

const DistributionDisposalDetailModalCancelConfirmation: React.FC<Props> = (
  props
) => {
  const { open, handleClose, handleSubmit, type } = props
  const { t } = useTranslation(['common', 'distributionDisposal'])
  const { comment, setComment } = useContext(DistributionDisposalDetailContext)

  const onSubmit = () => {
    handleSubmit(comment)
    handleClose()
  }

  return (
    <Dialog size="lg" open={open} onOpenChange={handleClose}>
      <DialogCloseButton />
      <DialogHeader className="ui-text-center ui-text-xl">
        {type === 'receive'
          ? t('distributionDisposal:detail.status_confirmation_receive.title')
          : t('distributionDisposal:detail.status_confirmation.title')}
      </DialogHeader>
      <DialogContent className="ui-space-y-4">
        <div className="ui-text-center ui-text-base ui-text-neutral-500">
          {type === 'receive'
            ? t(
                'distributionDisposal:detail.status_confirmation_receive.subtitle'
              )
            : t('distributionDisposal:detail.status_confirmation.subtitle')}
        </div>
        <FormControl className="ui-space-y-2 ui-w-full">
          <FormLabel>
            {t('distributionDisposal:detail.comment.title')}
          </FormLabel>
          <TextArea
            placeholder={t('distributionDisposal:detail.comment.placeholder')}
            className="ui-min-h-[80px] ui-text-sm"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </FormControl>
      </DialogContent>
      <DialogFooter className="ui-justify-center">
        <div className="ui-grid ui-grid-cols-2 ui-gap-4 ui-w-full mx-auto">
          <Button
            id="btn-close-modal-confirmation"
            variant="outline"
            type="button"
            onClick={handleClose}
          >
            {t('cancel')}
          </Button>
          <Button
            id="btn-submit-modal-confirmation"
            color="primary"
            type="button"
            onClick={onSubmit}
          >
            {t('common:send')}
          </Button>
        </div>
      </DialogFooter>
    </Dialog>
  )
}

export default DistributionDisposalDetailModalCancelConfirmation
