import { Fragment } from 'react'
import { Button } from '#components/button'
import Import from '#components/icons/Import'
import ModalError from '#components/modules/ModalError'
import { ModalImport } from '#components/modules/ModalImport'
import { useTranslation } from 'react-i18next'

import useAnnualCommitmentListImport from './useAnnualCommitmentListImportButton'

const AnnualCommitmentListImportButton = () => {
  const { t } = useTranslation('annualCommitmentList')

  const {
    setModalImportErrors,
    showModal,
    modalImport,
    modalImportErrors,
    onImport,
    hideModal,
  } = useAnnualCommitmentListImport()

  const handleImport = () => {
    showModal('import')
  }

  return (
    <Fragment>
      <Button
        id="btn-import"
        variant="subtle"
        type="button"
        onClick={handleImport}
        leftIcon={<Import className="ui-size-5" />}
      >
        {t('button.import')}
      </Button>

      <ModalImport
        open={modalImport?.type === 'import'}
        onSubmit={onImport}
        handleClose={hideModal}
      />
      <ModalError
        errors={modalImportErrors.errors}
        open={modalImportErrors.open}
        handleClose={() =>
          setModalImportErrors({ open: false, errors: undefined })
        }
      />
    </Fragment>
  )
}

export default AnnualCommitmentListImportButton
