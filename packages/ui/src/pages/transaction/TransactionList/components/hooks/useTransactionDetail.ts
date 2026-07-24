import { useContext, useEffect, useState } from 'react'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { Patient } from '#types/transaction'

import { getDetailTransaction } from '../../../transaction.services'
import TransactionListContext from '../../helpers/transaction-list.context'

export default function useTransactionDetail() {
  const { transactionData, setTransactionData } = useContext(
    TransactionListContext
  )
  const [isOpenDetail, setIsOpenDetail] = useState(false)
  const [isOpenSideEffect, setIsOpenSideEffect] = useState(false)

  const {
    data: detailTransactionData,
    isFetching: isFetchingDetailTransaction,
  } = useQuery({
    queryKey: ['detail-transaction', transactionData?.id],
    queryFn: () => getDetailTransaction(transactionData?.id as number),
    placeholderData: keepPreviousData,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    enabled: Boolean(transactionData?.id),
  })

  useEffect(() => {
    if (transactionData) setIsOpenDetail(true)
  }, [transactionData])

  const handleCloseDetail = () => {
    setIsOpenDetail(false)
    setTimeout(() => {
      setTransactionData(null)
    }, 300)
  }

  const [patientData, setPatientData] = useState<Patient | null>(null)

  useEffect(() => {
    if (detailTransactionData?.data?.patients.length) {
      setPatientData(detailTransactionData.data.patients[0])
    } else {
      setPatientData(null)
    }
  }, [detailTransactionData?.data])

  const onChangePatient = (patientId: number) => {
    if (detailTransactionData?.data) {
      const patient = detailTransactionData?.data.patients.find(
        (patient) => patient.identity?.patient_id === patientId
      ) as Patient
      setPatientData(patient)
    }
  }

  return {
    detailTransactionData: isFetchingDetailTransaction
      ? null
      : detailTransactionData,
    isFetchingDetailTransaction,
    isOpenDetail,
    isOpenSideEffect,
    patientData: isFetchingDetailTransaction ? null : patientData,
    handleCloseDetail,
    setIsOpenSideEffect,
    onChangePatient,
  }
}
