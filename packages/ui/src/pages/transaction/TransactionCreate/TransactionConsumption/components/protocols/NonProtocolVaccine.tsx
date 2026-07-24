import React, { Fragment, useContext } from "react"
import { Controller } from 'react-hook-form'
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline"

import {
  FormControl,
  FormErrorMessage,
  FormLabel,
} from '#components/form-control'
import { ReactSelect } from '#components/react-select'
import { ButtonGroup } from '#components/button'
import { ButtonIcon } from '#components/button-icon'
import { Input } from '#components/input'

import { ProtocolContext } from "../../context/ProtocolContext"
import { IDENTITY_TYPE } from "../../transaction-consumption.constant"
import { useNonProtocolVaccine } from "../../hooks/useNonProtocolVaccine"

const NonProtocolVaccine: React.FC = () => {
  const {
    methods,
    indexItem,
    index,
  } = useContext(ProtocolContext)

  const {
    t,
    setValue,
    handleSearchPatient,
    handleChangePatientId,
    dataVaccination,
  } = useNonProtocolVaccine({
    index,
    methods
  })

  const { watch, control, clearErrors } = methods
  const vaccination = watch(`data.${index}.vaccination`)

  return (
    <Fragment>
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
            <FormLabel required>{t('patient_identity.patient_id.label')}</FormLabel>
            <ButtonGroup>
              <Input
                {...field}
                id={`patient-id-${indexItem}-${index}`}
                placeholder={t('patient_identity.patient_id.placeholder')}
                value={value ?? ''}
                type="text"
                error={!!error?.message || dataVaccination?.is_valid_patient === 0}
                onChange={(e) => {
                  onChange(e.target.value.toUpperCase())
                  handleChangePatientId()
                }}
                className='ui-rounded-r-none'
                disabled={!vaccination?.identity_type}
              />
              <ButtonIcon
                variant="outline"
                onClick={() => handleSearchPatient()}
                aria-label="search-patient"
                size="lg"
                className='ui-border-[#D4D4D4] ui-rounded-l-none ui-bg-[#F5F5F4] focus:ui-border-primary-500 focus:ui-outline-none focus:ui-ring-primary-500 focus:ui-ring-opacity-25'
              >
                <MagnifyingGlassIcon className="ui-w-5 ui-h-5" strokeWidth={2} />
              </ButtonIcon>
            </ButtonGroup>
            {error?.message && (
              <FormErrorMessage>{error?.message}</FormErrorMessage>
            )}
          </FormControl>
        )}
      />

    </Fragment>
  )
}

export default NonProtocolVaccine