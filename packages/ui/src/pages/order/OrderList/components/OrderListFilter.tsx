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
import { useSetExportPopupStore } from '#hooks/useSetExportPopup'
import { useTranslation } from 'react-i18next'

import { handleFilterParams } from '../order-list.helper'
import { exportOrder } from '../order-list.service'

type UserFilterProps = {
  filter: ReturnType<typeof useFilter>
  handleChangePage?: (page: number) => void
  isCursor?: boolean
}

export default function OrderListFilter({
  filter,
  handleChangePage,
  isCursor = false,
}: Readonly<UserFilterProps>) {
  const { t } = useTranslation()

  const handleReset = () => {
    if (!isCursor) {
      handleChangePage?.(1)
    }
    filter.reset()
  }

  const filterParams = handleFilterParams(filter?.query)

  const queryKeyExport = ['order-list-export', filterParams]
  const exportQuery = useQuery({
    queryKey: queryKeyExport,
    queryFn: () => exportOrder(filterParams),
    enabled: false,
  })

  useSetExportPopupStore(exportQuery.isSuccess, queryKeyExport)

  return (
    <FilterFormRoot collapsible onSubmit={filter.handleSubmit}>
      <FilterFormBody className="ui-grid-cols-4">
        {filter.renderField()}
      </FilterFormBody>
      <FilterFormFooter>
        <FilterExpandButton variant="subtle" />
        <div className="ui-flex ui-gap-2">
          <Button
            id="btn-export"
            variant="subtle"
            type="button"
            onClick={() => exportQuery.refetch()}
            leftIcon={<Export className="ui-size-5" />}
          >
            {t('export')}
          </Button>
          <span className="ui-h-full ui-w-px ui-bg-neutral-300" />
          <FilterResetButton onClick={handleReset} variant="subtle" />
          <FilterSubmitButton
            className="ui-w-[202px]"
            variant="outline"
            onClick={() => !isCursor && handleChangePage?.(1)}
          />
        </div>
      </FilterFormFooter>
      {filter.renderActiveFilter()}
    </FilterFormRoot>
  )
}
