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
import { useTranslation } from 'react-i18next'

import { DefaultDashboardSelection } from '../dashboard-smile-smdv.constant'

type Props = Readonly<{
  filter: ReturnType<typeof useFilter>
  onSearch?: VoidFunction
  onExport?: VoidFunction
  setDefaultDashboard: (dashboard: DefaultDashboardSelection) => void
}>

export default function DashboardSmileSmdvFilter(props: Props) {
  const { filter, onSearch, onExport, setDefaultDashboard } = props
  const { t } = useTranslation()

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
            onClick={onExport}
            leftIcon={<Export className="ui-size-5" />}
          >
            {t('export')}
          </Button>
          <span className="ui-h-full ui-w-px ui-bg-neutral-300" />
          <FilterResetButton
            onClick={() => {
              setDefaultDashboard(DefaultDashboardSelection.SMDV_VS_SMILE)
              filter.reset()
            }}
            variant="subtle"
          />
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
