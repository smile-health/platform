import React, { useContext, useMemo } from "react"
import { Controller } from "react-hook-form"
import { ProtocolContext } from "../context/ProtocolContext"
import { FormControl, FormErrorMessage, FormLabel } from "#components/form-control"
import { Radio, RadioGroup } from "#components/radio"
import { useTranslation } from "react-i18next"
import { OptionType, ReactSelect } from "#components/react-select"
import { optionsMonths, optionsYears } from "../transaction-consumption.constant"
import cx from "#lib/cx"

const TransactionCreateConsumptionFormInputDiseaseHistory: React.FC = () => {
  const {
    methods,
    index,
    indexItem
  } = useContext(ProtocolContext)
  const { t } = useTranslation('transactionCreateConsumption')
  const {
    control,
    setValue,
    clearErrors,
    formState: { errors },
    watch,
    trigger,
  } = methods
  const historyMedical = watch(`data.${index}.history_medical`)

  const handleChangeIsDengueBefore = () => {
    setValue(`data.${index}.history_medical.last_dengue_diagnosis_month`, null)
    clearErrors(`data.${index}.history_medical.last_dengue_diagnosis_month`)
    setValue(`data.${index}.history_medical.last_dengue_diagnosis_year`, null)
    clearErrors(`data.${index}.history_medical.last_dengue_diagnosis_year`)
  }

  const setValueRadio = (value: number | null | undefined, comparator: number) => {
    if (typeof value !== 'number') return undefined

    return value === comparator
  }

  const memoizedOptionsMonths = useMemo(() => optionsMonths(t), [t])
  const memoizedYearOptions = useMemo(() => optionsYears(), [])

  return (
    <div className="ui-flex ui-flex-col ui-space-y-5 ui-w-full">
      <Controller
        key={`is-dengue-before-${indexItem}-${index}`}
        control={control}
        name={`data.${index}.history_medical.is_dengue_before`}
        render={({
          field: { value, onChange },
          fieldState: { error },
        }) => (
          <FormControl className="ui-space-y-3">
            <FormLabel required className="ui-leading-5">
              {t('patient_identity.history_medical.is_dengue_before.label')}
            </FormLabel>
            <RadioGroup>
              <Radio
                id="radio-is-dengue-before-yes"
                value={1}
                checked={setValueRadio(value, 1)}
                label={t('patient_identity.history_medical.is_dengue_before.options', { returnObjects: true })[0]}
                onChange={() => {
                  onChange(1)
                  handleChangeIsDengueBefore()
                }}
              />
              <Radio
                id="radio-is-dengue-before-no"
                value={0}
                checked={setValueRadio(value, 0)}
                label={t('patient_identity.history_medical.is_dengue_before.options', { returnObjects: true })[1]}
                onChange={() => {
                  onChange(0)
                  handleChangeIsDengueBefore()
                }}
              />
            </RadioGroup>
            {error?.message && (
              <FormErrorMessage>{error?.message}</FormErrorMessage>
            )}
          </FormControl>
        )}
      />

      <FormControl className={cx('ui-space-y-3', { 'ui-hidden': !historyMedical?.is_dengue_before })}>
        <FormLabel required className="ui-leading-5">
          {t('patient_identity.history_medical.last_dengue_diagnosis.label')}
        </FormLabel>
        <div className="ui-flex ui-items-center ui-gap-4">
          <ReactSelect
            key={`select-month-${historyMedical?.is_dengue_before}-${indexItem}-${index}`}
            className="ui-w-full"
            placeholder={t('patient_identity.history_medical.last_dengue_diagnosis.placeholder', { returnObjects: true })[0]}
            options={memoizedOptionsMonths}
            onChange={(e: OptionType) => {
              setValue(`data.${index}.history_medical.last_dengue_diagnosis_month`, e.value)
              clearErrors(`data.${index}.history_medical.last_dengue_diagnosis_month`)
              trigger(`data.${index}.history_medical.last_dengue_diagnosis_month`)
            }}
            value={memoizedOptionsMonths.find(item => item.value === historyMedical?.last_dengue_diagnosis_month)}
            error={!!errors?.data?.[index]?.history_medical?.last_dengue_diagnosis_month}
            menuPosition="fixed"
          />
          <ReactSelect
            key={`select-year-${historyMedical?.is_dengue_before}-${indexItem}-${index}`}
            className="ui-w-full"
            placeholder={t('patient_identity.history_medical.last_dengue_diagnosis.placeholder', { returnObjects: true })[1]}
            options={memoizedYearOptions}
            onChange={(e: OptionType) => {
              setValue(`data.${index}.history_medical.last_dengue_diagnosis_year`, e.value)
              clearErrors(`data.${index}.history_medical.last_dengue_diagnosis_year`)
              trigger(`data.${index}.history_medical.last_dengue_diagnosis_year`)
            }}
            value={memoizedYearOptions.find(item => item.value === historyMedical?.last_dengue_diagnosis_year)}
            error={!!errors?.data?.[index]?.history_medical?.last_dengue_diagnosis_year}
            menuPosition="fixed"
          />
        </div>
      </FormControl>

      <Controller
        key={`dengue-received-vaccine-${indexItem}-${index}`}
        control={control}
        name={`data.${index}.history_medical.dengue_received_vaccine`}
        render={({
          field: { value, onChange },
          fieldState: { error },
        }) => (
          <FormControl className="ui-space-y-3">
            <FormLabel required className="ui-leading-5">
              {t('patient_identity.history_medical.dengue_received_vaccine.label')}
            </FormLabel>
            <RadioGroup>
              <Radio
                id={`radio-is-dengue-before-yes-${indexItem}-${index}`}
                value={1}
                checked={setValueRadio(value, 1)}
                label={t('patient_identity.history_medical.dengue_received_vaccine.options', { returnObjects: true })[0]}
                onChange={() => onChange(1)}
              />
              <Radio
                id={`radio-is-dengue-before-no-${indexItem}-${index}`}
                value={0}
                checked={setValueRadio(value, 0)}
                label={t('patient_identity.history_medical.dengue_received_vaccine.options', { returnObjects: true })[1]}
                onChange={() => onChange(0)}
              />
            </RadioGroup>
            {error?.message && (
              <FormErrorMessage>{error?.message}</FormErrorMessage>
            )}
          </FormControl>
        )}
      />
    </div>
  )
}

export default TransactionCreateConsumptionFormInputDiseaseHistory