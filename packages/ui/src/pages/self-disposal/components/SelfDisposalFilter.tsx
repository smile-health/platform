import { useQuery } from '@tanstack/react-query'
import { Button } from '#components/button'
import {
  FilterExpandButton,
  FilterFormBody,
  FilterFormFooter,
  FilterFormRoot,
  FilterResetButton,
  FilterSubmitButton,
  useFilter,
} from '#components/filter'
import Export from '#components/icons/Export'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'
import { useTranslation } from 'react-i18next'

import { getSelfDisposalilter } from '../self-disposal.helper'
import { exportSelfDisposal } from '../self-disposal.service'
// import { exportSelfDisposal } from '../self-disposal.service'

type UserFilterProps = {
  page: number
  paginate: number
  filter: ReturnType<typeof useFilter>
  handleChangePage: (page: number) => void
}

const SelfDisposalFilter = ({
  page,
  paginate,
  filter,
  handleChangePage,
}: Readonly<UserFilterProps>) => {
  const { t } = useTranslation()

  const exportFilter = getSelfDisposalilter(true, {
    page,
    paginate,
    ...filter?.query,
  })

  const { refetch: onExport, isLoading: isLoadingExport } = useQuery({
    queryKey: ['self-disposal-export', exportFilter],
    queryFn: () => exportSelfDisposal(exportFilter),
    enabled: false,
  })

  const handleReset = () => {
    handleChangePage(1)
    filter.reset()
  }
  useSetLoadingPopupStore(isLoadingExport)
  return (
    <FilterFormRoot collapsible onSubmit={filter.handleSubmit}>
      <FilterFormBody className="ui-grid-cols-4">
        {filter.renderField()}
      </FilterFormBody>
      <FilterFormFooter>
        <FilterExpandButton />
        <div className="ui-flex ui-gap-2">
          <Button
            id="btn-export"
            variant="subtle"
            type="button"
            onClick={() => onExport()}
            leftIcon={<Export className="ui-size-5" />}
          >
            {t('export')}
          </Button>
          <span className="ui-h-full ui-w-px ui-bg-neutral-300" />
          <FilterResetButton onClick={handleReset} variant="subtle" />
          <FilterSubmitButton
            onClick={() => handleChangePage(1)}
            className="ui-w-[202px]"
            variant="outline"
          />
        </div>
      </FilterFormFooter>
      {filter.renderActiveFilter()}
    </FilterFormRoot>
  )
}

export default SelfDisposalFilter
