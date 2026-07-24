import { EmptyState } from '#components/empty-state'
import Meta from '#components/layouts/Meta'
import Container from '#components/layouts/PageContainer'
import { usePermission } from '#hooks/usePermission'
import useSmileRouter from '#hooks/useSmileRouter'
import { hasPermission } from '#shared/permission/index'
import { generateMetaTitle } from '#utils/strings'
import { useTranslation } from 'react-i18next'

import { TicketingSystemStatusEnum } from '../ticketing-system.constant'
import TicketingSystemDetailComment from './components/TicketingSystemDetailComment'
import TicketingSystemDetailFloatingBar from './components/TicketingSystemDetailFloatingBar'
import TicketingSystemDetailReportedItem from './components/TicketingSystemDetailReportedItem'
import TicketingSystemDetailStatus from './components/TicketingSystemDetailStatus'
import useTicketingSystemDetail from './hooks/useTicketingSystemDetail'
import TicketingSystemDetailContext from './libs/ticketing-system-detail.context'

const TicketingSystemDetailPage = () => {
  usePermission('ticketing-system-access-packing-link')

  const {
    t,
    i18n: { language },
  } = useTranslation(['ticketingSystemDetail', 'common'])
  const router = useSmileRouter()
  const detailTicketing = useTicketingSystemDetail(language)

  return (
    <Container
      title={t('ticketingSystemDetail:ticket_details', {
        code: `LK-${detailTicketing?.detail?.id ?? t('common:empty')}`,
      })}
      withLayout
      backButton={{
        show: true,
        onClick: () => {
          router.push('/v5/ticketing-system')
        },
      }}
    >
      <Meta
        title={generateMetaTitle(
          t('ticketingSystemDetail:ticket_details', {
            code: `LK-${detailTicketing?.detail?.id ?? t('common:empty')}`,
          })
        )}
      />
      {detailTicketing?.detail ? (
        <TicketingSystemDetailContext.Provider value={detailTicketing}>
          <TicketingSystemDetailStatus />
          <TicketingSystemDetailReportedItem />
          <TicketingSystemDetailComment />
          {detailTicketing?.detail?.status_id !==
            TicketingSystemStatusEnum.ReportCancelled &&
            hasPermission('ticketing-system-create') && (
              <TicketingSystemDetailFloatingBar />
            )}
        </TicketingSystemDetailContext.Provider>
      ) : (
        <EmptyState
          title={t('common:message.empty.title')}
          description={t('common:message.empty.description')}
          withIcon
        />
      )}
    </Container>
  )
}

export default TicketingSystemDetailPage
