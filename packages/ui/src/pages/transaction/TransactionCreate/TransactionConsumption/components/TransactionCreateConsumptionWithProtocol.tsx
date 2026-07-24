import React, { Fragment, useMemo } from 'react'
import { Button } from '#components/button'
import { DialogContent } from '#components/dialog'
import Plus from '#components/icons/Plus'
import Trash from '#components/icons/Trash'

import { CreateTransactionBatch, CreateTransactionChild, FormDataPatient } from '../transaction-consumption.type'
import ButtonPatient from './ButtonPatient'
import TransactionCreateConsumptionFormInputPatient from './TransactionCreateConsumptionFormInputPatient'
import { UseFormReturn, UseFormSetValue } from 'react-hook-form'
import TransactionCreateConsumptionFormInputIdentityPatient from './TransactionCreateConsumptionFormInputIdentityPatient'
import { VACCINE_METHOD } from '../transaction-consumption.constant'
import { ProtocolContext } from '../context/ProtocolContext'
import { useTransactionCreateConsumptionWithProtocol } from '../hooks/useTransactionCreateConsumptionWithProtocol'
import TransactionCreateConsumptionFormInputDiseaseHistory from './TransactionCreateConsumptionFormInputDiseaseHistory'
import cx from '#lib/cx'
import CheckV2 from '#components/icons/CheckV2'

type Props = {
  item: CreateTransactionBatch
  setValueBatch: UseFormSetValue<CreateTransactionChild>
  indexItem: number
  indexParent: number
  methods: UseFormReturn<FormDataPatient>
}

const styleProtocol = {
  container: 'ui-py-1 ui-px-2 ui-bg-[#E2E8F0] ui-rounded-3xl',
  content: 'ui-flex ui-items-center ui-text-sm ui-font-medium ui-text-[#CBD5E1]'
}

