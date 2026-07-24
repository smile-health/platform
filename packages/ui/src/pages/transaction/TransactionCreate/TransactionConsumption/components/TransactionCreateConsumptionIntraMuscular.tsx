import React from 'react'
import { DialogContent } from '#components/dialog'
import { useTranslation } from 'react-i18next'

import { useTransactionCreateConsumptionPatientIdentity } from '../hooks/useTransactionCreateConsumptionPatientIdentity'
import { PatientIdentityFrom } from '../transaction-consumption.type'
import TransactionCreateConsumptionFormInputPatient from './TransactionCreateConsumptionFormInputPatient'

const TransactionCreateConsumptionIntraMuscular = ({
  item,
  setValueBatch,
  indexItem,
  methods,
  indexParent,
}: PatientIdentityFrom) => {
  const { t } = useTranslation('transactionCreateConsumption')
  const { selectedIndex } =
    useTransactionCreateConsumptionPatientIdentity({
      item,
      setValueBatch,
      indexItem,
      indexParent,
    })
  return (
    <DialogContent>
      <div className="ui-flex ui-flex-row ui-mb-5">
        <div>
          <div className="ui-text-neutral-500 ui-text-sm">
            {t('table.column.vaccine_type.label')}
          </div>
          <div className="ui-text-dark-blue ui-font-bold">
            {item?.vaccine_type?.label ?? '-'}
          </div>
        </div>
        <div>
          <div className="ui-text-neutral-500 ui-text-sm">
            {t('table.column.method.label')}
          </div>
          <div className="ui-text-dark-blue ui-font-bold">
            {item?.vaccine_method?.label ?? '-'}
          </div>
        </div>
      </div>
      <TransactionCreateConsumptionFormInputPatient
        methods={methods}
        index={selectedIndex}
        indexItem={indexItem}
        // vaccineMethod={vaccineMethod}
      />
    </DialogContent>
  )
}

export default TransactionCreateConsumptionIntraMuscular
