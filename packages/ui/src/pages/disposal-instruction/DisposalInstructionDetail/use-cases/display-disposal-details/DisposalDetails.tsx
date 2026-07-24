import {
  DataPair,
  RenderDetailValue,
} from '#components/modules/RenderDetailValue'
import cx from '#lib/cx'
import { DisposalInstructionBox } from '#pages/disposal-instruction/components/DisposalInstructionBox'
import { getFullName } from '#utils/strings'
import dayjs from 'dayjs'
import { useTranslation } from 'react-i18next'

import { useDisposalInstructionDetail } from '../../DisposalInstructionDetailContext'

export const DisposalDetails = () => {
  const { t } = useTranslation(['disposalInstructionDetail'])
  const disposalInstructionDetail = useDisposalInstructionDetail()

  const data: DataPair[] = [
    {
      label: t('disposalInstructionDetail:data.bast_no'),
      value: disposalInstructionDetail.data?.bast_no ?? '-',
    },
    {
      label: t('disposalInstructionDetail:data.instruction_type'),
      value: disposalInstructionDetail.data?.instruction_type_label ?? '-',
    },
    {
      label: t('disposalInstructionDetail:data.activity'),
      value: disposalInstructionDetail.data?.activity.name ?? '-',
    },
    {
      label: t('disposalInstructionDetail:data.created_at'),
      value: disposalInstructionDetail.data?.created_at
        ? dayjs(disposalInstructionDetail.data?.created_at).format(
            'DD MMM YYYY'
          )
        : '-',
    },
    {
      label: t('disposalInstructionDetail:data.created_by'),
      value: getFullName(
        disposalInstructionDetail.data?.user_created_by?.firstname,
        disposalInstructionDetail.data?.user_created_by?.lastname
      ),
    },
  ]

  return (
    <DisposalInstructionBox
      title={t('disposalInstructionDetail:section.details.title')}
    >
      <RenderDetailValue
        className={cx('ui-gap-y-2.5 ui-grid-cols-[200px_3px_1fr]')}
        valuesClassName={cx('ui-font-bold ui-text-dark-teal')}
        loading={Boolean(!disposalInstructionDetail.data)}
        data={data}
      />
    </DisposalInstructionBox>
  )
}
