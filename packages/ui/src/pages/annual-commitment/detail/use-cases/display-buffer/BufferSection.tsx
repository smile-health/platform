'use client'

import { useMemo } from 'react'
import { DataTable } from '#components/data-table'
import { useTranslation } from 'react-i18next'

import { DELIVERY_TYPE } from '../../annual-commitment-detail.constant'
import { useAnnualCommitmentDetail } from '../../AnnualCommitmentDetailContext'
import { AnnualCommitmentDetailBox } from '../../components/AnnualCommitmentDetailBox'
import { useBufferTable } from './useBufferTable'

export default function BufferSection() {
  const { t } = useTranslation('annualCommitmentDetail')
  const { data, isLoading } = useAnnualCommitmentDetail()
  const { columns } = useBufferTable()

  const bufferItems = useMemo(() => {
    return (
      data?.items?.filter(
        (item) => item?.delivery_type?.id === DELIVERY_TYPE.Buffer
      ) ?? []
    )
  }, [data])

  return (
    <AnnualCommitmentDetailBox title={t('section.buffer.title')}>
      <DataTable
        data={bufferItems ?? []}
        columns={columns}
        isLoading={isLoading}
      />
    </AnnualCommitmentDetailBox>
  )
}
