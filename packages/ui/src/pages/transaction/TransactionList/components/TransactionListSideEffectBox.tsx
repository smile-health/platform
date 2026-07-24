import React from 'react'
import { Button } from '#components/button'
import Plus from '#components/icons/Plus'
import { SideEffect } from '#types/transaction'
import dayjs from 'dayjs'
import { useTranslation } from 'react-i18next'

type TTransactionListSideEffectBoxProps = {
  onAddSideEffect: () => void
  sideEffects: SideEffect[]
}

const TransactionListSideEffectBox: React.FC<
  TTransactionListSideEffectBoxProps
> = ({ onAddSideEffect, sideEffects }) => {
  const { t, i18n } = useTranslation(['common', 'transactionList'])

  const formatDate = (date: string, format: string) => {
    return dayjs(date).locale(i18n.language).format(format)
  }

  return (
    <div aria-labelledby="header-side-effect">
      <section className="ui-border ui-border-zinc-300 ui-p-6 ui-rounded">
        <h5
          id="header-side-effect"
          className="ui-text-base ui-font-bold ui-text-dark-teal"
        >
          {t('transactionList:detail.side_effect.title')}
        </h5>
        <div
          className="content ui-overflow-hidden ui-space-y-1 ui-mt-4"
          id="content-side-effect"
        >
          {sideEffects.map((effect, index) => (
            <div
              key={index?.toString()}
              className="ui-flex ui-justify-between ui-items-center ui-border-b ui-border-neutral-300 ui-py-2"
            >
              <h6 className="ui-text-dark-teal ui-text-base ui-font-medium">
                {t('transactionList:detail.side_effect.reaction')}:{' '}
                {effect.other_reaction || effect.reaction} (
                {effect.sequence_name})
              </h6>
              <h6 className="ui-text-neutral-500 ui-text-base ui-font-medium">
                {formatDate(effect.reaction_date, 'DD MMM YYYY')}
              </h6>
            </div>
          ))}
        </div>
        <div className="mt-2">
          <Button
            variant="subtle"
            onClick={onAddSideEffect}
            leftIcon={<Plus className="ui-size-4" />}
            className="ui-py-1 ui-px-2 ui-h-8"
          >
            {t('transactionList:detail.side_effect.add.button_add')}
          </Button>
        </div>
      </section>
    </div>
  )
}

export default TransactionListSideEffectBox
