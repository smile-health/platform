import { yupResolver } from '@hookform/resolvers/yup'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { useModalWarningStore } from '../../store/modal-warning.store'
import { formSchemaAddStockBatch } from '../schema/TransactionCreateAddStockSchemaForm'
import {
  CreateTransactionBatch,
  ModalAddEditBatch,
  TransactionAddStockChild,
} from '../transaction-add-stock.type'

export const useTransactionCreateAddStockBatch = () => {
  const { t } = useTranslation([
    'transactionCreateAddStock',
    'common',
    'transactionCreate',
  ])
  const methods = useForm<TransactionAddStockChild>({
    resolver: yupResolver(formSchemaAddStockBatch(t)),
    mode: 'onChange',
    defaultValues: { batches: [] },
  })

  const resetBatch = () => {
    const currentBatch = methods.watch().batches
    const newBatches: CreateTransactionBatch[] | undefined = currentBatch?.map(
      (itm) => {
        const batchTemp: CreateTransactionBatch = {
          ...itm,
          change_qty: null,
          status_material: null,
          budget_source: null,
          budget_source_price: null,
          budget_source_year: null,
          total_price_input: null,
          transaction_reason: null,
          other_reason_required: false,
          other_reason: null,
        }
        return batchTemp
      }
    )

    return newBatches
  }

  const addNewNonBatch = ({
    batches,
    activity,
    temperature_sensitive,
    pieces_per_unit,
    managed_in_batch,
  }: ModalAddEditBatch) => {
    const copyBatches = batches ? [...batches] : []
    const newBatch: CreateTransactionBatch = {
      batch_id: null,
      activity_id: activity?.value ?? null,
      activity_name: activity?.label ?? null,
      change_qty: null,
      code: null,
      production_date: null,
      expired_date: null,
      manufacturer: null,
      on_hand_stock: null,
      min: null,
      max: null,
      available_qty: null,
      allocated_qty: null,
      temperature_sensitive: temperature_sensitive ?? null,
      pieces_per_unit: pieces_per_unit ?? null,
      status_material: null,
      managed_in_batch: managed_in_batch ?? null,
      budget_source: null,
      budget_source_year: null,
      budget_source_price: null,
      total_price_input: null,
      transaction_reason: null,
      other_reason: null,
      other_reason_required: false,
    }
    copyBatches.push(newBatch)
    return copyBatches
  }

  const columns = (managed_in_batch: number = 1) => {
    const data = [
      {
        header: 'SI.No',
        id: 'no',
        size: 64,
      },
      {
        header: t('transactionCreateAddStock:table.column.batch_info', {
          type: managed_in_batch ? 'Batch' : 'Detail',
        }),
        id: 'batch_info',
      },
      {
        header: t('transactionCreateAddStock:table.column.stock_info'),
        id: 'stock_info',
      },
      {
        header: t('transactionCreateAddStock:table.column.activity'),
        id: 'activity',
      },
      {
        header: t('transactionCreateAddStock:table.column.quantity'),
        id: 'quantity',
      },
      {
        header: t('transactionCreateAddStock:table.column.material_status'),
        id: 'material_status',
      },
      {
        header: t('transactionCreateAddStock:table.column.reason'),
        id: 'reason',
      },
      {
        header: t('transactionCreateAddStock:table.column.budget_info'),
        id: 'budget_info',
      },
    ]

    return data
  }
  const { setModalWarning } = useModalWarningStore()
  const checkValidity = async () => {
    const isValid = await methods.trigger()

    if (!isValid) {
      const {
        formState: { errors },
      } = methods
      if (errors.batches?.root?.type === 'at-least-one-change_qty') {
        return setModalWarning(true, t('transactionCreate:alert_save_batch'))
      }
    }
  }

  return {
    methods,
    resetBatch,
    addNewNonBatch,
    columns,
    checkValidity,
  }
}
