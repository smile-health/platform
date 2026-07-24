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
import cx from '#lib/cx'
import { useTranslation } from 'react-i18next'

type Props = Readonly<{
  grid?: 3 | 4
  filter: ReturnType<typeof useFilter>
  onExport?: VoidFunction
  onSubmit?: VoidFunction
  filteredTime?: {
    label: string
    value: string
  }
  isValidatingRequiredField?: boolean
  isUseDisabledExport?: boolean
  isDisabledSubmit?: boolean
  onResetFilter?: VoidFunction
  expandable?: boolean
}>

export default function DashboardFilter(props: Props) {
  const {
    grid = 4,
    filter,
    onExport,
    onSubmit,
    filteredTime,
    isUseDisabledExport,
    isValidatingRequiredField,
    isDisabledSubmit,
    onResetFilter,
    expandable = true,
  } = props
  const { t } = useTranslation()

  const isDisabledExport = !filter?.formState?.isValid && isUseDisabledExport
  const isDisabled = !filter?.formState?.isValid && isValidatingRequiredField

  return (
    <FilterFormRoot collapsible onSubmit={filter.handleSubmit}>
      <FilterFormBody
        className={cx({
          'ui-grid-cols-3': grid === 3,
          'ui-grid-cols-4': grid === 4,
        })}
      >
        {filter.renderField()}
      </FilterFormBody>
      <FilterFormFooter>
        {expandable ? <FilterExpandButton variant="subtle" /> : <div />}
        <div className="ui-flex ui-gap-2">
          {onExport ? (
            <>
              <Button
                data-testid="btn-export"
                variant="subtle"
                type="button"
                onClick={onExport}
                disabled={isDisabledExport}
                leftIcon={<Export className="ui-size-5" />}
              >
                {t('export')}
              </Button>
              <span className="ui-h-full ui-w-px ui-bg-neutral-300" />
            </>
          ) : (
            <div />
          )}
          <FilterResetButton
            onClick={onResetFilter || filter.reset}
            variant="subtle"
          />
          <FilterSubmitButton
            variant="outline"
            className="ui-w-[202px]"
            text={t('show_report')}
            onClick={() => {
              filter.handleSubmit()
              onSubmit?.()
            }}
            disabled={isDisabledSubmit || isDisabled}
          />
        </div>
      </FilterFormFooter>
      {filter.renderActiveFilter({ filteredTime })}
    </FilterFormRoot>
  )
}
