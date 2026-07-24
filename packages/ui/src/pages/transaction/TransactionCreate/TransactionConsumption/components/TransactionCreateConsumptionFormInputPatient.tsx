import React, { useContext } from 'react'

import cx from '#lib/cx'
import { VACCINE_PROTOCOL } from '../transaction-consumption.constant'
import ProtocolRabiesVaccine from './protocols/ProtocolRabiesVaccine'
import ProtocolDengueVaccine from './protocols/ProtocolDengueVaccine'
import { ProtocolContext } from '../context/ProtocolContext'
import NonProtocolVaccine from './protocols/NonProtocolVaccine'

type Props = {
  isValidPatient?: boolean
}

const TransactionCreateConsumptionFormInputPatient: React.FC<Props> = (props) => {
  const { isValidPatient } = props
  const {
    protocolId,
    historyVaccination,
  } = useContext(ProtocolContext)

  return (
    <div
      className={cx("ui-flex ui-flex-col ui-space-y-5 ui-w-full ui-min-h-52", {
        "ui-min-h-96": historyVaccination === undefined || !isValidPatient,
        "ui-min-h-max": !protocolId && historyVaccination !== undefined,
      })}
    >
      {protocolId === VACCINE_PROTOCOL.RABIES && (
        <ProtocolRabiesVaccine />
      )}

      {protocolId === VACCINE_PROTOCOL.DENGUE && (
        <ProtocolDengueVaccine />
      )}

      {!protocolId && (
        <NonProtocolVaccine />
      )}
    </div>
  )
}

export default TransactionCreateConsumptionFormInputPatient