const TransactionCreateConsumptionWithProtocol: React.FC<Props> = (props) => {
  const { indexItem, indexParent, item, setValueBatch, methods } = props

  const {
    watch,
    setValue,
    formState: { errors },
    clearErrors,
    trigger,
  } = methods
  const { data } = watch()

  const {
    t,
    selectedIndex,
    addNewPatient,
    removePatient,
    setSelectedIndex,
    isDisabledAddPatient,
    validateFormVaccine,
    validateFormIdentity,
    validateFormDiseasesHistory,
  } = useTransactionCreateConsumptionWithProtocol({
    item,
    setValueBatch,
    indexItem,
    indexParent,
    data,
    errors,
    protocol: item.protocol_id || 0,
  })
  const { history_vaccination, vaccination } = data[selectedIndex] || {}
  const { vaccination: { vaccine_method } } = data[0]

  const contextValue = useMemo(() => ({
    isNeedSequence: !!item.is_need_sequence,
    isVaccine: !!item.is_vaccine,
    protocolId: item.protocol_id || 0,
    historyVaccination: history_vaccination,
    isMultiPatient: vaccine_method?.value === VACCINE_METHOD.INTRA_DERMAL,
    methods: methods,
    index: selectedIndex,
    indexItem: indexItem,
  }), [
    item.is_need_sequence,
    item.is_vaccine,
    item.protocol_id,
    vaccine_method,
    selectedIndex,
    methods,
    indexItem,
    history_vaccination,
  ])

  const shouldShowPatientForm = !!item.is_vaccine && history_vaccination !== undefined && !!vaccination?.is_valid_patient
  const shouldShowKipiForm = !!item.is_kipi && history_vaccination !== undefined && !!vaccination?.is_valid_patient

  return (
    <DialogContent className="!ui-p-0">
      <div className="ui-flex ui-flex-row ui-border-t ui-border-[#D2D2D2]">
        <div className="ui-w-56 ui-border-r ui-border-[#D2D2D2]">
          <div className="ui-flex ui-flex-col">
            {data?.map((item, index) => (
              <div
                className={cx("ui-flex ui-justify-between", {
                  'ui-bg-[#FEE2E2]': !!errors?.data?.[index] && selectedIndex !== index
                })}
                key={`${item.vaccination.patient_id}-${index.toString()}`}
              >
                <ButtonPatient
                  id={`choose-patient-${item.vaccination.patient_id}-${index + 1}`}
                  isActive={selectedIndex === index}
                  onClick={() => {
                    setSelectedIndex(index)
                  }}
                  isError={!!errors?.data?.[index]}
                  hideIcon
                >
                  {t('patient_identity.patient', { counter: index + 1 })}
                </ButtonPatient>
                {index !== 0 ? (
                  <button
                    id={`btn-delete ${item.vaccination.patient_id}-${index.toString()}`}
                    className={cx("ui-text-dark-teal ui-pr-3", {
                      'ui-text-danger-500': !!errors?.data?.[index] && selectedIndex !== index
                    })}
                    type="button"
                    onClick={() => {
                      setValue('data', removePatient(index, data))
                      trigger('data')
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
            {data[0]?.vaccination?.vaccine_method?.value === VACCINE_METHOD.INTRA_DERMAL && data.length < 5 ? (
              <Button
                variant="subtle"
                className="ui-mt-5 ui-pl-2"
                type="button"
                onClick={() => {
                  setValue('data', addNewPatient(data))
                }}
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
          className="ui-w-full ui-p-0"
          style={{ backgroundColor: '#FAFAFA' }}
        >
          <ProtocolContext.Provider value={contextValue}>
            <div className='ui-p-5 ui-space-y-5'>
              <h6 className="ui-text-primary-800 ui-text-base ui-font-bold">
                {t('patient_identity.tab', { returnObjects: true })[0]}
              </h6>
              <TransactionCreateConsumptionFormInputPatient 
                isValidPatient={!!vaccination?.is_valid_patient}
              />

              {shouldShowPatientForm && (
                <Fragment>
                  <h6 className="ui-text-primary-800 ui-text-base ui-font-bold">
                    {t('patient_identity.tab', { returnObjects: true })[1]}
                  </h6>
                  <TransactionCreateConsumptionFormInputIdentityPatient />
                </Fragment>
              )}

              {shouldShowKipiForm && (
                <Fragment>
                  <h6 className="ui-text-primary-800 ui-text-base ui-font-bold">
                    {t('patient_identity.tab', { returnObjects: true })[2]}
                  </h6>
                  <TransactionCreateConsumptionFormInputDiseaseHistory />
                </Fragment>
              )}
            </div>
          </ProtocolContext.Provider>

          <div className="ui-sticky ui-bottom-0 ui-bg-[#F1F5F9] ui-border-t ui-p-3 ui-flex ui-justify-between ui-items-center">
            <p className='ui-text-sm ui-font-normal ui-text-neutral-500'>
              {t('patient_identity.form_completion')}
            </p>
            <div className="ui-flex ui-gap-1 ui-items-center">
              <div className={cx(styleProtocol.container, { 'ui-bg-[#15803D]': validateFormVaccine() })}>
                <p className={cx(styleProtocol.content, { 'ui-text-white': validateFormVaccine() })}>
                  {t('patient_identity.tab', { returnObjects: true })[0]}
                  <span className='ui-ml-1'><CheckV2 /></span>
                </p>
              </div>
              {!!item.is_vaccine && (
                <div className={cx(styleProtocol.container, { 'ui-bg-[#15803D]': validateFormIdentity() })}>
                  <p className={cx(styleProtocol.content, { 'ui-text-white': validateFormIdentity() })}>
                    {t('patient_identity.tab', { returnObjects: true })[1]}
                    <span className='ui-ml-1'><CheckV2 /></span>
                  </p>
                </div>
              )}
              {!!item.is_kipi && (
                <div className={cx(styleProtocol.container, { 'ui-bg-[#15803D]': validateFormDiseasesHistory() })}>
                  <p className={cx(styleProtocol.content, { 'ui-text-white': validateFormDiseasesHistory() })}>
                    {t('patient_identity.tab', { returnObjects: true })[2]}
                    <span className='ui-ml-1'><CheckV2 /></span>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DialogContent>
  )
}

export default TransactionCreateConsumptionWithProtocol
