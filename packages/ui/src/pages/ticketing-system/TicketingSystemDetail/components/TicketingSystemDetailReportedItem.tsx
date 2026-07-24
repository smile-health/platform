import { useContext } from 'react'
import { DataTable } from '#components/data-table'
import { useTranslation } from 'react-i18next'

import TicketingSystemDeatilContext from '../libs/ticketing-system-detail.context'
import { itemReportedColumns } from './TicketingSystemDetailBunchOfColumns'

export default function TicketingSystemDetailReportedItem() {
  const {
    t,
    i18n: { language },
  } = useTranslation(['ticketingSystem', 'ticketingSystemDetail'])

  const { detail } = useContext(TicketingSystemDeatilContext)

  return (
    <div className="ui-mb-6 ui-p-6 ui-border ui-border-neutral-300 ui-rounded">
      <h2 className="ui-mb-6 ui-text-base ui-font-bold ui-text-dark-teal ui-cursor-default">
        {t('ticketingSystem:title.detail.reported_item')}
      </h2>
      <DataTable
        data={detail?.items}
        columns={itemReportedColumns(t, language)}
      />
    </div>
  )
}
