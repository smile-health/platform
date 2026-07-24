import Meta from '#components/layouts/Meta'
import Container from '#components/layouts/PageContainer'
import Error403Page from '#pages/error/Error403Page'
import { generateMetaTitle } from '#utils/strings'
import { useFeatureIsOn } from '@growthbook/growthbook-react'
import { useTranslation } from 'react-i18next'

import AnnualCommitmentListHeader from './components/Header'
import AnnualCommitmentListTable from './use-cases/displayData/AnnualCommitmentListTable'
import AnnualCommitmentListFilter from './use-cases/filter/AnnualCommitmentListFilter'

export default function AnnualCommitmentListPage() {
  const isFeatureEnabled = useFeatureIsOn('annual_commitment')
  const { t } = useTranslation('annualCommitmentList')

  if (!isFeatureEnabled) return <Error403Page />

  return (
    <Container title={t('title')} withLayout>
      <Meta title={generateMetaTitle(t('title'))} />
      <div className="ui-space-y-6">
        <AnnualCommitmentListHeader />
        <AnnualCommitmentListFilter />
        <AnnualCommitmentListTable />
      </div>
    </Container>
  )
}
