import { Dispatch, SetStateAction, useContext } from 'react'
import { Button } from '#components/button'
import {
  Dialog,
  DialogCloseButton,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from '#components/dialog'
import { BOOLEAN } from '#constants/common'
import useSmileRouter from '#hooks/useSmileRouter'
import { useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import PeriodOfStockTakingFormContext from '../libs/period-of-stock-taking-form.context'

type PeriodOfStockTakingSubmitAndActivateConfirmation = {
  open?: boolean
  setOpen?: Dispatch<SetStateAction<boolean>>
  onSubmit?: VoidFunction
}

export default function PeriodOfStockTakingSubmitAndActivateConfirmation({
  open,
  setOpen,
  onSubmit,
}: Readonly<PeriodOfStockTakingSubmitAndActivateConfirmation>) {
  const { t } = useTranslation(['common', 'periodOfStockTaking'])
  const { activeStockTakingData } = useContext(PeriodOfStockTakingFormContext)
  const router = useSmileRouter()
  const { action } = router.query

  const { handleSubmit } = useFormContext()
  const confirmationText =
    activeStockTakingData?.status === BOOLEAN.TRUE && action === 'edit'
      ? t('periodOfStockTaking:form.disactivating_confirmation')
      : t('periodOfStockTaking:form.activating_confirmation', {
          periodName: activeStockTakingData?.name,
        })

  return (
    <Dialog size="lg" open={open} onOpenChange={setOpen}>
      <DialogCloseButton />
      <DialogHeader className="ui-text-center ui-text-xl">
        {t('common:confirmation')}
      </DialogHeader>
      <DialogContent className="ui-space-y-4">
        <p className="ui-text-center ui-text-dark-teal">{confirmationText}</p>
      </DialogContent>
      <DialogFooter className="ui-justify-center">
        <div className="ui-grid ui-grid-cols-2 ui-gap-4 ui-w-full mx-auto">
          <Button
            id="period__so__submission__confirmation__cancel"
            variant="outline"
            type="button"
            onClick={() => setOpen?.(!open)}
          >
            {t('common:cancel')}
          </Button>
          <Button
            id="period__so__submission__confirmation"
            color="primary"
            type="button"
            onClick={handleSubmit(() => {
              onSubmit?.()
              setTimeout(() => setOpen?.(!open), 300)
            })}
          >
            {t('common:yes')}
          </Button>
        </div>
      </DialogFooter>
    </Dialog>
  )
}
