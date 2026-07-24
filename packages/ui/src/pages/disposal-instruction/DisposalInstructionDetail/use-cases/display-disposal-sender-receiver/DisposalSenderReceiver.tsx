import { RenderDetailValue } from '#components/modules/RenderDetailValue'
import { DisposalInstructionBox } from '#pages/disposal-instruction/components/DisposalInstructionBox'
import { getUserStorage } from '#utils/storage/user'
import { getFullName } from '#utils/strings'
import { useTranslation } from 'react-i18next'

import { useDisposalInstructionDetail } from '../../DisposalInstructionDetailContext'

type DisposalSenderReceiverProps = {
  type: 'sender' | 'receiver'
}

export const DisposalSenderReceiver = ({
  type,
}: DisposalSenderReceiverProps) => {
  const user = getUserStorage()

  const { t } = useTranslation(['disposalInstructionDetail'])
  const disposalInstructionDetail = useDisposalInstructionDetail()

  return (
    <DisposalInstructionBox
      title={
        type === 'sender'
          ? t('disposalInstructionDetail:section.sender.title')
          : t('disposalInstructionDetail:section.receiver.title')
      }
    >
      <RenderDetailValue
        showColon={false}
        className="ui-grid-cols-[150px_1fr] ui-gap-y-2"
        loading={!disposalInstructionDetail.data}
        data={[
          {
            label: `${t('disposalInstructionDetail:data.name')} :`,
            value:
              type === 'sender'
                ? (getFullName(user?.firstname, user?.lastname) ?? '-')
                : (disposalInstructionDetail.data?.receiver.name ?? '-'),
          },
          {
            label: `${t('disposalInstructionDetail:data.unit')} :`,
            value:
              type === 'sender'
                ? (disposalInstructionDetail.data?.sender.unit ?? '-')
                : (disposalInstructionDetail.data?.receiver.unit ?? '-'),
          },
          {
            label: `${t('disposalInstructionDetail:data.entity')} :`,
            value:
              type === 'sender'
                ? disposalInstructionDetail.data?.sender.name
                : disposalInstructionDetail.data?.receiver.entity_name,
          },
          {
            label: `${t('disposalInstructionDetail:data.address')} :`,
            value:
              disposalInstructionDetail.data?.sender.address ??
              disposalInstructionDetail.data?.receiver.address ??
              '-',
            valueClassName: 'ui-uppercase',
          },
        ]}
      />
    </DisposalInstructionBox>
  )
}
