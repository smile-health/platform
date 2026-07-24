import dayjs from 'dayjs'
import isBetween from 'dayjs/plugin/isBetween'
import { TFunction } from 'i18next'
import * as yup from 'yup'

type TSchema = {
  t: TFunction<['common', 'transactionList']>
  actualTransactionDate: string
}

export const schemaSideEffect = ({ t, actualTransactionDate }: TSchema) =>
  yup.object().shape({
    reaction_type: yup
      .number()
      .required(
        t('transactionList:detail.side_effect.add.reaction_type.error')
      ),
    other_reaction: yup
      .string()
      .test(
        'other-reaction-required',
        t('transactionList:detail.side_effect.add.other_reaction.error'),
        (other_reaction, { parent }) => {
          if (parent.reaction_type !== 4) return true

          const isAccept =
            typeof other_reaction === 'string' &&
            other_reaction?.length > 0 &&
            parent.reaction_type === 4

          return isAccept
        }
      ),
    reaction_date: yup
      .string()
      .test(
        'invalid-reaction-date',
        t(
          'transactionList:detail.side_effect.add.actual_reaction_date.error.invalid'
        ),
        (reaction_date) => {
          if (!reaction_date) return

          dayjs.extend(isBetween)

          const newDate = new Date(reaction_date.toString())
          const formattedDate = dayjs(newDate).format('YYYY-MM-DD')

          const vaccineDate = dayjs(actualTransactionDate).format('YYYY-MM-DD')
          const isValid = dayjs(formattedDate).isBetween(
            vaccineDate,
            dayjs(vaccineDate).add(30, 'days'),
            'day',
            '[]'
          )

          return isValid
        }
      )
      .required(
        t(
          'transactionList:detail.side_effect.add.actual_reaction_date.error.required'
        )
      ),
  })
