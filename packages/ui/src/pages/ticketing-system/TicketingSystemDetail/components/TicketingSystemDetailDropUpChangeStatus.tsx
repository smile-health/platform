import React, { FC, useContext } from 'react'
import { Button } from '#components/button'
import { ButtonIcon } from '#components/button-icon'
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRoot,
  DropdownMenuTrigger,
} from '#components/dropdown-menu'
import ChevronLeft from '#components/icons/ChevronLeft'
import { TicketingSystemStatusEnum } from '#pages/ticketing-system/ticketing-system.constant'

import TicketingSystemDetailChangeStatusContext from '../libs/ticketing-system-change-status.context'
import TicketingSystemDetailContext from '../libs/ticketing-system-detail.context'

type TicketingSystemDetailDropUpChangeStatusProps = {
  positiveButton?: {
    id: number
    status_label: string
  } | null
}

const TicketingSystemDetailDropUpChangeStatus: FC<
  TicketingSystemDetailDropUpChangeStatusProps
> = ({ positiveButton }) => {
  const { detail } = useContext(TicketingSystemDetailContext)
  const { setModalStatusData } = useContext(
    TicketingSystemDetailChangeStatusContext
  )

  const followUpOptions =
    detail?.follow_up_status?.filter(
      (status: { id: number }) =>
        status.id !== TicketingSystemStatusEnum.ReportCancelled &&
        status.id !== positiveButton?.id
    ) || []

  if (followUpOptions.length === 0) {
    return null
  }

  if (
    !detail?.slip_link &&
    detail?.status_id !== TicketingSystemStatusEnum.Submitted
  )
    return (
      <ButtonIcon
        variant="solid"
        type="button"
        className="ui-h-10 ui-w-10 ui-p-2 opener"
        disabled
      >
        <ChevronLeft className="ui-w-5 ui-h-5 ui-transform ui-rotate-90" />
      </ButtonIcon>
    )

  return (
    <>
      <DropdownMenuRoot>
        <DropdownMenuTrigger>
          <ButtonIcon
            variant="solid"
            type="button"
            className="ui-h-10 ui-w-10 opener"
          >
            <ChevronLeft className="ui-transform ui-rotate-90" />
          </ButtonIcon>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          id="change__status__ticket__transporter__dropdown"
          side="top"
          sideOffset={8}
          align="end"
        >
          {followUpOptions?.map((status) => (
            <DropdownMenuItem key={status.id}>
              <Button
                variant="subtle"
                className="ui-w-full ui-justify-start hover:!ui-bg-transparent"
                type="button"
                onClick={() => {
                  setModalStatusData({
                    id: status.id,
                    status_label: status.status_label,
                  })
                }}
              >
                {status?.status_label}
              </Button>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenuRoot>
      <style>{`
        #change__status__ticket__transporter__dropdown > div {
          padding: 0;
        }
        #change__status__ticket__transporter__dropdown > button {
          padding: 0;
        }
      `}</style>
    </>
  )
}

export default TicketingSystemDetailDropUpChangeStatus
