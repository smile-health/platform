import React, { Fragment } from "react"
import { useTranslation } from "react-i18next"

import { CreateTransactionConsumptionPatient } from "../../transaction-consumption.type"

type Props = {
  item: CreateTransactionConsumptionPatient
  buttonEdit?: React.ReactNode
}

const PreviewPatiensDengue: React.FC<Props> = (props) => {
  const { item, buttonEdit } = props
  const { t } = useTranslation('transactionCreateConsumption')
  const { t: tCommon } = useTranslation('common')

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

      <div className="ui-flex ui-flex-col ui-gap-1">
        <div>
          {t('table.content.dengue.history')}: {item.history_medical?.dengue_received_vaccine ? tCommon('yes') : tCommon('no')}
        </div>
        <div>
          {t('patient_identity.sequence')} : {item.vaccination?.vaccine_sequence?.label ?? '-'}
        </div>
        <div>
          {t('table.content.dengue.reaction', { returnObjects: true })[item.vaccination.reaction_id?.value === 4 ? 1 : 0]}
          : {item.vaccination.reaction_id?.value === 4 ? item.vaccination.other_reaction : item.vaccination.reaction_id?.label ?? '-'}
        </div>
      </div>

      {buttonEdit}
    </Fragment>
  )
}

export default PreviewPatiensDengue