import { Button } from "#components/button"
import {
  FilterExpandButton,
  FilterFormBody,
  FilterFormFooter,
  FilterFormRoot,
  FilterResetButton,
  FilterSubmitButton
} from "#components/filter"
import Export from '#components/icons/Export'
import { useContext } from "react"
import { StockListContext } from "../context/Provider"
import { useTranslation } from "react-i18next"

const StockFilter: React.FC = () => {
  const { t } = useTranslation('common')
  const { filter, setPagination, handleExport } = useContext(StockListContext)

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
            leftIcon={<Export className="ui-size-5" />}
            onClick={handleExport}
          >
            {t('export')}
          </Button>
          <span className="ui-h-full ui-w-px ui-bg-neutral-300" />
          <FilterResetButton onClick={filter.reset} variant="subtle" />
          <FilterSubmitButton onClick={() => setPagination({ page: 1 })} className="ui-w-[220px]" variant="outline"></FilterSubmitButton>
        </div>
      </FilterFormFooter>
      {filter.renderActiveFilter()}
    </FilterFormRoot>
  )
}

export default StockFilter