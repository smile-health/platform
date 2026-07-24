import { Button } from '#components/button'
import Import from '#components/icons/Import'
import { ModalImport } from '#components/modules/ModalImport'
import { useTranslation } from 'react-i18next'

import { useListImport } from './useListImport'

export const ListImportButton = () => {
  const { t } = useTranslation(['common', 'monitoringDeviceInventoryList'])

  const listImport = useListImport()

  return (
    <>
      <ModalImport
        open={listImport.modal.show}
        setOpen={listImport.modal.set}
        onSubmit={listImport.execute}
        handleClose={() => listImport.modal.set(false)}
        accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
        description={t('common:import')}
      />
      <Button
        id="btn-import"
        variant="subtle"
        type="button"
        className="ui-px-2"
        leftIcon={<Import className="ui-size-5" />}
        onClick={() => listImport.modal.set(true)}
      >
        {t('common:import')}
      </Button>
    </>
  )
}
