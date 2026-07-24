import {
  FilterExpandButton,
  FilterFormBody,
  FilterFormFooter,
  FilterFormRoot,
  FilterResetButton,
  FilterSubmitButton,
} from '#components/filter'

import { useTicketingSystemListContext } from '../../TicketingSystemListProvider'
import TicketingSystemListExportButton from '../export/TicketingSystemListExportButton'

export default function TicketingSystemListFilter() {
  const ticketingSystemList = useTicketingSystemListContext()

  const handleReset = () => {
    ticketingSystemList.pagination.update({ page: 1 })
    ticketingSystemList.filter.reset()
  }

  return (
    <FilterFormRoot
      collapsible
      onSubmit={ticketingSystemList.filter.handleSubmit}
    >
      <FilterFormBody className="ui-grid-cols-4">
        {ticketingSystemList.filter.renderField()}
      </FilterFormBody>
      <FilterFormFooter>
        <FilterExpandButton />
        <div className="ui-flex ui-gap-2">
          <TicketingSystemListExportButton />
          <span className="ui-h-full ui-w-px ui-bg-neutral-300" />
          <FilterResetButton onClick={handleReset} />
          <FilterSubmitButton
            variant="outline"
            onClick={() => ticketingSystemList.pagination.update({ page: 1 })}
            className="ui-w-[202px]"
          />
        </div>
      </FilterFormFooter>
      {ticketingSystemList.filter.renderActiveFilter()}
    </FilterFormRoot>
  )
}
