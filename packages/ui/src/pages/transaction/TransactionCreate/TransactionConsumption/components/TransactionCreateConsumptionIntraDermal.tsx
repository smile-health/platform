import React from 'react'
import { Button } from '#components/button'
import { DialogContent } from '#components/dialog'
import Plus from '#components/icons/Plus'
import Trash from '#components/icons/Trash'
import { useTranslation } from 'react-i18next'

import { useTransactionCreateConsumptionPatientIdentity } from '../hooks/useTransactionCreateConsumptionPatientIdentity'
import { PatientIdentityFrom } from '../transaction-consumption.type'
import ButtonPatient from './ButtonPatient'
import TransactionCreateConsumptionFormInputPatient from './TransactionCreateConsumptionFormInputPatient'

const TransactionCreateConsumptionIntraDermal = ({
  item,
  setValueBatch,
  indexItem,
  methods,
  indexParent,
}: PatientIdentityFrom) => {
  const { t } = useTranslation('transactionCreateConsumption')
  const {
    selectedIndex,
    addNewPatient,
    removePatient,
    setSelectedIndex,
    isDisabledAddPatient,
  } = useTransactionCreateConsumptionPatientIdentity({
    item,
    setValueBatch,
    indexItem,
    indexParent,
  })

  const {
    watch,
    setValue,
    formState: { errors },
    clearErrors,
  } = methods
  const { data } = watch()
  return (
    <DialogContent className="!ui-p-0">
      <div className="ui-flex ui-flex-row ui-space-x-5 ui-p-5">
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
      <div className="ui-flex ui-flex-row ui-border-t ui-border-[#D2D2D2]">
        <div className="ui-w-56 ui-border-r ui-border-[#D2D2D2]">
          <div className="ui-flex ui-flex-col">
            {data?.map((item, index) => (
              <div
                className="ui-flex ui-justify-between"
                key={`${item.vaccination.patient_id}-${index.toString()}`}
              >
                <ButtonPatient
                  id={`choose-patient-${item.vaccination.patient_id}-${index + 1}`}
                  isActive={selectedIndex === index}
                  onClick={() => setSelectedIndex(index)}
                  isError={!!errors?.data?.[index]}
                >
                  {t('patient_identity.patient', { counter: index + 1 })}
                </ButtonPatient>
                {index !== 0 ? (
                  <button
                    id={`btn-delete ${item.vaccination.patient_id}-${index.toString()}`}
                    className="ui-text-dark-teal ui-pr-3"
                    type="button"
                    onClick={() => {
                      setValue('data', removePatient(index, data))
                      clearErrors('data')
                    }}
                  >
                    <span>
                      <Trash className="ui-w-3"></Trash>
                    </span>
                  </button>
                ) : null}
              </div>
            ))}
            {data.length < 5 ? (
              <Button
                variant="subtle"
                className="ui-mt-5 ui-pl-2"
                type="button"
                onClick={() => setValue('data', addNewPatient(data))}
                id={`add-new-patient-batch-${indexItem}`}
                disabled={isDisabledAddPatient(data)}
              >
                <div className="ui-text-dark-teal ui-flex ui-flex-row ui-space-x-1 ui-place-items-center">
                  <span>
                    <Plus></Plus>
                  </span>
                  <div>{t('patient_identity.add_new_patient')}</div>
                </div>
              </Button>
            ) : null}
          </div>
        </div>
        <div
          className="ui-w-full ui-p-5"
          style={{ backgroundColor: '#FAFAFA' }}
        >
          <TransactionCreateConsumptionFormInputPatient />
        </div>
      </div>
    </DialogContent>
  )
}

export default TransactionCreateConsumptionIntraDermal
