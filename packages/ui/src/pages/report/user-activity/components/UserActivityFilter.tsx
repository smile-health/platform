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
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'
import { useTranslation } from 'react-i18next'

import { handleFilter } from '../user-activity.helper'
import { getExportEntity } from '../user-activity.service'

type Props = Readonly<{
  filter: ReturnType<typeof useFilter>
  onSearch?: VoidFunction
  isDisabledExport?: boolean
}>

export default function UserActivityFilter(props: Props) {
  const { filter, onSearch, isDisabledExport } = props
  const { t } = useTranslation()

  const params = handleFilter(filter?.query)

  const { isLoading, isFetching, refetch, isSuccess } = useQuery({
    queryKey: ['export-entity', params],
    queryFn: () => getExportEntity(params),
    enabled: false,
  })

  const onExport = () => refetch()

  useSetLoadingPopupStore(isLoading || isFetching)
  useSetExportPopupStore(isSuccess, ['export-entity', params])

  return (
    <FilterFormRoot collapsible onSubmit={filter.handleSubmit}>
      <FilterFormBody className="ui-grid-cols-4">
        {filter.renderField()}
      </FilterFormBody>
      <FilterFormFooter>
        <FilterExpandButton variant="subtle" />
        <div className="ui-flex ui-gap-2">
          <Button
            data-testid="btn-export"
            variant="subtle"
            type="button"
            disabled={isDisabledExport}
            onClick={onExport}
            leftIcon={<Export className="ui-size-5" />}
          >
            {t('export')}
          </Button>
          <span className="ui-h-full ui-w-px ui-bg-neutral-300" />
          <FilterResetButton onClick={filter.reset} variant="subtle" />
          <FilterSubmitButton
            variant="outline"
            className="ui-w-[202px]"
            text={t('show_report')}
            onClick={onSearch}
          />
        </div>
      </FilterFormFooter>
      {filter.renderActiveFilter()}
    </FilterFormRoot>
  )
}
