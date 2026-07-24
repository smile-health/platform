import React, { FC, useContext } from 'react'
import { Dialog, DialogCloseButton, DialogHeader } from '#components/dialog'
import { TicketingSystemStatusEnum } from '#pages/ticketing-system/ticketing-system.constant'
import { useTranslation } from 'react-i18next'

import TicketingSystemDetailContext from '../libs/ticketing-system-detail.context'
import TicketingSystemPackingSlipFormDialogContentInput from './TicketingSystemPackingSlipFormDialogContentInput'
import TicketingSystemPackingSlipFormDialogContentView from './TicketingSystemPackingSlipFormDialogContentView'

type TicketingSystemPackingSlipFormDialogProps = {
  modalOpened?: string | null
  onClose: () => void
  title: string
}

const TicketingSystemPackingSlipFormDialog: FC<
  TicketingSystemPackingSlipFormDialogProps
> = ({ modalOpened, onClose, title }) => {
  const { t } = useTranslation(['ticketingSystemDetail', 'common'])
  const { detail } = useContext(TicketingSystemDetailContext)

  return (
    <Dialog
      open={modalOpened === 'slip_link'}
      size="lg"
      className="z-10"
      classNameOverlay="z-10"
    >
      <DialogHeader className="ui-my-2">
        <DialogCloseButton onClick={onClose} />
        <h3 className="ui-text-center ui-text-xl ui-font-medium">
          {t('ticketingSystemDetail:float_bar.button_packing_slip', {
            addEdit: title,
          })}
        </h3>
      </DialogHeader>
      <div className="ui-h-1 ui-border-t ui-border-neutral-300" />
      {detail?.status_id === TicketingSystemStatusEnum.ReviewedByHelpDesk ? (
        <TicketingSystemPackingSlipFormDialogContentInput onClose={onClose} />
      ) : (
        <TicketingSystemPackingSlipFormDialogContentView />
      )}
    </Dialog>
  )
}

export default TicketingSystemPackingSlipFormDialog
