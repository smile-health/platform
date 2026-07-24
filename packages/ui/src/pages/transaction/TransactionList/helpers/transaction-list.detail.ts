import {
  DiseaseHistoryPrevention,
  Patient,
  Protocol,
  Transaction,
  Vaccination,
} from '#types/transaction'
import { numberFormatter } from '#utils/formatter'
import dayjs from 'dayjs'
import { TFunction } from 'i18next'

import 'dayjs/locale/id'
import 'dayjs/locale/en'

type generateBatchSchemaProps = {
  t: TFunction<['common', 'transactionList']>
  locale: string
  transaction: Transaction
}

export const generateBatchSchema = ({
  t,
  locale,
  transaction,
}: generateBatchSchemaProps) => {
  const generateDate = (date: string) => {
    return dayjs(date).locale(locale).format('DD MMM YYYY').toUpperCase()
  }

  const currency = process.env.CURRENCY ?? 'IDR'

  return [
    {
      label: t('transactionList:batch_columns.manufacturer'),
      value: transaction.manufacturer,
    },
    {
      label: t('transactionList:batch_columns.production_date'),
      value: transaction.production_date
        ? generateDate(transaction.production_date)
        : '-',
    },
    {
      label: t('transactionList:batch_columns.expired_date'),
      value: transaction.expired_date
        ? generateDate(transaction.expired_date)
        : '-',
    },
    {
      label: t('transactionList:batch_columns.actual_tranasction_date'),
      value: transaction.actual_transaction_date
        ? generateDate(transaction.actual_transaction_date)
        : '-',
    },
    {
      label: t('transactionList:batch_columns.source_of_fund'),
      value: transaction?.transaction_purchase?.budget_source?.name ?? '-',
    },
    {
      label: t('transactionList:batch_columns.budget_year'),
      value: transaction?.transaction_purchase?.year?.toString() ?? '-',
    },
    {
      label: t('transactionList:batch_columns.total_price'),
      value: transaction?.transaction_purchase?.total_price
        ? `${currency} ${numberFormatter(transaction.transaction_purchase.total_price, locale, 'currency')}`
        : '-',
    },
    {
      label: t('transactionList:batch_columns.price'),
      value: transaction?.transaction_purchase?.price
        ? `${currency} ${numberFormatter(transaction.transaction_purchase.price, locale, 'currency')}`
        : '-',
    },
  ]
}

export const generateVaccinationSchema = ({
  t,
  vaccination,
  protocol,
}: {
  t: TFunction<['common', 'transactionList']>
  vaccination: Vaccination
  protocol: Protocol | undefined
}) => {
  return [
    ...(!protocol?.is_medical_history
      ? [
          {
            label: t('transactionList:detail.vaccination.type'),
            value: vaccination.type || '-',
          },
          {
            label: t('transactionList:detail.vaccination.method'),
            value: vaccination.method || '-',
          },
        ]
      : []),
    {
      label: t('transactionList:detail.vaccination.sequence'),
      value: vaccination.sequence || '-',
    },
    {
      label: t('transactionList:detail.vaccination.age_at_vaccination'),
      value: `${vaccination.age_at_vaccination} ${t('date.year')}`,
    },
    {
      label: t('transactionList:detail.vaccination.material_status'),
      value: vaccination.material_status || '-',
    },
    ...(protocol?.is_medical_history
      ? [
          {
            label: t('transactionList:detail.vaccination.disease_history'),
            value: vaccination.disease_history ? t('yes') : t('no'),
          },
        ]
      : []),
  ]
}

export const generatePatientIdentitySchema = ({
  patient,
  t,
  locale,
}: {
  patient: Patient
  t: TFunction<['common', 'transactionList']>
  locale: string
}) => {
  return [
    {
      label: t('transactionList:detail.patient_identity.number'),
      value: patient.identity?.identity_number,
    },
    {
      label: t('transactionList:detail.patient_identity.fullname'),
      value: patient.identity?.name,
    },
    {
      label: t('transactionList:detail.patient_identity.gender'),
      value: patient.identity?.gender,
    },
    {
      label: t('transactionList:detail.patient_identity.date_of_birth'),
      value: dayjs(patient.identity?.date_of_birth)
        .locale(locale)
        .format('DD MMM YYYY')
        .toUpperCase(),
    },
    {
      label: t('transactionList:detail.patient_identity.phone_number'),
      value: patient.identity?.phone_number,
    },
    {
      label: t('transactionList:detail.patient_identity.current_age'),
      value: `${patient.identity?.age} ${t('date.year')}`,
    },
    {
      label: t('transactionList:detail.patient_identity.status'),
      value: patient.identity?.marital_status,
    },
    {
      label: t('transactionList:detail.patient_identity.last_education'),
      value: patient.identity?.education,
    },
    {
      label: t('transactionList:detail.patient_identity.occupation'),
      value: patient.identity?.occupation,
    },
    {
      label: t('transactionList:detail.patient_identity.religion'),
      value: patient.identity?.religion,
    },
    {
      label: t('transactionList:detail.patient_identity.ethnicity'),
      value: patient.identity?.ethnicity,
    },
    {
      label: t('transactionList:detail.patient_identity.residential_address'),
      value: patient.identity?.residential_address,
    },
    {
      label: t('transactionList:detail.patient_identity.registered_address'),
      value: patient.identity?.registered_address,
    },
  ]
}

export const generateDiseaseHistorySchema = ({
  t,
  diseaseHistory,
  locale,
}: {
  t: TFunction<['common', 'transactionList']>
  diseaseHistory: DiseaseHistoryPrevention
  locale: string
}) => {
  return [
    {
      label: t(
        'transactionList:detail.disease_history.dengue.has_dengue_question'
      ),
      value: diseaseHistory.has_dengue_before ? t('yes') : t('no'),
    },
    {
      label: t(
        'transactionList:detail.disease_history.dengue.last_time_dengue_question'
      ),
      value: `${diseaseHistory.last_dengue_month} ${diseaseHistory.last_dengue_year}`,
    },
    {
      label: t(
        'transactionList:detail.disease_history.dengue.has_vaccination_question'
      ),
      value: diseaseHistory.has_voluntary_vaccination ? t('yes') : t('no'),
    },
  ]
}
