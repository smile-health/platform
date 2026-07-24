'use client'

import { useParams } from 'next/navigation'
import Meta from '#components/layouts/Meta'
import Container from '#components/layouts/PageContainer'
import useSmileRouter from '#hooks/useSmileRouter'
import Error403Page from '#pages/error/Error403Page'
import { generateMetaTitle } from '#utils/strings'
import { useFeatureIsOn } from '@growthbook/growthbook-react'
import { useTranslation } from 'react-i18next'

import { AnnualCommitmentDetailProvider } from './AnnualCommitmentDetailContext'
import BufferSection from './use-cases/display-buffer/BufferSection'
import CentralAllocationSection from './use-cases/display-central-allocation/CentralAllocationSection'
import AnnualCommitmentDetailInfo from './use-cases/display-detail-info/AnnualCommitmentDetailInfo'

export default function AnnualCommitmentDetailPage() {
  const isFeatureEnabled = useFeatureIsOn('annual_commitment')
  const { t } = useTranslation(['annualCommitmentDetail'])
  const router = useSmileRouter()
  const params = useParams()
  const id = params.id as string

  if (!isFeatureEnabled) return <Error403Page />

  const pageTitle = t('annualCommitmentDetail:page.title')

  return (
    <AnnualCommitmentDetailProvider>
      <Meta title={generateMetaTitle(pageTitle)} />
      <Container
        title={pageTitle}
        withLayout
        backButton={{
          show: true,
          onClick: () => {
            router.push('/v5/annual-commitment')
          },
        }}
      >
        <div className="ui-space-y-6">
          <AnnualCommitmentDetailInfo
            onHandleEdit={() => router.push(`/v5/annual-commitment/${id}/edit`)}
          />
          <CentralAllocationSection />
          <BufferSection />
        </div>
      </Container>
    </AnnualCommitmentDetailProvider>
  )
}
