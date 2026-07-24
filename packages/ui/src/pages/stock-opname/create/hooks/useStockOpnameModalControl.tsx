import { ReactNode, useState } from "react"
import { TFunction } from "i18next"

import { CreateStockOpnameBody } from "../types"
import { ValueChange } from "../types/form-types"
import { ButtonColor, ButtonVariant } from "#components/button"

type Props = {
  t: TFunction<['common', 'stockOpnameCreate']>
}
export const useStockOpnameModalControl = ({ t }: Props) => {
  const [modalConfirmation, setModalConfirmation] = useState<{
    open: boolean,
    message: ReactNode,
    payload: CreateStockOpnameBody | ValueChange | null,
    type?: 'confirmation' | 'warning'
    buttonProps?: {
      cancel: { variant?: ButtonVariant, color?: ButtonColor }
      submit: { variant?: ButtonVariant, color?: ButtonColor }
    },
    callback?: () => void
  }>({
    open: false,
    message: '',
    payload: null,
  })
  const [openModalReset, setOpenModalReset] = useState(false)

  const handleShowWarningChange = (value: ValueChange, callback?: () => void) => {
    const message = t('stockOpnameCreate:form.detail.warning_changes', { returnObjects: true })
    setModalConfirmation({
      open: true,
      message: (
        <div className="ui-flex ui-justify-center ui-items-center ui-flex-col ui-gap-4">
          <p className="ui-text-base ui-text-neutral-500 ui-font-normal">{message[0]}</p>
          <p className="ui-text-base ui-text-primary-800 ui-font-medium">{message[1]}</p>
        </div>
      ),
      payload: value,
      type: 'warning',
      buttonProps: {
        cancel: { variant: 'outline' },
        submit: { variant: undefined, color: 'danger' },
      },
      callback,
    })
  }

  const handleCloseConfirmation = () => setModalConfirmation({
    message: '', open: false, payload: null
  })

  return {
    modalConfirmation,
    setModalConfirmation,
    openModalReset,
    setOpenModalReset,
    handleShowWarningChange,
    handleCloseConfirmation,
  }
}