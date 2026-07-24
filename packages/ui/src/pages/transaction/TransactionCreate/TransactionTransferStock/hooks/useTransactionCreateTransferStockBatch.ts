import { yupResolver } from '@hookform/resolvers/yup'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { useModalWarningStore } from '../../store/modal-warning.store'
import { formSchemaTransferStockBatch } from '../schema/TransactionCreateTransferStockSchemaForm'
import {
  CreateTransactionBatch,
  CreateTransactionChild,
} from '../transaction-transfer-stock.type'

export default function useTransactionCreateTransferStockBatch() {
  const { t } = useTranslation(['transactionCreate', 'common'])
  const methods = useForm<CreateTransactionChild>({
    resolver: yupResolver(formSchemaTransferStockBatch(t)),
    mode: 'onChange',
    defaultValues: { batches: [] },
  })

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

  type ResetBatch = {
    currentBatch: CreateTransactionBatch[] | undefined | null
  }

  const resetBatch = ({ currentBatch }: ResetBatch) => {
    const batches: CreateTransactionBatch[] | undefined = currentBatch?.map(
      (itm) => {
        const batchTemp: CreateTransactionBatch = {
          ...itm,
          change_qty: null,
        }
        return batchTemp
      }
    )

    return batches
  }

  return {
    methods,
    resetBatch: ({ currentBatch }: ResetBatch) => resetBatch({ currentBatch }),
    checkValidity,
  }
}
