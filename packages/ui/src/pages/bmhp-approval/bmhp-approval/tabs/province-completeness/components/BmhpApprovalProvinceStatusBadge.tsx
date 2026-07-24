import cx from '#lib/cx'
import { useTranslation } from 'react-i18next'

import { ProvinceStatusType } from '../libs/bmhp-approval-province-completeness.type'

type Props = {
  status: ProvinceStatusType
}

const statusClassName: Record<ProvinceStatusType, string> = {
  complete: 'ui-bg-transparent ui-text-success-700 ui-border ui-border-success-500',
  incomplete: 'ui-bg-transparent ui-text-warning-700 ui-border ui-border-warning-500',
  not_submitted: 'ui-bg-transparent ui-text-neutral-600 ui-border ui-border-neutral-400',
}

const BmhpApprovalProvinceStatusBadge: React.FC<Props> = ({ status }) => {
  const { t } = useTranslation('bmhpApproval')

  return (
    <span
      className={cx(
        'ui-inline-flex ui-items-center ui-justify-center ui-px-3 ui-py-1 ui-rounded-full ui-text-xs ui-font-semibold ui-border',
        statusClassName[status]
      )}
    >
      {t(`province_completeness.status.${status}`)}
    </span>
  )
}

export default BmhpApprovalProvinceStatusBadge
