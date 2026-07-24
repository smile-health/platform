import {
  FilterExpandButton,
  FilterFormBody,
  FilterFormFooter,
  FilterFormRoot,
  FilterResetButton,
  FilterSubmitButton,
  useFilter,
} from '#components/filter'
import { useTranslation } from 'react-i18next'

type Props = Readonly<{
  filter: ReturnType<typeof useFilter>
  onSearch?: VoidFunction
}>

export default function ReconciliationFilter(props: Props) {
  const { filter, onSearch } = props
  const { t } = useTranslation()

  return (
    <FilterFormRoot collapsible onSubmit={filter.handleSubmit}>
      <FilterFormBody className="ui-grid-cols-4">
        {filter.renderField()}
      </FilterFormBody>
      <FilterFormFooter>
        <FilterExpandButton variant="subtle" />
        <div className="ui-flex ui-gap-2">
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
