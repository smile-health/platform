import { useFilter } from '#components/filter'
import { useTranslation } from 'react-i18next'

import annualCommitmentListFilterSchema from './AnnualCommitmentListFilter.schema'

export default function useAnnualCommitmentListFilter() {
  const { t } = useTranslation(['common', 'annualCommitmentList'])

  const filter = useFilter(annualCommitmentListFilterSchema(t))

  return filter
}
