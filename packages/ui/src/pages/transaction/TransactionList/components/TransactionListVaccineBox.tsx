import React from 'react'
import { ExclamationCircleIcon } from '@heroicons/react/24/outline'
import {
  Consumption,
  Protocol,
  Transaction,
  Vaccination,
} from '#types/transaction'
import dayjs from 'dayjs'
import { useTranslation } from 'react-i18next'

import { generateVaccinationSchema } from '../helpers/transaction-list.detail'

type TransactionListVaccineBoxProps = {
  vaccination: Vaccination
  protocol: Protocol | undefined
  consumption?: Consumption
  transaction?: Transaction
}

const TransactionListVaccineBox: React.FC<TransactionListVaccineBoxProps> = ({
  vaccination,
  protocol,
  consumption,
  transaction,
}) => {
  const { t, i18n } = useTranslation(['common', 'transactionList'])

  const entityName = consumption?.pep_shifted_by_entity?.name
  const transactionDate = transaction?.actual_transaction_date

  return (
    <div aria-labelledby="header-vaccination">
      <section className="ui-border ui-border-zinc-300 ui-p-6 ui-rounded">
        <h5
          id="header-vaccination"
          className="ui-text-base ui-font-bold ui-text-dark-teal"
        >
          {t('transactionList:detail.vaccination.title')}
        </h5>
        {entityName && transactionDate && (
          <div className="ui-flex ui-items-center ui-gap-3 ui-p-3 ui-my-4 ui-bg-danger-50 ui-border ui-border-danger-500 ui-text-danger-500 ui-rounded-sm">
            <ExclamationCircleIcon className="ui-w-5 ui-h-5 ui-flex-shrink-0" />
            <span className="ui-text-sm">
              {t('transactionList:detail.vaccination.alert_updated_by', {
                entityName,
                transactionDate: dayjs(transactionDate)
                  .locale(i18n.language)
                  .format('DD MMM YYYY')
                  .toUpperCase(),
              })}
            </span>
          </div>
        )}
        <div
          className="content ui-overflow-hidden ui-space-y-1 ui-mt-6"
          id="content-vaccination"
        >
          {generateVaccinationSchema({ t, vaccination, protocol }).map(
            (vaccine, index) => (
              <div
                key={index?.toString()}
                className="ui-grid ui-grid-cols-[1fr_2fr]"
              >
                <h6 className="ui-text-dark-teal ui-text-base ui-font-medium">
                  {vaccine.label}
                </h6>
                <h6 className="ui-text-neutral-500 ui-text-base ui-font-medium">
                  : {vaccine.value}
                </h6>
              </div>
            )
          )}
        </div>
      </section>
    </div>
  )
}

export default TransactionListVaccineBox
