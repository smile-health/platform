import { parseDate } from "@internationalized/date"
import { useTranslation } from "react-i18next"
import dayjs from 'dayjs'
import { Controller, useFormContext } from "react-hook-form"
import { CompletedSequenceForm, MaterialCompletedSequencePatient } from "../../transaction-consumption.type"
import { FormControl, FormErrorMessage } from "#components/form-control"
import { DatePicker } from "#components/date-picker"
import { handleDateChange, parseValidDate } from "#utils/date"
import { ReactSelectAsync } from "#components/react-select"
import { loadCustomer } from "../../../transaction-create.service"
import { useContext } from "react"
import { CompleteSequenceContext } from "../../context/CompleteSequenceContext"
import { loadListReaction } from "../../transaction-consumption.service"
import { Input } from "#components/input"
import { REACTION_AFTER_DENGUE } from "../../transaction-consumption.constant"

type Props = {
  patient: MaterialCompletedSequencePatient
  indexMaterial: number
  indexPatient: number
}

const CompleteSequenceDengueForm: React.FC<Props> = (props) => {
  const { patient, indexMaterial, indexPatient } = props
  const { entity_id, activity_id } = useContext(CompleteSequenceContext)
  const {
    control,
    setValue,
    clearErrors,
    watch,
  } = useFormContext<CompletedSequenceForm>()
  const reactionId = watch(`materials.${indexMaterial}.patients.${indexPatient}.data.0.reaction`)
  const { t } = useTranslation('transactionCreateConsumption')
  const dose = patient.data[0]?.vaccine_sequence_title ?? '-'

  return (
    <div
      className="ui-flex ui-flex-col ui-space-y-5 ui-mb-10"
    >
      <p className="ui-text-base ui-text-neutral-500">
        {t("completed_sequence.second_title.dengue", {
          patient_no: patient.patient_id,
          dose,
        })}
      </p>
      <div className="ui-border ui-rounded-lg ui-shadow-sm">
        <div className="ui-grid ui-grid-cols-4 ui-gap-2 ui-bg-slate-100 ui-text-left">
          <div className="p-2">
            <p className="ui-text-sm ui-font-bold ui-text-dark-blue">
              {dose}
            </p>
          </div>
          <div className="p-2">
            <p className="ui-text-sm ui-font-bold ui-text-dark-blue">
              {t('completed_sequence.information.label.entity')}
            </p>
          </div>
          <div className="p-2">
            <p className="ui-text-sm ui-font-bold ui-text-dark-blue">
              {t('patient_identity.reaction_id.label')}
            </p>
          </div>
        </div>
        <div className="ui-grid ui-grid-cols-4">
          <div className="ui-w-full ui-p-2">
            <Controller
              control={control}
              name={`materials.${indexMaterial}.patients.${indexPatient}.data.0.date`}
              render={({
                field: { value, onChange, ...field },
                fieldState: { error },
              }) => (
                <FormControl>
                  <DatePicker
                    {...field}
                    data-testid="field-input-date"
                    value={parseValidDate(value)}
                    maxValue={parseDate(
                      patient?.actual_date ?? dayjs().format('YYYY-MM-DD')
                    )}
                    onChange={handleDateChange(onChange)}
                    error={!!error?.message}
                    clearable
                  />
                  {error?.message && (
                    <FormErrorMessage>{error?.message}</FormErrorMessage>
                  )}
                </FormControl>
              )}
            />
          </div>
          <div className="ui-w-full ui-p-2">
            <Controller
              control={control}
              name={`materials.${indexMaterial}.patients.${indexPatient}.data.0.entity`}
              render={({
                field: { value, onChange, ...field },
                fieldState: { error },
              }) => (
                <FormControl>
                  <ReactSelectAsync
                    {...field}
                    id="select-transaction-customer"
                    loadOptions={loadCustomer}
                    debounceTimeout={300}
                    value={value}
                    isClearable
                    placeholder={t('completed_sequence.information.placeholder.entity', { dose })}
                    additional={{
                      page: 1,
                      entity_id,
                      activity_id,
                    }}
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
          </div>
          <div className="ui-w-full ui-p-2">
            <Controller
              control={control}
              name={`materials.${indexMaterial}.patients.${indexPatient}.data.0.reaction`}
              render={({
                field: { value, onChange, ...field },
                fieldState: { error },
              }) => (
                <FormControl>
                  <ReactSelectAsync
                    {...field}
                    id="select-reaction"
                    loadOptions={loadListReaction}
                    additional={{
                      page: 1,
                    }}
                    value={value}
                    placeholder={t('patient_identity.reaction_id.placeholder')}
                    onChange={(option) => {
                      onChange(option)
                      setValue(`materials.${indexMaterial}.patients.${indexPatient}.data.0.other_reaction`, null)
                      clearErrors(`materials.${indexMaterial}.patients.${indexPatient}.data.0.other_reaction`)
                    }}
                    menuPosition="fixed"
                    error={!!error?.message}
                    menuPlacement="auto"
                  />
                  {error?.message && (
                    <FormErrorMessage>{error?.message}</FormErrorMessage>
                  )}
                </FormControl>
              )}
            />
          </div>
          <div className="ui-w-full ui-p-2">
            <Controller
              control={control}
              name={`materials.${indexMaterial}.patients.${indexPatient}.data.0.other_reaction`}
              render={({
                field: { value, onChange, ...field },
                fieldState: { error },
              }) => (
                <FormControl>
                  <Input
                    {...field}
                    id="input-other-reaction"
                    placeholder={t('patient_identity.other_reaction.placeholder')}
                    value={value ?? ''}
                    type="text"
                    error={!!error?.message}
                    onChange={(e) => {
                      onChange(e.target.value)
                    }}
                    disabled={reactionId?.value !== REACTION_AFTER_DENGUE.OTHERS}
                  />
                  {error?.message && (
                    <FormErrorMessage>{error?.message}</FormErrorMessage>
                  )}
                </FormControl>
              )}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default CompleteSequenceDengueForm
