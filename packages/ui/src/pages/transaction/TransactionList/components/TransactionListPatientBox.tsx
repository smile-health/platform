import React from 'react'
import { ChevronDownIcon } from '@heroicons/react/24/solid'
import { Patient } from '#types/transaction'
import { useTranslation } from 'react-i18next'

import { generatePatientIdentitySchema } from '../helpers/transaction-list.detail'

type TTransactionListPatientBoxProps = {
  patient: Patient
}
const TransactionListPatientBox: React.FC<TTransactionListPatientBoxProps> = ({
  patient,
}) => {
  const { t, i18n } = useTranslation(['common', 'transactionList'])
  return (
    <>
      <div aria-labelledby="header-patient">
        <section className="ui-border ui-border-zinc-300 ui-p-6 ui-rounded">
          <details
            id="patient"
            aria-details="content-patient"
            className="ui-group ui-transition-all ui-cursor-pointer ui-overflow-hidden ui-h-5"
          >
            <summary className="ui-w-full ui-flex ui-justify-between ui-items-center marker:ui-content-none marker:ui-hidden">
              <h5
                id="header-patient"
                className="ui-text-base ui-font-bold ui-text-dark-teal"
              >
                {t('transactionList:detail.patient_identity.title')}
              </h5>
              <div className="ui-w-3 ui-h-3 ui-text-dark-teal ui-transition-transform ui-duration-500 ui-ease-in-out group-open:ui-rotate-180">
                <ChevronDownIcon />
              </div>
            </summary>
          </details>
          <div
            className="content ui-overflow-hidden ui-space-y-1"
            id="content-patient"
          >
            {generatePatientIdentitySchema({
              patient,
              t,
              locale: i18n.language,
            }).map((patient, index) => (
              <div
                key={index?.toString()}
                className="ui-grid ui-grid-cols-[1fr_4px_2fr] ui-gap-1"
              >
                <h6 className="ui-text-dark-teal ui-text-base ui-font-medium">
                  {patient.label}
                </h6>
                <h6 className="ui-text-neutral-500 ui-text-base ui-font-medium">
                  :
                </h6>
                <h6 className="ui-text-neutral-500 ui-text-base ui-font-medium">
                  {patient.value || '-'}
                </h6>
              </div>
            ))}
          </div>
        </section>
      </div>
      <style>{`
        details[open] {
          padding-bottom: 100px;
        }

        section:has(> details#patient){
          flex-direction: column;
          align-items: center;
          flex-wrap: nowrap;
        }

        details#patient {
          margin-bottom: 0;
          border-bottom: 0;
        }

        details#patient[open] {
          padding-bottom: 25px;
        }

        details#patient + .content {
          max-height: 0;
          transition: all 0.2s ease-in-out;
        }

        details#patient[open] + .content {
          max-height: max-content;
          margin-top: 24px;
        }
      `}</style>
    </>
  )
}

export default TransactionListPatientBox
