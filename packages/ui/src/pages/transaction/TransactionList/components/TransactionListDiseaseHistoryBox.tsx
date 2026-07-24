import React, { useMemo } from 'react'
import { ChevronDownIcon } from '@heroicons/react/24/solid'
import { DiseaseHistoryPrevention } from '#types/transaction'
import { useTranslation } from 'react-i18next'

import { generateDiseaseHistorySchema } from '../helpers/transaction-list.detail'

type TransactionListDiseaseHistoryBoxProps = {
  diseaseHistory: DiseaseHistoryPrevention
}

const TransactionListDiseaseHistoryBox: React.FC<
  TransactionListDiseaseHistoryBoxProps
> = ({ diseaseHistory }) => {
  const { t, i18n } = useTranslation(['common', 'transactionList'])
  const diseaseHistorySchema = useMemo(() => {
    return generateDiseaseHistorySchema({
      t,
      diseaseHistory,
      locale: i18n.language,
    })
  }, [t, diseaseHistory, i18n.language])

  return (
    <>
      <div aria-labelledby="header-disease-history">
        <section className="ui-border ui-border-zinc-300 ui-p-6 ui-rounded">
          <details
            id="disease-history"
            aria-details="content-disease-history"
            className="ui-group ui-transition-all ui-cursor-pointer ui-overflow-hidden ui-h-5 ui-mb-6"
          >
            <summary className="ui-w-full ui-flex ui-justify-between ui-items-center marker:ui-content-none marker:ui-hidden">
              <h5
                id="header-disease-history"
                className="ui-text-base ui-font-bold ui-text-dark-teal"
              >
                {t('transactionList:detail.disease_history.title')}
              </h5>
              <div className="ui-w-3 ui-h-3 ui-text-dark-teal ui-transition-transform ui-duration-500 ui-ease-in-out group-open:ui-rotate-180">
                <ChevronDownIcon />
              </div>
            </summary>
          </details>
          <div
            className="content ui-overflow-hidden ui-space-y-1"
            id="content-disease-history"
          >
            {diseaseHistorySchema.map((patient, index) => (
              <div key={index?.toString()} className="ui-space-y-1">
                <h6 className="ui-text-dark-teal ui-text-base ui-font-medium">
                  {patient.label}
                </h6>
                <h6 className="ui-text-neutral-500 ui-text-base ui-font-medium">
                  {patient.value}
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

        section:has(> details#disease-history){
          flex-direction: column;
          align-items: center;
          flex-wrap: nowrap;
        }

        details#disease-history {
          margin-bottom: 0;
          border-bottom: 0;
        }

        details#disease-history[open] {
          padding-bottom: 25px;
        }

        details#disease-history + .content {
          max-height: 0;
          transition: all 0.2s ease-in-out;
        }

        details#disease-history[open] + .content {
          max-height: max-content;
          margin-top: 24px;
        }
      `}</style>
    </>
  )
}

export default TransactionListDiseaseHistoryBox
