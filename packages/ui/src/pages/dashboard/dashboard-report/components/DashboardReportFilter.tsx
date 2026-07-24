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
import { ProgramEnum } from '#constants/program'
import { getProgramStorage } from '#utils/storage/program'
import { useTranslation } from 'react-i18next'

type Props = Readonly<{
  filter: ReturnType<typeof useFilter>
  onSubmit?: VoidFunction
  onExport?: VoidFunction
  onExportAll?: VoidFunction
}>

export default function DashboardReportFilter(props: Props) {
  const { filter, onSubmit, onExport, onExportAll } = props
  const { t } = useTranslation(['common', 'dashboardReport'])

  const program = getProgramStorage()

  const { province, entity, date } = filter.watch()

  const isDisabled = !entity || !date
  const isDisabledExport = !filter?.query?.entity || !filter?.query?.date
  const isDisabledExportAll = !province || !date

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
          <Button
            data-testid="btn-export"
            variant="subtle"
            type="button"
            disabled={isDisabledExportAll}
            onClick={onExportAll}
            leftIcon={<Export className="ui-size-5" />}
          >
            {t('dashboardReport:export_all_entities')}
          </Button>
          <span className="ui-h-full ui-w-px ui-bg-neutral-300" />
          <FilterResetButton onClick={filter.reset} variant="subtle" />
          <FilterSubmitButton
            variant="outline"
            className="ui-w-[202px]"
            text={t('show_report')}
            disabled={isDisabled || program?.key !== ProgramEnum.Immunization}
            onClick={onSubmit}
          />
        </div>
      </FilterFormFooter>
      {filter.renderActiveFilter()}
    </FilterFormRoot>
  )
}
