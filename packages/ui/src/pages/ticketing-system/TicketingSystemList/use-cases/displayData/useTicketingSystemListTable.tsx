import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import ticketingSystemListTableSchema from './TicketingSystemListTable.schema'

const useTicketingSystemListTable = () => {
  const { t } = useTranslation('ticketingSystemList')
  const columns = useMemo(() => ticketingSystemListTableSchema(t), [t])
  return {
    columns,
  }
}

export default useTicketingSystemListTable
