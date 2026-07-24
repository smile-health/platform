import React, { Fragment, useContext } from 'react'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { ButtonGroup } from '#components/button'
import { ButtonIcon } from '#components/button-icon'
import {
  FormControl,
  FormErrorMessage,
  FormLabel,
} from '#components/form-control'
import { Input } from '#components/input'
import { OptionType, ReactSelect } from '#components/react-select'
import { Controller } from 'react-hook-form'

import { ProtocolContext } from '../../context/ProtocolContext'
import { useProtocolDengueVaccine } from '../../hooks/useProtocolDengueVaccine'
import RecordVaccinePatientExists from '../RecordVaccinePatientExists'
import TransactionCreateConsumptionFormInputKipi from '../TransactionCreateConsumptionFormInputKipi'
import TransactionCreateConsumptionWarningPopup from '../TransactionCreateConsumptionWarningPopup'

const ProtocolDengueVaccine: React.FC = () => {
  const { historyVaccination, methods, index, indexItem } =
    useContext(ProtocolContext)
  const {
    t,
    control,
    watch,
    handleSearchPatient,
    handleChangePatientId,
    setTextVacinationDataHistory,
    memoizedOptionsDengueSequence,
    handleChangeSequence,
    warningSkipSequence,
    setWarningSkipSequence,
  } = useProtocolDengueVaccine({
    historyVaccination,
    index,
    methods,
  })

  const patiendId = watch(`data.${index}.vaccination.patient_id`)
  const shouldShowSequence = historyVaccination !== undefined

  return (
    <Fragment>
      <TransactionCreateConsumptionWarningPopup
        open={warningSkipSequence.open}
        description={warningSkipSequence.description}
        handleSubmit={warningSkipSequence.callback}
        handleClose={() =>
          setWarningSkipSequence({
            open: false,
            description: '',
            callback: () => {},
          })
        }
      />

      <Controller
        key={`patient-id-${indexItem}-${index}`}
        control={control}
        name={`data.${index}.vaccination.patient_id`}
        render={({
          field: { value, onChange, ...field },
          fieldState: { error },
        }) => (
          <FormControl>
            <FormLabel required>
              {t('patient_identity.patient_id.label')}
            </FormLabel>
            <ButtonGroup>
              <Input
                {...field}
                id={`patient-id-${indexItem}-${index}`}
                placeholder={t('patient_identity.patient_id.placeholder')}
                value={value ?? ''}
                type="text"
                error={!!error?.message}
                onChange={(e) => {
                  onChange(e.target.value.toUpperCase())
                  handleChangePatientId()
                }}
                className="ui-rounded-r-none"
              />
              <ButtonIcon
                variant="outline"
                onClick={() => handleSearchPatient(true)}
                aria-label="search-patient"
                size="lg"
                className="ui-border-[#D4D4D4] ui-rounded-l-none ui-bg-[#F5F5F4] focus:ui-border-primary-500 focus:ui-outline-none focus:ui-ring-primary-500 focus:ui-ring-opacity-25"
              >
                <MagnifyingGlassIcon
                  className="ui-w-5 ui-h-5"
                  strokeWidth={2}
                />
              </ButtonIcon>
            </ButtonGroup>
            {error?.message && (
              <FormErrorMessage>{error?.message}</FormErrorMessage>
            )}
          </FormControl>
        )}
      />

      {shouldShowSequence && (
        <Fragment>
          {!!historyVaccination && (
            <RecordVaccinePatientExists
              patient_no={patiendId ?? ''}
              history={setTextVacinationDataHistory()}
              isRabies={false}
            />
          )}

          <Controller
            key={`vaccine-sequence-${indexItem}-${index}`}
            control={control}
            name={`data.${index}.vaccination.vaccine_sequence`}
            render={({
              field: { value, onChange, ...field },
              fieldState: { error },
            }) => (
              <FormControl>
                <FormLabel required>
                  {t('patient_identity.vaccination_sequence.label')}
                </FormLabel>

                <ReactSelect
                  {...field}
                  id={`vaccine-sequence-${indexItem}-${index}`}
                  options={memoizedOptionsDengueSequence}
                  value={value}
                  placeholder={t(
                    'patient_identity.vaccination_sequence.placeholder'
                  )}
                  onChange={(option) => {
                    handleChangeSequence(option as OptionType, () =>
                      onChange(option)
                    )
                  }}
                  menuPosition="fixed"
                  error={!!error?.message}
                />
                {error?.message && (
                  <FormErrorMessage>{error?.message}</FormErrorMessage>
                )}
              </FormControl>
            )}
          />

          <TransactionCreateConsumptionFormInputKipi />
        </Fragment>
      )}
    </Fragment>
  )
}

export default ProtocolDengueVaccine
