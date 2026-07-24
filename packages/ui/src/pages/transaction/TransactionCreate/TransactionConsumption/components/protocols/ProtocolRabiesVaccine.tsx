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
import cx from '#lib/cx'
import { Controller } from 'react-hook-form'

import { ProtocolContext } from '../../context/ProtocolContext'
import { useProtocolRabiesVaccine } from '../../hooks/useProtocolRabiesVaccine'
import { IDENTITY_TYPE } from '../../transaction-consumption.constant'
import RecordVaccinePatientExists from '../RecordVaccinePatientExists'
import TransactionCreateConsumptionWarningPopup from '../TransactionCreateConsumptionWarningPopup'

const ProtocolRabiesVaccine: React.FC = () => {
  const { historyVaccination, methods, isVaccine, indexItem, index } =
    useContext(ProtocolContext)

  const {
    t,
    setValue,
    handleChangeType,
    handleChangeMethod,
    setTextVacinationDataHistory,
    isNeedToHideField,
    handleSearchPatient,
    handleChangePatientId,
    handleChangeSequence,
    optionsType,
    optionsMethod,
    optionsSequence,
    vaccineTypeFirstPatient,
    isNeedToHideSequence,
    dataVaccination,
    warningSkipSequence,
    setWarningSkipSequence,
  } = useProtocolRabiesVaccine({
    historyVaccination,
    index,
    methods,
  })

  const { watch, control, clearErrors } = methods
  const vaccination = watch(`data.${index}.vaccination`)
  const shouldShowFieldsVaccination =
    historyVaccination !== undefined && isVaccine

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
        key={`identity-type-${indexItem}-${index}`}
        control={control}
        name={`data.${index}.vaccination.identity_type`}
        render={({
          field: { value, onChange, ...field },
          fieldState: { error },
        }) => (
          <FormControl>
            <FormLabel required>
              {t('patient_identity.identity_type.label')}
            </FormLabel>
            <ReactSelect
              {...field}
              options={IDENTITY_TYPE(t)}
              value={value}
              placeholder={t('patient_identity.identity_type.placeholder')}
              onChange={(option) => {
                onChange(option)
                setValue(`data.${index}.vaccination.patient_id`, null)
                clearErrors(`data.${index}.vaccination.patient_id`)
                handleChangePatientId()
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
                error={
                  !!error?.message || dataVaccination?.is_valid_patient === 0
                }
                onChange={(e) => {
                  onChange(e.target.value.toUpperCase())
                  handleChangePatientId()
                }}
                className="ui-rounded-r-none"
                disabled={!vaccination?.identity_type}
              />
              <ButtonIcon
                variant="outline"
                onClick={() => handleSearchPatient()}
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
            {index > 0 && (
              <p
                className={cx('ui-text-sm ui-font-normal ui-text-neutral-500', {
                  'ui-text-danger-500': dataVaccination?.is_valid_patient === 0,
                })}
              >
                {t('patient_identity.warning_unmatch_method', {
                  type: vaccineTypeFirstPatient,
                })}
              </p>
            )}
          </FormControl>
        )}
      />

      {shouldShowFieldsVaccination && (
        <Fragment>
          {!!historyVaccination && (
            <RecordVaccinePatientExists
              patient_no={vaccination.patient_id ?? ''}
              history={setTextVacinationDataHistory()}
              isRabies={true}
            />
          )}

          <Controller
            key={`vaccine-type-${indexItem}-${index}`}
            control={control}
            name={`data.${index}.vaccination.vaccine_type`}
            render={({
              field: { value, onChange, ...field },
              fieldState: { error },
            }) => (
              <FormControl
                className={cx({
                  'ui-hidden': isNeedToHideField(),
                })}
              >
                <FormLabel required>
                  {t('table.column.vaccine_type.label')}
                </FormLabel>

                <ReactSelect
                  {...field}
                  value={value}
                  id={`select-vaccine-type-${indexItem}-${index}`}
                  menuPlacement="bottom"
                  placeholder={t('table.column.vaccine_type.placeholder')}
                  options={optionsType}
                  onChange={(option) => {
                    onChange(option)
                    handleChangeType()
                  }}
                  error={!!error?.message}
                  isClearable
                />
                {error?.message && (
                  <FormErrorMessage>{error?.message}</FormErrorMessage>
                )}
              </FormControl>
            )}
          />
          <Controller
            key={`vaccine-method-${indexItem}-${index}`}
            control={control}
            name={`data.${index}.vaccination.vaccine_method`}
            render={({
              field: { value, onChange, ...field },
              fieldState: { error },
            }) => (
              <FormControl
                className={cx({
                  'ui-hidden': isNeedToHideField(),
                })}
              >
                <FormLabel required>{t('table.column.method.label')}</FormLabel>

                <ReactSelect
                  {...field}
                  value={value}
                  disabled={!vaccination?.vaccine_type}
                  id={`select-vaccine-method-${indexItem}-${index}`}
                  menuPlacement="bottom"
                  placeholder={t('table.column.method.placeholder')}
                  options={optionsMethod}
                  onChange={(option) => {
                    onChange(option)
                    handleChangeMethod()
                  }}
                  menuPosition="fixed"
                  error={!!error?.message}
                  isClearable
                />
                {error?.message && (
                  <FormErrorMessage>{error?.message}</FormErrorMessage>
                )}
              </FormControl>
            )}
          />

          <Controller
            key={`vaccine-sequence-${indexItem}-${index}`}
            control={control}
            name={`data.${index}.vaccination.vaccine_sequence`}
            render={({
              field: { value, onChange, ...field },
              fieldState: { error },
            }) => (
              <FormControl
                className={cx({
                  'ui-hidden': isNeedToHideSequence,
                })}
              >
                <FormLabel required>
                  {t('patient_identity.vaccination_sequence.label')}
                </FormLabel>

                <ReactSelect
                  {...field}
                  disabled={!vaccination?.vaccine_method}
                  id={`vaccine-sequence-${indexItem}-${index}`}
                  options={optionsSequence}
                  value={value}
                  placeholder={t(
                    'patient_identity.vaccination_sequence.placeholder'
                  )}
                  onChange={(option) => {
                    onChange(option)
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
        </Fragment>
      )}
    </Fragment>
  )
}

export default ProtocolRabiesVaccine
