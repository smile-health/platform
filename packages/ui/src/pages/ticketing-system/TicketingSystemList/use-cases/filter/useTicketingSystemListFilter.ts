import { useMemo } from 'react'
import { useFilter } from '#components/filter'
import { useTranslation } from 'react-i18next'

import ticketingSystemFilterSchema from './TicketingSystemListFilter.schema'

const useTicketingSystemListFilter = () => {
  const { t } = useTranslation(['common', 'ticketingSystemList'])
  const schema = useMemo(() => ticketingSystemFilterSchema(t), [t])
  const filter = useFilter(schema)
  return filter
}

export default useTicketingSystemListFilter
