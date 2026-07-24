import React from 'react'
import { Button } from '#components/button'
import {
  Dialog,
  DialogCloseButton,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from '#components/dialog'
import {
  FormControl,
  FormErrorMessage,
  FormLabel,
} from '#components/form-control'
import { OptionType, ReactSelect } from '#components/react-select'
import { TNotification, GetNotificationConfirmationResponse } from '#types/notification'
import { useTranslation, Trans } from 'react-i18next'

import { useFinishedVaccine } from '../hooks/useFinishedVaccine'

type FinishedVaccineModalProps = {
  isOpen: boolean
  onClose: () => void
  notification: TNotification
  dataStopConfirmation?: GetNotificationConfirmationResponse
  handleNotificationRead: (notification: TNotification) => void
}

// TODO: Possibility for next enhancement
// dataStopConfirmation?.next_sequence

export default function FinishedVaccineModal({
  isOpen,
  onClose,
  notification,
  handleNotificationRead,
  dataStopConfirmation,
}: Readonly<FinishedVaccineModalProps>) {
  const { t } = useTranslation(['common', 'notification'])
  const {
    errors,
    setError,
    register,
    handleSubmit,
    stopNotification,
    setValue,
    watch,
    reset,
    reasons,
    isLoadingListReason,
  } = useFinishedVaccine(isOpen)

  const handleClose = () => {
    onClose()
    reset()
  }

  const handleStopNotification = () => {
    handleNotificationRead(notification)
    const data = {
      programId: notification.program.id,
      notification_id: notification.id,
      consumption_id: notification.data?.consumption_id ?? 0,
      reason_id: watch('reason'),
      event_code: notification.event_code,
    }

    stopNotification(data, { onSuccess: handleClose })
  }

  // For next enhancement
  // const descriptionKey = dataStopConfirmation?.next_sequence ? 'description_with_next_schedule' : 'description'

  return (
    <Dialog open={isOpen} size="md">
      <DialogCloseButton onClick={handleClose} />
      <DialogHeader className="ui-my-2">
        <h3 className="ui-text-center ui-text-xl ui-font-medium">
          {t('common:confirmation')}
        </h3>
      </DialogHeader>
      <div className="ui-h-1 ui-border-t ui-border-neutral-300" />
      <DialogContent className="ui-overflow-visible ui-my-2 ui-py-2 styled-scroll ui-scroll-pr-2">
        <p className="ui-font-normal ui-text-base ui-text-center ui-mb-5">
          <Trans
            t={t}
            // i18nKey={`notification:finishedVaccine.${descriptionKey}`}
            i18nKey="notification:finishedVaccine.description"
            values={{
              // Possibility for next enhancement
              // identityNumber: dataStopConfirmation?.identity_number ?? notification.data?.identity_number ?? '',
              // nextSchedule: dataStopConfirmation?.next_sequence ?? '',
              identityNumber: notification.data?.identity_number ?? '',
            }}
          />
        </p>
        <div className="ui-space-y-4">
          <FormControl>
            <FormLabel htmlFor="reaction-type" required>
              {t('notification:finishedVaccine.form.reason.label')}
            </FormLabel>
            <ReactSelect
              {...register('reason')}
              id="reason"
              placeholder={t(
                'notification:finishedVaccine.form.reason.placeholder'
              )}
              options={reasons || []}
              onChange={(option: OptionType) => {
                setValue('reason', option?.value)
                setError('reason', { message: '' })
              }}
              value={reasons?.find(
                (reason) => reason.value === watch('reason')
              )}
              isLoading={isLoadingListReason}
              error={!!errors?.reason?.message}
            />
            <FormErrorMessage>{errors?.reason?.message}</FormErrorMessage>
          </FormControl>
        </div>
      </DialogContent>
      <div className="ui-h-1 ui-border-t ui-border-neutral-300" />
      <DialogFooter>
        <div className="ui-grid ui-grid-cols-2 ui-gap-3 ui-w-full">
          <Button
            type="button"
            color="primary"
            variant="outline"
            onClick={handleClose}
          >
            {t('common:cancel')}
          </Button>
          <Button onClick={handleSubmit(handleStopNotification)}>
            {t('common:submit')}
          </Button>
        </div>
      </DialogFooter>
    </Dialog>
  )
}
