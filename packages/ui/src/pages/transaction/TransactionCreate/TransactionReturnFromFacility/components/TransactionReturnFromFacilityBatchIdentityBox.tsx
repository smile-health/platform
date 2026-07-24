import React, { useContext } from 'react'
import { DataTable } from '#components/data-table'
import { BOOLEAN } from '#constants/common'
import { parseDateTime } from '#utils/date'
import { useTranslation } from 'react-i18next'

import { useTransactionCreateReturnFromFacility } from '../hooks/useTransactionCreateReturnFromFacility'
import TransactionReturnFromFacilityContext from '../transaction-return-from-facility.context'
import { TTransactionReturnFacilityConsumptionData } from '../transaction-return-from-facility.type'
import { detailColumn } from './TransactionReturnFromFacilityConsumptionColumn'
import TransactionReturnFromFacilityFieldBox from './TransactionReturnFromFacilityFieldBox'

const TransactionReturnFromFacilityBatchIdentityBox = () => {
  const { t, i18n } = useTranslation(['transactionCreate', 'common'])
  const locale = i18n.language
  const { handleDeleteTransaction } = useTransactionCreateReturnFromFacility(t)

  const { stockData, setStockData } = useContext(
    TransactionReturnFromFacilityContext
  )

  const handleRemoveData = () => {
    if (stockData) {
      handleDeleteTransaction(stockData?.index as number)
      setTimeout(() => {
        setStockData(null)
      }, 300)
    }
  }

  return (
    <>
      <div className="ui-grid ui-grid-cols-[40%_20%_20%_20%] ui-gap-4 ui-my-4">
        <div className="ui-w-96">
          <TransactionReturnFromFacilityFieldBox
            title={t(
              'transactionCreate:transaction_return_from_facility.input_table.column.material'
            )}
            subTitle={stockData?.material?.name ?? '-'}
          />
        </div>
        <div className="ui-w-auto">
          <TransactionReturnFromFacilityFieldBox
            title={t(
              'transactionCreate:transaction_return_from_facility.input_table.detail_column.batch_code'
            )}
            subTitle={stockData?.stock?.batch?.code ?? '-'}
          />
        </div>
        <div className="ui-w-auto">
          <TransactionReturnFromFacilityFieldBox
            title={t(
              'transactionCreate:transaction_return_from_facility.input_table.detail_column.manufacturer'
            )}
            subTitle={stockData?.stock?.batch?.manufacture?.name ?? '-'}
          />
        </div>
        <div className="ui-w-auto">
          <TransactionReturnFromFacilityFieldBox
            title={t(
              'transactionCreate:transaction_return_from_facility.input_table.detail_column.expired_date'
            )}
            subTitle={parseDateTime(
              stockData?.stock?.batch?.expired_date as string,
              'DD MMM YYYY',
              locale
            )?.toUpperCase()}
          />
        </div>
      </div>
      <DataTable
        data={[stockData]}
        columns={detailColumn({
          t,
          language: locale,
          isPatient:
            (stockData as TTransactionReturnFacilityConsumptionData)?.patients
              ?.length > 0,
          isOpenVial:
            Number(stockData?.material?.is_open_vial) === BOOLEAN.TRUE,
          handleRemoveData,
        })}
        className="ui-max-h-[464px]"
        isSticky
      />
    </>
  )
}

export default TransactionReturnFromFacilityBatchIdentityBox
