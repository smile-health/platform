import { useEffect, useRef } from 'react'
import {
  FilterExpandButton,
  FilterFormBody,
  FilterFormFooter,
  FilterFormRoot,
  FilterResetButton,
  FilterSubmitButton,
} from '#components/filter'

import { useStorageTemperatureMonitoringList } from '../../StorageTemperatureMonitoringListContext'
import { ListExportButton } from '../export/ListExportButton'
import { useListFilter } from './useListFilter'

export const ListFilter = () => {
  const filter = useListFilter()

  const storageTemperatureMonitoringList = useStorageTemperatureMonitoringList()

  const isWarehouse = storageTemperatureMonitoringList?.isWarehouse
  const prevIsWarehouseRef = useRef(isWarehouse)

  useEffect(() => {
    if (prevIsWarehouseRef.current !== isWarehouse) {
      filter.reset()
    }

    prevIsWarehouseRef.current = isWarehouse
  }, [isWarehouse, filter.reset])

  return (
    <FilterFormRoot collapsible onSubmit={filter.handleSubmit}>
      <FilterFormBody className="ui-grid-cols-4">
        {filter.renderField()}
      </FilterFormBody>
      <FilterFormFooter>
        <div>
          <FilterExpandButton />
        </div>
        <div className="ui-space-x-3 ui-flex ui-gap-1 ui-justify-center flex items-center">
          <ListExportButton />
          <span className="ui-h-[24px] ui-w-px ui-bg-neutral-300" />
          <FilterResetButton onClick={filter.reset} variant="subtle" />
          <FilterSubmitButton
            onClick={() => filter.pagination.set({ page: 1 })}
            variant="outline"
            className="ui-w-56"
          />
        </div>
      </FilterFormFooter>
      {filter.renderActiveFilter()}
    </FilterFormRoot>
  )
}
