'use client'

import { useMemo } from 'react'
import { DataTable } from '#components/data-table'
import { useTranslation } from 'react-i18next'

import { DELIVERY_TYPE } from '../../annual-commitment-detail.constant'
import { useAnnualCommitmentDetail } from '../../AnnualCommitmentDetailContext'
import { AnnualCommitmentDetailBox } from '../../components/AnnualCommitmentDetailBox'
import { useCentralAllocationTable } from './useCentralAllocationTable'

export default function CentralAllocationSection() {
  const { t } = useTranslation('annualCommitmentDetail')
  const { data, isLoading } = useAnnualCommitmentDetail()
  const { columns } = useCentralAllocationTable()

  const allocationItems = useMemo(() => {
    return (
      data?.items?.filter(
        (item) => item?.delivery_type?.id === DELIVERY_TYPE.Allocation
      ) ?? []
    )
  }, [data])

  return (
    <AnnualCommitmentDetailBox title={t('section.centralAllocation.title')}>
      <DataTable
        data={allocationItems ?? []}
        columns={columns}
        isLoading={isLoading}
      />
    </AnnualCommitmentDetailBox>
  )
}
