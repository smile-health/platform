import React, { FC, useContext, useEffect } from 'react'
import { Button } from '#components/button'
import { DialogContent, DialogFooter } from '#components/dialog'
import {
  FormControl,
  FormErrorMessage,
  FormLabel,
} from '#components/form-control'
import ChainIcon from '#components/icons/ChainIcon'
import { Input } from '#components/input'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { useTicketingSystemUpdateSlipLink } from '../hooks/useTicketingSystemUpdateSlipLink'
import TicketingSystemDetailContext from '../libs/ticketing-system-detail.context'

import 'dayjs/locale/id'
import 'dayjs/locale/en'

type TicketingSystemPackingSlipFormDialogProps = {
  onClose: () => void
}

const TicketingSystemPackingSlipFormDialogContentInput: FC<
  TicketingSystemPackingSlipFormDialogProps
> = ({ onClose }) => {
  const {
    t,
    i18n: { language },
  } = useTranslation(['ticketingSystemDetail', 'common'])
  const { detail } = useContext(TicketingSystemDetailContext)
  const {
    mutate: updateSlipLink,
    isPending: isPendingUpdateSlipLink,
    isError,
  } = useTicketingSystemUpdateSlipLink(t, language)
  const {
    handleSubmit,
    formState: { errors: errorForms },
    setValue,
    register,
    watch,
  } = useForm<{
    slip_link: string
  }>({
    defaultValues: {
      slip_link: detail?.slip_link ?? '',
    },
  })
  const handleSave = (value: { slip_link: string }) => {
    updateSlipLink(value.slip_link)
    onClose()
  }

  const handleClose = () => {
    setValue('slip_link', detail?.slip_link ?? '')
    onClose()
  }

  useEffect(() => {
    if (isError) {
      setValue('slip_link', detail?.slip_link ?? '')
    }
  }, [isError, detail?.slip_link, setValue, onClose])

  useSetLoadingPopupStore(isPendingUpdateSlipLink)
  return (
    <form onSubmit={handleSubmit(handleSave)}>
      <DialogContent className="ui-overflow-auto ui-my-2 ui-py-2 ui-scroll-pr-2">
        <FormControl className="ui-my-4">
          <FormLabel className="ui-text-sm" required>
            {t('ticketingSystemDetail:float_bar.panging_slip_link')}
          </FormLabel>
          <Input
            {...register('slip_link', {
              required: t('common:validation.required'),
            })}
            defaultValue={detail?.slip_link ?? ''}
            value={watch('slip_link') ?? ''}
            onChange={(e) => setValue('slip_link', e.target.value)}
            leftIcon={<ChainIcon />}
          />
          <FormErrorMessage>{errorForms?.slip_link?.message}</FormErrorMessage>
        </FormControl>
      </DialogContent>
      <div className="ui-h-1 ui-border-t ui-border-neutral-300" />
      <DialogFooter className="ui-w-full ui-flex ui-justify-between ui-items-center ui-py-6 ui-gap-3">
        <Button
          color="primary"
          variant="outline"
          className="ui-w-full"
          type="button"
          onClick={handleClose}
        >
          {t('common:cancel')}
        </Button>
        <Button variant="solid" type="submit" className="ui-w-full">
          {t('common:save')}
        </Button>
      </DialogFooter>
    </form>
  )
}

export default TicketingSystemPackingSlipFormDialogContentInput
