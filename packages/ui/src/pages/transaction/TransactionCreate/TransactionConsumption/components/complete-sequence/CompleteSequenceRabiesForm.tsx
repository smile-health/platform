import { Controller, FieldError, useFormContext } from "react-hook-form"
import { parseDate } from "@internationalized/date"
import dayjs from 'dayjs'
import { CompletedSequenceForm, MaterialCompletedSequencePatient } from "../../transaction-consumption.type"
import { IDENTITY_TYPE_VALUE } from "../../transaction-consumption.constant"
import { FormControl, FormErrorMessage } from "#components/form-control"
import { DatePicker } from "#components/date-picker"
import { handleDateChange, parseValidDate } from "#utils/date"
import { useTranslation } from "react-i18next"

type Props = {
  patient: MaterialCompletedSequencePatient
  indexMaterial: number
  indexPatient: number
}

const CompleteSequenceRabiesForm: React.FC<Props> = (props) => {
  const { patient, indexMaterial, indexPatient } = props

  return (
    <div
      className="ui-flex ui-flex-col ui-space-y-5 ui-mb-10"
    >
      <PatientInfo patient={patient} />
      <div className="ui-border ui-rounded-lg ui-shadow-sm">
        <PatientDataPreview patient={patient} />
        <PatientDateInputs
          patient={patient}
          indexMaterial={indexMaterial}
          indexPatient={indexPatient}
        />
      </div>
    </div>
  )
}

const PatientInfo = ({
  patient,
}: {
  patient: MaterialCompletedSequencePatient
}) => {
  const { t } = useTranslation('transactionCreateConsumption')
  return (
    <div className="ui-flex ui-flex-row ui-space-x-5">
      <div className="ui-flex ui-flex-col ui-text-left">
        <div className="ui-text-neutral-500 ui-text-sm">
          {patient.identity_type === IDENTITY_TYPE_VALUE.NIK
            ? t('nik')
            : t('non_nik')}
        </div>
        <div className="ui-font-bold ui-text-dark-blue">
          {patient?.patient_id ?? '-'}
        </div>
      </div>
      <div className="ui-flex ui-flex-col ui-text-left">
        <div className="ui-text-neutral-500 ui-text-sm">
          {t('patient_identity.vaccination_sequence.label')}
        </div>
        <div className="ui-font-bold ui-text-dark-blue">
          {patient?.selected_vaccine_sequence_title ?? '-'}
        </div>
      </div>
    </div>
  )
}

const PatientDataPreview = ({
  patient,
}: {
  patient: MaterialCompletedSequencePatient
}) => (
  <div className="ui-flex ui-flex-row ui-space-x-2 ui-bg-slate-100 ui-text-left">
    {patient.data.map((item, index) => (
      <div
        key={`patient-data-preview-${index.toString()}`}
        className="ui-w-full p-2"
      >
        <div className="ui-font-bold ui-text-dark-blue">
          {item.vaccine_sequence_title}
        </div>
        <div className="ui-text-neutral-500 ui-text-sm">
          {patient?.selected_vaccine_method_title ?? '-'}
        </div>
      </div>
    ))}
    <div className="ui-w-full p-2">
      <div className="ui-font-bold ui-text-dark-blue">
        {patient?.selected_vaccine_sequence_title ?? '-'}
      </div>
      <div className="ui-text-neutral-500 ui-text-sm">
        {patient?.selected_vaccine_method_title ?? '-'}
      </div>
    </div>
  </div>
)

const PatientDateInputs = ({
  patient,
  indexMaterial,
  indexPatient,
}: {
  patient: MaterialCompletedSequencePatient
  indexMaterial: number
  indexPatient: number
}) => {
  const { t } = useTranslation('transactionCreateConsumption')
  const {
    control,
  } = useFormContext<CompletedSequenceForm>()

  const renderError = (error: FieldError | undefined, value: string | null) => {
    if (error?.message) return <FormErrorMessage>{error.message}</FormErrorMessage>
    if (!value) {
      return (
        <p className="ui-text-sm ui-font-normal ui-text-secondary-500">
          {t('completed_sequence.information.missing')}
        </p>
      )
    }
    return null
  }

  return (
    <div className="ui-flex ui-flex-row">
      {patient.data.map((item, index) => (
        <div key={`${index.toString()}-input-date`} className="ui-w-full ui-p-2 ">
          <Controller
            control={control}
            name={`materials.${indexMaterial}.patients.${indexPatient}.data.${index}.date`}
            render={({
              field: { value, onChange, ...field },
              fieldState: { error },
            }) => {
              const prevDate = patient.data?.[index - 1]?.date

              return (
                <FormControl>
                  <DatePicker
                    {...field}
                    data-testid={`${index}-field-input-date`}
                    value={parseValidDate(value)}
                    maxValue={parseDate(
                      patient?.actual_date ?? dayjs().format('YYYY-MM-DD')
                    )}
                    minValue={prevDate ? parseDate(prevDate) : undefined}
                    onChange={handleDateChange(onChange)}
                    error={!!error?.message}
                    clearable
                  />
                  {renderError(error, value)}
                </FormControl>
              )
            }}
          />
        </div>
      ))}
      <div className="ui-w-full ui-p-2">
        <FormControl>
          <DatePicker
            data-testid="field-input-date-last"
            value={parseValidDate(patient?.actual_date)}
            isDisabled
          />
          <p className="ui-text-sm ui-font-normal ui-text-neutral-500">
            {t('completed_sequence.information.current')}
          </p>
        </FormControl>
      </div>
    </div>
  )
}

export default CompleteSequenceRabiesForm
