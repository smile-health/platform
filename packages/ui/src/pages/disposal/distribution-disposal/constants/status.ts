import { TFunction } from 'i18next'

export enum STATUS_DISTRIBUTION_DISPOSAL {
  SENT = 4,
  APPROVED = 5,
  CANCELLED = 6,
}

export const statusFilterOptions = (
  t: TFunction<['common', 'distributionDisposal']>
) => [
  {
    label: t('distributionDisposal:filter.status.shipped'),
    value: STATUS_DISTRIBUTION_DISPOSAL.SENT,
  },
  {
    label: t('distributionDisposal:filter.status.fulfilled'),
    value: STATUS_DISTRIBUTION_DISPOSAL.APPROVED,
  },
  {
    label: t('distributionDisposal:filter.status.cancelled'),
    value: STATUS_DISTRIBUTION_DISPOSAL.CANCELLED,
  },
]
