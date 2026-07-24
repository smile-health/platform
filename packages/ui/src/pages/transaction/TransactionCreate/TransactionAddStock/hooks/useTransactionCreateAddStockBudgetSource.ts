import { useMemo } from 'react'
import { yupResolver } from '@hookform/resolvers/yup'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { formSchemaAddStockBudgetSource } from '../schema/TransactionCreateAddStockSchemaForm'
import {
  BudgetSourceForm,
  ModalAddBudgetSource,
} from '../transaction-add-stock.type'

export const useTransactionCreateAddStockBudgetSource = ({
  setIsOpen,
  isOpen,
  index,
  item,
  setValueBatch,
  triggerParent,
}: ModalAddBudgetSource) => {
  const { t } = useTranslation(['common'])
  const methods = useForm<BudgetSourceForm>({
    resolver: yupResolver(formSchemaAddStockBudgetSource(t)),
    mode: 'onChange',
    defaultValues: {
      budget_source: null,
      budget_source_year: null,
      budget_source_price: null,
      total_price_input: null,
      is_purchase: false,
    },
  })

  useMemo(() => {
    if (index.indexBatch >= 0) {
      methods.setValue('budget_source', item?.budget_source)
      methods.setValue('budget_source_year', item?.budget_source_year)
      methods.setValue('budget_source_price', item?.budget_source_price)
      methods.setValue('total_price_input', item?.total_price_input)
      methods.setValue('is_purchase', Boolean(item?.transaction_reason?.value?.is_purchase))
    }
  }, [isOpen])

  const handleSave = ({ data }: { data: BudgetSourceForm }) => {
    if (data) {
      setValueBatch(
        `batches.${index.indexBatch}.budget_source`,
        data.budget_source
      )
      setValueBatch(
        `batches.${index.indexBatch}.budget_source_price`,
        data.budget_source_price
      )
      setValueBatch(
        `batches.${index.indexBatch}.budget_source_year`,
        data.budget_source_year
      )
      setValueBatch(
        `batches.${index.indexBatch}.total_price_input`,
        data.total_price_input
      )
      setIsOpen(false)
      triggerParent(`batches.${index.indexBatch}.budget_source`)
    }
  }

  return {
    methods,
    handleSave,
  }
}
