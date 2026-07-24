import React from "react"
import { useTranslation } from "react-i18next"
import { ExclamationCircleIcon } from "@heroicons/react/24/outline"
import dayjs from 'dayjs'
import { CreateTransactionConsumptionPatient } from "../transaction-consumption.type"
import { IDENTITY_TYPE_VALUE } from "../transaction-consumption.constant"

type Props = {
  data: CreateTransactionConsumptionPatient
}

const TransactionCreateConsumptionExistDataPatientIdentity: React.FC<Props> = (props) => {
  const { data } = props
  const { t } = useTranslation('transactionCreateConsumption')

  const parseBirthDate = (date?: string | null) => {
    if (!date) return null
    return dayjs(date, 'YYYY-MM-DD').format('DD MMM YYYY')
  }

  return (
    <div className="ui-space-y-2">
      {!!data.patient && (
        <div className="ui-border-[#FFF7ED] ui-bg-[#FFF7ED] ui-flex ui-items-center ui-gap-2 ui-p-2 ui-rounded-sm">
          <ExclamationCircleIcon className='ui-text-primary-800 ui-h-5 ui-w-5' strokeWidth={2.5} />
          <p className="ui-text-xs ui-font-normal ui-text-primary-800">{t('patient_identity.warning_exist')}</p>
        </div>
      )}
      {data.vaccination.identity_type?.value === IDENTITY_TYPE_VALUE.NIK && (
        <div className="ui-border-[#E5E5E5] ui-bg-[#F5F5F4] ui-flex ui-flex-col ui-gap-2 ui-p-2 ui-rounded-[4px]">
          <p className="ui-font-bold ui-text-neutral-500 ui-text-sm">
            {t('patient_identity.identity.generate_from_nik')}
          </p>
          <div className='ui-flex ui-justify-between'>
            <p className="ui-font-normal ui-text-neutral-500 ui-text-sm">
              {t('patient_identity.identity.gender.label')}
            </p>
            <p className="ui-font-normal ui-text-dark-blue ui-text-sm">
              {data?.generate_from_nik?.gender?.label ?? data.identity.gender?.label ?? '-'}
            </p>
          </div>
          <div className='ui-flex ui-justify-between'>
            <p className="ui-font-normal ui-text-neutral-500 ui-text-sm">
              {t('patient_identity.identity.birth_date.label')}
            </p>
            <p className="ui-font-normal ui-text-dark-blue ui-text-sm">
              {data?.generate_from_nik?.birth_date ?? parseBirthDate(data.identity.birth_date) ?? '-'}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default TransactionCreateConsumptionExistDataPatientIdentity