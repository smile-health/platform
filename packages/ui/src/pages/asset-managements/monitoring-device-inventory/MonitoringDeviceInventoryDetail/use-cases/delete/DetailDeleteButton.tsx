import { useState } from 'react'
import { TrashIcon } from '@heroicons/react/24/outline'
import { Button } from '#components/button'
import { useTranslation } from 'react-i18next'

import { useMonitoringDeviceInventoryDetail } from '../../MonitoringDeviceInventoryDetailContext'
import { DetailDeleteModal } from './DetailDeleteModal'

export const DetailDeleteButton = () => {
  const { t } = useTranslation(['common'])
  const [isOpen, setIsOpen] = useState(false)
  const { isDeleting, isUpdatingStatus, onDelete } =
    useMonitoringDeviceInventoryDetail()

  const handleConfirmDelete = () => {
    onDelete()
  }

  return (
    <>
      <DetailDeleteModal
        open={isOpen}
        setOpen={setIsOpen}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />
      <Button
        variant="subtle"
        color="danger"
        size="sm"
        leftIcon={<TrashIcon className="ui-w-5 ui-h-5" />}
        onClick={() => setIsOpen(true)}
        loading={isDeleting}
        disabled={isDeleting || isUpdatingStatus}
      >
        {t('common:delete')}
      </Button>
    </>
  )
}
