import Meta from '#components/layouts/Meta'
import Container from '#components/layouts/PageContainer'
import { generateMetaTitle } from '#utils/strings'
import { useTranslation } from 'react-i18next'

import TicketingSystemListHeader from './components/Header'
import { TicketingSystemListProvider } from './TicketingSystemListProvider'
import TicketingSystemListTable from './use-cases/displayData/TicketingSystemListTable'
import TicketingSystemListFilter from './use-cases/filter/TicketingSystemListFilter'

const TicketingSystemListPage = () => {
  const { t } = useTranslation('ticketingSystemList')

  return (
    <TicketingSystemListProvider>
      <Container title={t('title')} withLayout>
        <Meta title={generateMetaTitle(t('title'))} />
        <div className="ui-space-y-6">
          <TicketingSystemListHeader />
          <TicketingSystemListFilter />
          <TicketingSystemListTable />
        </div>
      </Container>
    </TicketingSystemListProvider>
  )
}

export default TicketingSystemListPage
