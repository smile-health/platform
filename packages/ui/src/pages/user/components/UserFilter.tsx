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
import { CommonType } from '#types/common'
import { useTranslation } from 'react-i18next'

import useUserFileManager from '../hooks/useUserFileManager'

type UserFilterProps = CommonType & {
  filter: ReturnType<typeof useFilter>
  handleChangePage: (page: number) => void
}

export default function UserFilter({
  filter,
  isGlobal,
  handleChangePage,
}: UserFilterProps) {
  const { t } = useTranslation()
  const {
    import: { modalImport, showModal, hideModal, onImport },
    onDownloadTemplate,
    onExport,
  } = useUserFileManager(filter.query)

  const handleReset = () => {
    handleChangePage(1)
    filter.reset()
  }

  return (
    <FilterFormRoot collapsible onSubmit={filter.handleSubmit}>
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
      <FilterFormBody className="ui-grid-cols-4">
        {filter.renderField()}
      </FilterFormBody>
      <FilterFormFooter>
        <FilterExpandButton variant="subtle" />
        <div className="ui-flex ui-gap-2">
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
              <span className="ui-h-full ui-w-px ui-bg-neutral-300" />
            </>
          )}
          <FilterResetButton variant="subtle" onClick={handleReset} />
          <FilterSubmitButton
            variant="outline"
            onClick={() => handleChangePage(1)}
            className="ui-w-[202px]"
          />
        </div>
      </FilterFormFooter>
      {filter.renderActiveFilter()}
    </FilterFormRoot>
  )
}
