import { useContext, useState } from 'react'
import { useParams } from 'next/navigation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { FormControl, FormLabel } from '#components/form-control'
import { ModalConfirmation } from '#components/modules/ModalConfirmation'
import { TextArea } from '#components/text-area'
import { toast } from '#components/toast'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'
import { TicketingSystemStatusEnum } from '#pages/ticketing-system/ticketing-system.constant'
import { ErrorResponse } from '#types/common'
import { AxiosError } from 'axios'
import { Trans, useTranslation } from 'react-i18next'

import {
  updateTicketingSystemStatus,
  UpdateTicketingSystemStatusParams,
} from '../../ticketing-system.service'
import TicketingSystemDetailChangeStatusContext from '../libs/ticketing-system-change-status.context'
import TicketingSystemDetailContext from '../libs/ticketing-system-detail.context'

export default function TicketingSystemDetailUpdateStatusDialog() {
  const {
    t,
    i18n: { language },
  } = useTranslation(['ticketingSystemDetail', 'common', 'ticketingSystem'])
  const { modalStatusData, setModalStatusData } = useContext(
    TicketingSystemDetailChangeStatusContext
  )
  const { detail } = useContext(TicketingSystemDetailContext)
  const queryClient = useQueryClient()
  const params = useParams()
  const [comment, setComment] = useState('')

  const isCancel =
    modalStatusData?.id === TicketingSystemStatusEnum.ReportCancelled

  const scrollToTop = () => {
    const element = document.getElementById('__next')
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const { mutate, isPending } = useMutation({
    mutationFn: (data: UpdateTicketingSystemStatusParams) =>
      updateTicketingSystemStatus(Number(params?.id), data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['ticketing-system-detail', { id: params?.id, language }],
      })
      toast.success({
        id: 'toast-success-update-ticketing-system-status',
        description: t('ticketingSystemDetail:float_bar.successfully_updated'),
      })
      setModalStatusData(null)
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        const response = error.response?.data as ErrorResponse
        toast.danger({ description: response.message })
      }
    },
    onSettled: scrollToTop,
  })

  const handleClose = () => {
    setModalStatusData(null)
    setComment('')
  }

  const onSubmit = () => {
    const dataStatus = modalStatusData?.id as TicketingSystemStatusEnum
    if (
      !detail?.slip_link &&
      [
        TicketingSystemStatusEnum.ReportedToSupplier,
        TicketingSystemStatusEnum.ManualInput,
      ].includes(dataStatus)
    ) {
      toast.danger({
        id: 'toast-error-no-packing-slip-link',
        description: t('ticketingSystem:detail.empty_link'),
      })

      return
    }

    mutate({
      update_status_id: dataStatus,
      comment:
        dataStatus === TicketingSystemStatusEnum.ReportCancelled
          ? comment
          : null,
    })
  }

  useSetLoadingPopupStore(isPending)

  return (
    <ModalConfirmation
      open={!!modalStatusData?.id}
      onSubmit={onSubmit}
      setOpen={handleClose}
      title={isCancel ? t('ticketingSystem:detail.cancel_report') : undefined}
      description={
        <>
          {isCancel ? (
            <FormControl className="ui-text-left">
              <FormLabel>
                {t('ticketingSystem:detail.form.comment.label')}
              </FormLabel>
              <TextArea
                placeholder={t(
                  'ticketingSystem:detail.form.comment.placeholder'
                )}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </FormControl>
          ) : (
            <p>
              <Trans
                i18nKey={
                  'ticketingSystemDetail:float_bar.change_status_confirm' as any
                }
                values={{
                  newStatus: modalStatusData?.status_label,
                }}
                components={{
                  BoldText: <span className="ui-font-bold ui-text-dark-teal" />,
                }}
              />
            </p>
          )}
        </>
      }
      buttonTitle={t('common:yes')}
    />
  )
}
