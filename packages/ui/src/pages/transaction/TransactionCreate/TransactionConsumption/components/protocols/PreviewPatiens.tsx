import React, { Fragment } from "react"
import { useTranslation } from "react-i18next"

import { CreateTransactionConsumptionPatient } from "../../transaction-consumption.type"

type Props = {
  item: CreateTransactionConsumptionPatient
  buttonEdit?: React.ReactNode
}

const PreviewPatiens: React.FC<Props> = (props) => {
  const { item, buttonEdit } = props
  const { t } = useTranslation('transactionCreateConsumption')

  return (
    <Fragment>
      <div className="ui-flex ui-flex-col ui-gap-1">
        <div>
          {item.vaccination.identity_type?.label} : {item.vaccination?.patient_id ?? '-'}
        </div>
        <div>
          {t('table.content.dengue.gender')} : {item.identity.gender?.label ?? '-'}
        </div>
        <div>
          {t('table.content.dengue.birthdate')} : {item.identity.birth_date ?? '-'}
        </div>
        <div>
          {t('patient_identity.phone_number')} :{' '}
          {item.identity?.phone_number ?? '-'}
        </div>
      </div>

      {buttonEdit}
    </Fragment>
  )
}

export default PreviewPatiens