'use client'

import { Dispatch, SetStateAction } from 'react'
import { Button } from '#components/button'
import {
  Dialog,
  DialogCloseButton,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from '#components/dialog'
import { useTranslation } from 'react-i18next'

import { UpdateListFieldType } from '../AccountPage'

type ModalChangeHistoryProps = {
  open?: boolean
  setOpen?: Dispatch<SetStateAction<number | undefined>>
  handleClose?: () => void
  history: UpdateListFieldType[]
  historyUpdatedAt: string
}
export function ModalChangeHistory({
  open = false,
  handleClose,
  history,
  historyUpdatedAt,
}: Readonly<ModalChangeHistoryProps>) {
  const { t } = useTranslation(['account', 'common'])

  const handleOpenChange = () => {
    handleClose?.()
  }

  return (
    <Dialog size="xl" open={open} onOpenChange={handleOpenChange}>
      <DialogCloseButton />
      <DialogHeader className="ui-text-center ui-text-xl">
        {t('account:title.history_change_data')}
      </DialogHeader>
      <DialogContent>
        <div className="flex flex-col space-y-3">
          <div className="text-dark" id={`popupChangeHistoryUpdatedAt`}>
            {historyUpdatedAt}
          </div>
          {history?.map((item) => {
            return (
              <div
                className="flex flex-col space-y-1"
                key={item.label}
                id={`popupChangeHistory-${item.label}`}
              >
                <div className="text-label-dark">{item.label}</div>
                <div className="text-dark font-medium">{item.value}</div>
              </div>
            )
          })}
        </div>
      </DialogContent>
      <DialogFooter className="ui-justify-center">
        <Button
          id="btnCloseModalChangeHistory"
          variant="outline"
          className="ui-w-full"
          onClick={() => {
            handleClose?.()
          }}
        >
          {t('common:close')}
        </Button>
      </DialogFooter>
    </Dialog>
  )
}
