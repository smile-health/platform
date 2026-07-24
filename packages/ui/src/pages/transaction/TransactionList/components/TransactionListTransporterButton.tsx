import React, { useMemo } from 'react'
import Link from 'next/link'
import { Button } from '#components/button'
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRoot,
  DropdownMenuTrigger,
} from '#components/dropdown-menu'
import Plus from '#components/icons/Plus'
import useSmileRouter from '#hooks/useSmileRouter'
import { useTranslation } from 'react-i18next'

import { useTransactionListData } from '../hooks/useTransactionTypeListData'
import { getProgramStorage } from '#utils/storage/program'
import { TRANSACTION_TYPE } from '../../TransactionCreate/transaction-create.constant'

const TransactionListTransporterButton = () => {
  const { t, i18n } = useTranslation(['common', 'transactionList'])
  const { data, isLoading } = useTransactionListData(i18n.language)
  const router = useSmileRouter()

  const program = getProgramStorage()

  const transactionList = useMemo(() => {
    let result = data?.data

    const isTransferStockRestricted = program?.config?.transaction?.is_transfer_stock_restricted ?? true
    if (isTransferStockRestricted) {
      result = result?.filter(x => x.id !== TRANSACTION_TYPE.TRANSFER_STOCK)
    }

    return result || []
  }, [data])

  return (
    <>
      <DropdownMenuRoot>
        <DropdownMenuTrigger>
          <Button
            leftIcon={<Plus className="ui-size-5" />}
            loading={isLoading}
            disabled={isLoading}
          >
            {t('transactionList:transaction_create')}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent id="transaction__list__transporter__dropdown">
          {transactionList.map((item) => (
            <DropdownMenuItem key={item.id}>
              <Link
                href={router.getAsLink(`/v5/transaction/${item.id}/create`)}
                className="ui-px-3 ui-py-2 ui-space-x-2 ui-block"
              >
                {item.title}
              </Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenuRoot>
      <style>{`
        #transaction__list__transporter__dropdown > div {
          padding: 0;
        }
      `}</style>
    </>
  )
}

export default TransactionListTransporterButton
