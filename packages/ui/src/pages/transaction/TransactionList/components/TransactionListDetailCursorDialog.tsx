import React from 'react'
import { Button } from '#components/button'
import {
  Dialog,
  DialogCloseButton,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from '#components/dialog'
import { useTranslation } from 'react-i18next'

import TransactionListBatchBox from './TransactionListBatchBox'
import TransactionListMaterialIdentityBox from './TransactionListMaterialIdentityBox'
import TransactionListPatientBox from './TransactionListPatientBox'
import TransactionListTimestampBox from './TransactionListTimestampBox'

import 'dayjs/locale/id'
import 'dayjs/locale/en'

import cx from '#lib/cx'

import AddSideEffectDialog from './AddSideEffectDialog'
import useTransactionCursorDetail from './hooks/useTransactionCursorDetail'
import TransactionDetailSkeleton from './TransactionDetailSkeleton'
import TransactionListDiseaseHistoryBox from './TransactionListDiseaseHistoryBox'
import TransactionListSideEffectBox from './TransactionListSideEffectBox'
import TransactionListVaccineBox from './TransactionListVaccineBox'

const TransactionListDetailCursorDialog = () => {
  const { t } = useTranslation(['common', 'transactionList'])

  const {
    detailTransactionData,
    isFetchingDetailTransaction,
    isOpenDetail,
    isOpenSideEffect,
    patientData,
    handleCloseDetail,
    setIsOpenSideEffect,
    onChangePatient,
  } = useTransactionCursorDetail()

  return (
    <>
      {detailTransactionData?.data?.protocol.is_kipi && (
        <AddSideEffectDialog
          isOpen={isOpenSideEffect}
          onClose={() => setIsOpenSideEffect(false)}
          consumptionId={detailTransactionData.data.consumption_id}
          actualTransactionDate={
            detailTransactionData.data.transaction.actual_transaction_date
          }
        />
      )}

      <Dialog open={isOpenDetail} size="lg">
        <DialogCloseButton onClick={handleCloseDetail} />
        <DialogHeader className="ui-my-2">
          <h3 className="ui-text-center ui-text-xl ui-font-medium">
            {t('transactionList:transaction_detail')}
          </h3>
        </DialogHeader>
        <div className="ui-h-1 ui-border-t ui-border-neutral-300" />
        <DialogContent className="ui-overflow-auto ui-my-2 ui-py-2 styled-scroll ui-scroll-pr-2">
          {isFetchingDetailTransaction && <TransactionDetailSkeleton />}

          {detailTransactionData?.data?.transaction && (
            <TransactionListMaterialIdentityBox
              transaction={detailTransactionData.data.transaction}
            />
          )}

          {detailTransactionData?.data?.transaction && (
            <div className="ui-my-6">
              <TransactionListBatchBox
                transaction={detailTransactionData.data.transaction}
                stock={detailTransactionData.data.stock}
              />
            </div>
          )}

          {detailTransactionData?.data &&
            detailTransactionData.data.patients.length > 1 && (
              <div className="flex">
                {detailTransactionData.data.patients.map((patient, index) => (
                  <button
                    key={patient.identity?.patient_id}
                    className={cx(
                      'ui-text-base ui-font-bold ui-py-2 ui-px-4 ui-border-black',
                      {
                        'ui-border-b-4':
                          patientData?.identity?.patient_id ===
                          patient.identity?.patient_id,
                      }
                    )}
                    onClick={() =>
                      onChangePatient(patient.identity?.patient_id as number)
                    }
                  >
                    {t('transactionList:batch_columns.patient')} {index + 1}
                  </button>
                ))}
              </div>
            )}

          {patientData?.vaccination && (
            <div className="ui-my-6">
              <TransactionListVaccineBox
                vaccination={patientData.vaccination}
                protocol={detailTransactionData?.data.protocol}
              />
            </div>
          )}

          {detailTransactionData?.data?.protocol.is_kipi && (
            <div className="ui-my-6">
              <TransactionListSideEffectBox
                onAddSideEffect={() => setIsOpenSideEffect(true)}
                sideEffects={
                  detailTransactionData.data.consumption.kipi_history || []
                }
              />
            </div>
          )}

          {patientData && (
            <div className="ui-my-6">
              <TransactionListPatientBox patient={patientData} />
            </div>
          )}

          {detailTransactionData?.data?.protocol.is_medical_history && (
            <div className="ui-my-6">
              <TransactionListDiseaseHistoryBox
                diseaseHistory={
                  detailTransactionData?.data.consumption
                    .disease_history_prevention
                }
              />
            </div>
          )}

          {detailTransactionData?.data?.transaction && (
            <TransactionListTimestampBox
              transaction={detailTransactionData.data.transaction}
            />
          )}
        </DialogContent>
        <div className="ui-h-1 ui-border-t ui-border-neutral-300" />
        <DialogFooter>
          <Button
            color="primary"
            variant="outline"
            className="ui-w-full"
            onClick={handleCloseDetail}
          >
            {t('common:close')}
          </Button>
        </DialogFooter>
      </Dialog>
      <style>{`
      .styled-scroll::-webkit-scrollbar {
        width: 10px;
      }
      .styled-scroll::-webkit-scrollbar-track {
        background: #f1f1f1;
      }
      .styled-scroll::-webkit-scrollbar-thumb {
        background: #888;
      }
      .styled-scroll::-webkit-scrollbar-thumb:hover {
        background: #555;
      }
    `}</style>
    </>
  )
}

export default TransactionListDetailCursorDialog
