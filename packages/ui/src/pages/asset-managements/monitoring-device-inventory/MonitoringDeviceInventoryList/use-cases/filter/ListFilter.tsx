import {
  FilterExpandButton,
  FilterFormBody,
  FilterFormFooter,
  FilterFormRoot,
  FilterResetButton,
  FilterSubmitButton,
} from '#components/filter'

import { ListExportButton } from '../export/ListExportButton'
import { useListFilter } from './useListFilter'

export const ListFilter = () => {
  const filter = useListFilter()

  return (
    <FilterFormRoot collapsible onSubmit={filter.handleSubmit}>
      <FilterFormBody className="ui-grid-cols-4">
        {filter.renderField()}
      </FilterFormBody>
      <FilterFormFooter>
        <div>
          <FilterExpandButton />
        </div>
        <div className="ui-space-x-3 ui-gap-1 ui-flex ui-items-center">
          <ListExportButton />
          <span className="ui-h-[24px] ui-w-px ui-bg-neutral-300" />
          <FilterResetButton onClick={filter.reset} variant="subtle" />
          <FilterSubmitButton
            onClick={() => filter.handleSubmit()}
            variant="outline"
            className="ui-w-56"
          />
        </div>
      </FilterFormFooter>
      {filter.renderActiveFilter()}
    </FilterFormRoot>
  )
}
