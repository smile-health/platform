import { ExclamationCircleIcon } from '@heroicons/react/24/outline'
import { useTranslation } from 'react-i18next'

type RecordVaccinePatientExistsProps = {
  patient_no: string
  history: string[]
  isRabies: boolean
}

const RecordVaccinePatientExists = ({
  patient_no,
  history,
  isRabies = true,
}: RecordVaccinePatientExistsProps) => {
  const { t } = useTranslation('transactionCreateConsumption')

  return (
    <div>
      <div
        className={`ui-flex ui-items-start ui-gap-2 ui-p-2 ui-rounded-sm ${
          isRabies
            ? 'ui-border-[#DC2626] ui-border-2 ui-bg-[#FEF2F2]'
            : 'ui-border-[#FFF7ED] ui-bg-[#FFF7ED]'
        }`}
      >
        <div className="ui-flex-1">
          <ExclamationCircleIcon
            className={`${
              isRabies ? 'ui-text-[#DC2626]' : 'ui-text-primary-800'
            } ui-h-5 ui-w-5`}
            strokeWidth={2.5}
          />
        </div>
        <div
          className={`ui-flex ui-flex-col ui-gap-2 ${
            isRabies ? 'ui-text-[#DC2626]' : 'ui-text-primary-800'
          }`}
        >
          <p className="ui-text-xs ui-font-normal">
            {t('patient_identity.patient_has_record.vaccination', {
              patient_no,
            })}
          </p>

          <ul className="ui-list-disc ui-pl-3 ui-m-0 ui-space-y-1">
            {history.map((item, index) => (
              <li
                key={`history-vaccine-${index.toString()}`}
                className={`${
                  isRabies ? 'ui-font-bold' : 'ui-font-normal'
                } ui-text-xs`}
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

export default RecordVaccinePatientExists
