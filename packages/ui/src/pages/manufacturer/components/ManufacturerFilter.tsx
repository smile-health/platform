import { Button } from '#components/button'
import {
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
import { getReactSelectValue } from '#utils/react-select'
import { useTranslation } from 'react-i18next'

import useManufacturerFileManager from '../hooks/useManufacturerFileManager'

type ManufacturerFilterProps = CommonType & {
  page: number
  paginate: number
  filter: ReturnType<typeof useFilter>
  handleChangePage: (page: number) => void
}

export default function ManufacturerFilter({
  page,
  paginate,
  filter,
  isGlobal,
  handleChangePage,
}: ManufacturerFilterProps) {
  const { t } = useTranslation()

  const {
    import: { modalImport, showModal, hideModal, onImport },
    onDownloadTemplate,
    onExport,
  } = useManufacturerFileManager({
    ...filter?.query,
    page,
    paginate,
    type: filter?.query?.type?.value,
    program_ids: getReactSelectValue(filter?.query?.program_ids),
  })

  const handleReset = () => {
    handleChangePage(1)
    filter.reset()
  }

  const renderButtonFilter = () => {
    return (
      <div className="ui-flex ui-ml-auto ui-gap-2">
        {isGlobal && (
          <>
            <Button
              data-testid="btn-import"
              variant="subtle"
              type="button"
              onClick={() => showModal('import')}
              leftIcon={<Import className="ui-size-5" />}
            >
              {t('import')}
            </Button>
            <Button
              data-testid="btn-export"
              variant="subtle"
              type="button"
              onClick={onExport}
              leftIcon={<Export className="ui-size-5" />}
            >
              {t('export')}
            </Button>
            <Button
              data-testid="btn-download-template"
              variant="subtle"
              type="button"
              onClick={onDownloadTemplate}
              leftIcon={<Download className="ui-size-5" />}
            >
              {t('download_template')}
            </Button>
            <span className="ui-h-10 ui-w-px ui-bg-neutral-300" />
          </>
        )}
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
    <FilterFormRoot onSubmit={filter.handleSubmit}>
      <ModalImport
        open={modalImport?.type === 'import'}
        onSubmit={onImport}
        handleClose={hideModal}
      />
      <ModalError
        errors={modalImport?.errors}
        open={modalImport?.type === 'error'}
        handleClose={hideModal}
      />
      <FilterFormBody
        className={cx({
          'ui-grid-cols-3': isGlobal,
          'ui-flex ui-gap-4 ui-items-end': !isGlobal,
        })}
      >
        {isGlobal ? (
          filter.renderField()
        ) : (
          <div className="ui-grow ui-grid ui-grid-cols-2 ui-items-end ui-gap-4">
            {filter.renderField()}
          </div>
        )}
        {!isGlobal && renderButtonFilter()}
      </FilterFormBody>
      {isGlobal && <FilterFormFooter>{renderButtonFilter()}</FilterFormFooter>}
      {filter.renderActiveFilter()}
    </FilterFormRoot>
  )
}
