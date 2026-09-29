import React from 'react'
import {
  FilterFormBody,
  FilterFormFooter,
  FilterFormRoot,
  FilterResetButton,
  FilterSubmitButton,
  useFilter,
} from '#components/filter'

type AuditTrailFilterProps = {
  filter: ReturnType<typeof useFilter>
  handleChangePage: (page: number) => void
}

export default function AuditTrailFilter({
  filter,
  handleChangePage,
}: AuditTrailFilterProps) {
  const handleReset = () => {
    handleChangePage(1)
    filter.reset()
  }

  return (
    <FilterFormRoot collapsible onSubmit={filter.handleSubmit}>
      <FilterFormBody className="ui-grid-cols-4">
        {filter.renderField()}
      </FilterFormBody>
      <FilterFormFooter>
        <div className="ui-flex ui-gap-2">
          <FilterResetButton variant="subtle" onClick={handleReset} />
          <FilterSubmitButton
            variant="outline"
            onClick={() => handleChangePage(1)}
            className="ui-w-[202px]"
          />
        </div>
      </FilterFormFooter>
      {filter.renderActiveFilter()}
    </FilterFormRoot>
  )
}
