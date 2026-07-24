import {
  FilterExpandButton,
  FilterFormBody,
  FilterFormFooter,
  FilterFormRoot,
  FilterResetButton,
  FilterSubmitButton,
} from '#components/filter'

import useDisposalInstructionListTable from '../displayData/useDisposalInstructionListTable'
import DisposalInstructionListExportButton from '../export/DisposalInstructionListExportButton'
import useDisposalInstructionListFilter from './useDisposalInstructionListFilter'

export default function DisposalInstructionListFilter() {
  const disposalInstructionListTable = useDisposalInstructionListTable()
  const disposalInstructionListFilter = useDisposalInstructionListFilter()

  return (
    <FilterFormRoot
      onSubmit={disposalInstructionListFilter.handleSubmit}
      collapsible
    >
      <FilterFormBody className="ui-grid-cols-4">
        {disposalInstructionListFilter.renderField()}
      </FilterFormBody>
      <FilterFormFooter>
        <div>
          <FilterExpandButton />
        </div>
        <div className="ui-flex ui-gap-3 ui-items-center">
          <DisposalInstructionListExportButton />
          <span className="ui-h-[24px] ui-w-px ui-bg-neutral-300" />
          <FilterResetButton
            variant="subtle"
            onClick={disposalInstructionListFilter.reset}
          />
          <FilterSubmitButton
            variant="outline"
            onClick={() =>
              disposalInstructionListTable.pagination.update({ page: 1 })
            }
            className="ui-w-[202px]"
          />
        </div>
      </FilterFormFooter>
      {disposalInstructionListFilter.renderActiveFilter()}
    </FilterFormRoot>
  )
}
