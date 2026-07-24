'use client'

import { Button } from '#components/button'
import Pencil from '#components/icons/Pencil'
import { RenderDetailValue } from '#components/modules/RenderDetailValue'
import { hasPermission } from '#shared/permission/index'
import { parseDateTime } from '#utils/date'
import { useTranslation } from 'react-i18next'

import { useAnnualCommitmentDetail } from '../../AnnualCommitmentDetailContext'
import { AnnualCommitmentDetailBox } from '../../components/AnnualCommitmentDetailBox'

type AnnualCommitmentDetailInfoProps = {
  onHandleEdit: () => void
}

export default function AnnualCommitmentDetailInfo({
  onHandleEdit,
}: Readonly<AnnualCommitmentDetailInfoProps>) {
  const { t } = useTranslation('annualCommitmentDetail')
  const { data, isLoading } = useAnnualCommitmentDetail()

  const handleEdit = () => {
    onHandleEdit()
  }

  const detailData = [
    {
      label: t('field.contract_number'),
      value: data?.contract?.number || '-',
    },
    {
      label: t('field.contractDate'),
      value:
        parseDateTime(data?.contract_start_date, 'DD MMM YYYY').toUpperCase() ||
        '-',
    },
    {
      label: t('field.contract_end_date'),
      value:
        parseDateTime(data?.contract_end_date, 'DD MMM YYYY').toUpperCase() ||
        '-',
    },
    {
      label: t('field.year'),
      value: data?.year?.toString() || '-',
    },
    {
      label: t('field.supplier'),
      value: data?.vendor?.name || '-',
    },
    {
      label: t('field.information'),
      value: data?.information || '-',
    },
  ]

  return (
    <AnnualCommitmentDetailBox
      title={t('section.detail.title')}
      action={
        hasPermission('annual-commitment-mutate') && (
          <Button
            variant="outline"
            leftIcon={<Pencil className="ui-size-4" />}
            onClick={handleEdit}
          >
            {t('button.edit')}
          </Button>
        )
      }
    >
      <RenderDetailValue data={detailData} loading={isLoading} />
    </AnnualCommitmentDetailBox>
  )
}
