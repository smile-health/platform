import React from 'react'
import cx from 'classnames'
import { TFunction } from 'i18next'
import { useTranslation } from 'react-i18next'

export type BmhpHistoryStatus = 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'FINAL' | 'ACTIVE' | 'INACTIVE'

type BmhpHistoryStatusCapsuleProps = {
  status: BmhpHistoryStatus
}

type StatusConfig = {
  textClass: string
  bgClass: string
  label: string
}

const getStatusConfig = (
  t: TFunction<['masterBmhp']>
): Record<BmhpHistoryStatus, StatusConfig> => ({
  DRAFT: {
    textClass: 'ui-text-gray-700',
    bgClass: 'ui-bg-gray-100',
    label: t('masterBmhp:status.draft'),
  },
  FINAL: {
    textClass: 'ui-text-green-700',
    bgClass: 'ui-bg-green-100',
    label: t('masterBmhp:status.final'),
  },
  SUBMITTED: {
    textClass: 'ui-text-blue-700',
    bgClass: 'ui-bg-blue-100',
    label: t('masterBmhp:status.submitted'),
  },
  APPROVED: {
    textClass: 'ui-text-green-700',
    bgClass: 'ui-bg-green-100',
    label: t('masterBmhp:status.approved'),
  },
  REJECTED: {
    textClass: 'ui-text-red-700',
    bgClass: 'ui-bg-red-100',
    label: t('masterBmhp:status.rejected'),
  },
  ACTIVE: {
    textClass: 'ui-text-green-700',
    bgClass: 'ui-bg-green-100',
    label: t('masterBmhp:common.active'),
  },
  INACTIVE: {
    textClass: 'ui-text-red-700',
    bgClass: 'ui-bg-red-100',
    label: t('masterBmhp:common.inactive'),
  },
})

const BmhpHistoryStatusCapsule = ({
  status,
}: BmhpHistoryStatusCapsuleProps) => {
  const { t } = useTranslation(['masterBmhp'])
  const statusConfig = getStatusConfig(t)
  const config = statusConfig[status] ?? statusConfig['DRAFT']

  return (
    <div
      className={cx(
        'ui-px-4 ui-py-2 ui-rounded-full ui-w-fit ui-font-semibold',
        config.textClass,
        config.bgClass
      )}
    >
      {config.label}
    </div>
  )
}

export default BmhpHistoryStatusCapsule
