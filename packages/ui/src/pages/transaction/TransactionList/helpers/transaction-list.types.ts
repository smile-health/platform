import { TProgram } from '#types/program'
import { TTransactionData } from '#types/transaction'
import { TFunction } from 'i18next'

export type TMainColumn = {
  t: TFunction<['common', 'transactionList']>
  locale: string
  program: TProgram
}

export type TPatientColumn = {
  t: TFunction<['common', 'transactionList']>
}

export type TAccessors = {
  label: string
  accessorKey: string
  value?: string | number | null
}

export type TMoreDetail = {
  t: TFunction<['common', 'transactionList']>
  locale: string
  data: TTransactionData | null
}

export type TMoreDetailsIsDialog = {
  t: TFunction<['common', 'transactionList']>
  locale: string
  data: TTransactionData | null
}

export type SideEffectFormValues = {
  reaction_type: number
  other_reaction?: string
  reaction_date: string
}
