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
import { ButtonWithDropdown } from '#components/modules/ButtonGroupFilter'
import { useTranslation } from 'react-i18next'

type Props = Readonly<{
  filter: ReturnType<typeof useFilter>
  onSubmit?: VoidFunction
  onExport: VoidFunction
  onExportAll: VoidFunction
}>

export default function LPLPOFilter(props: Props) {
  const { filter, onSubmit, onExport, onExportAll } = props
  const { t } = useTranslation(['common', 'lplpo'])

  const { province, entity, date } = filter.watch()

  const isDisabled = !entity || !date
  const isDisabledExport = !filter?.query?.entity || !filter?.query?.date
  const isDisabledExportAll = !province || !date

  const dropdownList = [
    {
      id: 'btn-export-with-filter',
      label: t('lplpo:export_with_filter'),
      type: ['export', 'download'],
      onClick: () => onExport(),
      disabled: isDisabledExport,
    },
    {
      id: 'btn-export-all-entities',
      label: t('lplpo:export_all_entities'),
      type: ['export', 'download'],
      onClick: () => onExportAll(),
      disabled: isDisabledExportAll,
    },
  ]

  return (
    <FilterFormRoot collapsible onSubmit={filter.handleSubmit}>
      <FilterFormBody className="ui-grid-cols-4">
        {filter.renderField()}
      </FilterFormBody>
      <FilterFormFooter>
        <FilterExpandButton variant="subtle" />
        <div className="ui-flex ui-gap-2">
          <ButtonWithDropdown
            id="btn-export-lplpo"
            variant="subtle"
            leftIcon={<Export className="ui-size-5" />}
            label={t('common:export')}
            dropdownList={dropdownList}
          />
          <span className="ui-h-full ui-w-px ui-bg-neutral-300" />
          <FilterResetButton onClick={filter.reset} variant="subtle" />
          <FilterSubmitButton
            variant="outline"
            className="ui-w-[202px]"
            text={t('show_report')}
            disabled={isDisabled}
            onClick={onSubmit}
          />
        </div>
      </FilterFormFooter>
      {filter.renderActiveFilter()}
    </FilterFormRoot>
  )
}
