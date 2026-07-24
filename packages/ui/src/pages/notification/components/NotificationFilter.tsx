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
import Download from '#components/icons/Download'
import Export from '#components/icons/Export'
import Import from '#components/icons/Import'
import ModalError from '#components/modules/ModalError'
import { ModalImport } from '#components/modules/ModalImport'
import cx from '#lib/cx'
import { CommonType } from '#types/common'
import { useTranslation } from 'react-i18next'

type Props = CommonType & {
  page: number
  paginate: number
  filter: ReturnType<typeof useFilter>
  handleChangePage: (page: number) => void
}

export default function NotificationFilter({
  page,
  paginate,
  filter,
  isGlobal,
  handleChangePage,
}: Props) {
  const { t } = useTranslation()

  const handleReset = () => {
    handleChangePage(1)
    filter.reset()
  }

  const renderButtonFilter = () => {
    return (
      <div className="ui-flex ui-gap-2">
        <FilterResetButton onClick={handleReset} variant="subtle" />
        <FilterSubmitButton
          onClick={() => handleChangePage(1)}
          className="ui-w-[202px]"
          variant="outline"
          data-testid="btn-filter-manufacturer"
        />
      </div>
    )
  }

  return (
    <FilterFormRoot collapsible onSubmit={filter.handleSubmit}>
      <FilterFormBody className="ui-grid-cols-4">
        {filter.renderField()}
      </FilterFormBody>

      <FilterFormFooter>
        <FilterExpandButton />
        {renderButtonFilter()}
      </FilterFormFooter>
      {filter.renderActiveFilter()}
    </FilterFormRoot>
  )
}
