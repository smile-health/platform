import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid'
import { useTranslation } from 'react-i18next'

import { CompletenessScreeningStatus } from '../libs/bmhp-approval-province-completeness.type'

type Props = {
  status: CompletenessScreeningStatus
}

const StatusIcon: React.FC<Props> = ({ status }) => {
  const { t } = useTranslation(['bmhpApproval'])

  switch (status) {
    case 'complete': {
      return (
        <CheckCircleIcon
          className="ui-w-5 ui-h-5 ui-text-success-500 ui-mx-auto"
          title={t('bmhpApproval:completeness.status_complete')}
        />
      )
    }
    case 'incomplete': {
      return (
        <XCircleIcon
          className="ui-w-5 ui-h-5 ui-text-neutral-400 ui-mx-auto"
          title={t('bmhpApproval:completeness.status_incomplete')}
        />
      )
    }
    default: {
      return <span className="ui-text-neutral-300">—</span>
    }
  }
}

export default StatusIcon
