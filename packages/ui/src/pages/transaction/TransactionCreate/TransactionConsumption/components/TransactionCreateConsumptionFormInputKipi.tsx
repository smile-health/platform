import React, { Fragment, useCallback, useContext } from "react"
import { Controller } from 'react-hook-form'
import { useTranslation } from "react-i18next"

import {
  FormControl,
  FormErrorMessage,
  FormLabel,
} from '#components/form-control'
import { Input } from '#components/input'
import { ReactSelectAsync } from "#components/react-select"

import { loadListReaction } from "../transaction-consumption.service"
import { REACTION_AFTER_DENGUE } from "../transaction-consumption.constant"
import { ProtocolContext } from "../context/ProtocolContext"
import { clearField } from "#utils/form"

const TransactionCreateConsumptionFormInputKipi: React.FC = () => {
  const { t } = useTranslation('transactionCreateConsumption')
  const {
    methods,
    index,
    indexItem
  } = useContext(ProtocolContext)

  const { control, setValue, clearErrors, watch } = methods
  const reactionId = watch(`data.${index}.vaccination.reaction_id`)

  const handleChangeReaction = useCallback(() => clearField({
    setValue,
    name: [
      `data.${index}.vaccination.other_reaction`,
    ],
    resetValue: null,
    clearErrors,
  }), [index, setValue, clearErrors])

  return (
    <Fragment>
      <Controller
        key={`reaction-id-${indexItem}-${index}`}
        control={control}
        name={`data.${index}.vaccination.reaction_id`}
        render={({
          field: { value, onChange, ...field },
          fieldState: { error },
        }) => (
          <FormControl>
            <FormLabel required>
              {t('patient_identity.reaction_id.label')}
            </FormLabel>

            <ReactSelectAsync
              {...field}
              id={`select-reaction-${indexItem}-${index}`}
              loadOptions={loadListReaction}
              additional={{
                page: 1,
              }}
              value={value}
              placeholder={t('patient_identity.reaction_id.placeholder')}
              onChange={(option) => {
                onChange(option)
                handleChangeReaction()
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

      {reactionId?.value === REACTION_AFTER_DENGUE.OTHERS && (
        <Controller
          key={`other-reaction-${indexItem}-${index}`}
          control={control}
          name={`data.${index}.vaccination.other_reaction`}
          render={({
            field: { value, onChange, ...field },
            fieldState: { error },
          }) => (
            <FormControl>
              <FormLabel required>{t('patient_identity.other_reaction.label')}</FormLabel>
              <Input
                {...field}
                id={`input-other-reaction-${indexItem}-${index}`}
                placeholder={t('patient_identity.other_reaction.placeholder')}
                value={value ?? ''}
                type="text"
                error={!!error?.message}
                onChange={(e) => {
                  onChange(e.target.value)
                }}
              />
              {error?.message && (
                <FormErrorMessage>{error?.message}</FormErrorMessage>
              )}
            </FormControl>
          )}
        />
      )}
    </Fragment>
  )
}

export default TransactionCreateConsumptionFormInputKipi
