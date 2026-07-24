import { Alert } from '#components/alert'
import Meta from '#components/layouts/Meta'
import Container from '#components/layouts/PageContainer'
import useSmileRouter from '#hooks/useSmileRouter'
import { generateMetaTitle } from '#utils/strings'
import { useTranslation } from 'react-i18next'

import { DisposalInstructionBox } from '../components/DisposalInstructionBox'
import {
  DisposalInstructionDetailConsumer,
  DisposalInstructionDetailProvider,
} from './DisposalInstructionDetailContext'
import { DisposalDetails } from './use-cases/display-disposal-details/DisposalDetails'
import { DisposalItems } from './use-cases/display-disposal-items/DisposalItems'
import { DisposalSenderReceiver } from './use-cases/display-disposal-sender-receiver/DisposalSenderReceiver'
import { Comments } from './use-cases/handle-comments/Comments'

export default function DisposalInstructionDetailPage() {
  const { t } = useTranslation(['common', 'disposalInstructionDetail'])

  const router = useSmileRouter()

  return (
    <DisposalInstructionDetailProvider>
      <DisposalInstructionDetailConsumer>
        {(disposalInstructionDetail) => {
          const pageTitle = disposalInstructionDetail.data?.bast_no
            ? `${t('disposalInstructionDetail:page.title')} - ${disposalInstructionDetail.data.bast_no}`
            : t('disposalInstructionDetail:page.title')

          return (
            <>
              <Meta title={generateMetaTitle(pageTitle)} />
              <Container
                title={pageTitle}
                withLayout
                backButton={{
                  show: true,
                  onClick: () => {
                    router.push('/v5/disposal-instruction')
                  },
                }}
              >
                <div className="space-y-6">
                  {!disposalInstructionDetail.isLoading &&
                    !disposalInstructionDetail.isWmsAvailable && (
                      <Alert type="info" withIcon>
                        {t('disposalInstructionDetail:info.wms_not_available')}
                      </Alert>
                    )}

                  {disposalInstructionDetail.isWmsAvailable && (
                    <DisposalInstructionBox
                      title={t(
                        'disposalInstructionDetail:section.handover_info.title'
                      )}
                    >
                      <div className="ui-grid ui-grid-cols-2 ui-gap-6">
                        <DisposalSenderReceiver type="sender" />
                        <DisposalSenderReceiver type="receiver" />
                      </div>
                    </DisposalInstructionBox>
                  )}

                  <DisposalItems />
                  <DisposalDetails />
                  <Comments />
                </div>
              </Container>
            </>
          )
        }}
      </DisposalInstructionDetailConsumer>
    </DisposalInstructionDetailProvider>
  )
}
