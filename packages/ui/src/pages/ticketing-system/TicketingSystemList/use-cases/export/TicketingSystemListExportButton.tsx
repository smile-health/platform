import { Button } from '#components/button'
import Export from '#components/icons/Export'
import { useTranslation } from 'react-i18next'

import { useTicketingSystemListContext } from '../../TicketingSystemListProvider'
import useTicketingSystemListExport from './useTicketingSystemListExport'

const TicketingSystemListExportButton = () => {
  const { t } = useTranslation()

  const ticketingSystemList = useTicketingSystemListContext()
  const ticketingSystemListExport = useTicketingSystemListExport({
    params: ticketingSystemList.params,
  })

  return (
    <Button
      id="btn-export"
      variant="outline"
      type="button"
      onClick={() => ticketingSystemListExport.fetch()}
      leftIcon={<Export className="ui-size-5" />}
    >
      {t('export')}
    </Button>
  )
}

export default TicketingSystemListExportButton
