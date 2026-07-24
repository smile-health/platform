import { Button } from '#components/button'
import {
  FilterExpandButton,
  FilterFormBody,
  FilterFormFooter,
  FilterFormRoot,
  FilterResetButton,
} from '#components/filter'
import { useTranslation } from 'react-i18next'

import ColdStorageCapacityExportButton from '../export/ColdStorageCapacityExportButton'
import useColdStorageCapacityFilter from './useColdStorageCapacityFilter'

export default function ColdStorageCapacityFilter() {
  const { t } = useTranslation('coldStorageCapacity')
  const coldStorageCapacityFilter = useColdStorageCapacityFilter()

  const handleReset = () => {
    coldStorageCapacityFilter.reset()
  }

  return (
    <FilterFormRoot
      onSubmit={coldStorageCapacityFilter.handleSubmit}
      collapsible
    >
      <FilterFormBody className="ui-grid-cols-4">
        {coldStorageCapacityFilter.renderField()}
      </FilterFormBody>
      <FilterFormFooter>
        <div>
          <FilterExpandButton />
        </div>
        <div className="ui-flex ui-gap-3 ui-items-center">
          <ColdStorageCapacityExportButton />
          <span className="ui-h-[24px] ui-w-px ui-bg-neutral-300" />
          <FilterResetButton variant="subtle" onClick={handleReset} />
          <Button type="submit" variant="outline" className="ui-w-[202px]">
            {t('button.showReport')}
          </Button>
        </div>
      </FilterFormFooter>
      {coldStorageCapacityFilter.renderActiveFilter()}
    </FilterFormRoot>
  )
}
