import React from 'react'
import cx from 'classnames'
import { useTranslation } from 'react-i18next'

type Props = {
  status: number
}

const BmhpApprovalStatusBadge: React.FC<Props> = ({ status }) => {
  const { t } = useTranslation(['bmhpApproval'])

  const statusClass = cx(
    'ui-px-4 ui-py-2 ui-rounded-full ui-w-fit ui-font-semibold ui-text-sm',
    {
      'ui-text-green-700 ui-bg-green-50': status === 1 || status === 3,
      'ui-text-red-700 ui-bg-red-50': status === 2,
      'ui-text-blue-700 ui-bg-blue-50': status === 0,
    }
  )

  const getLabel = () => {
    switch (status) {
      case 0:
        return t('bmhpApproval:status.ondesk')
      case 1:
      case 3:
        return t('bmhpApproval:status.approved')
      case 2:
        return t('bmhpApproval:status.revision')
      default:
        return '-'
    }
  }

  return <div className={statusClass}>{getLabel()}</div>
}

export default BmhpApprovalStatusBadge
