'use client'

import { Button } from '#components/button'
import Download from '#components/icons/Download'
import { useTranslation } from 'react-i18next'

import { useColdStorageCapacityDetail } from '../../ColdStorageCapacityDetailContext'
import { useExportColdStorageCapacityDetail } from '../export/useExportColdStorageCapacityDetail'

export default function HeaderInfo() {
  const { t } = useTranslation('coldStorageCapacity')
  const { data, isLoading } = useColdStorageCapacityDetail()
  const { export: exportDetail } = useExportColdStorageCapacityDetail()

  const handleExport = () => {
    exportDetail()
  }

  if (isLoading) {
    return (
      <div className="ui-animate-pulse ui-rounded ui-border ui-border-gray-200 ui-bg-white ui-p-4">
        <div className="ui-h-6 ui-w-48 ui-rounded ui-bg-gray-200" />
      </div>
    )
  }

  return (
    <div className="ui-flex ui-items-center ui-justify-between ui-border-b ui-border-gray-200 ui-bg-white ui-p-6">
      <div className="ui-flex ui-gap-12">
        <div>
          <div className="ui-text-sm ui-text-gray-500">
            {t('detail.headerInfo.entityName')}
          </div>
          <div className="ui-font-semibold ui-text-gray-900">
            {data?.entity_name}
          </div>
        </div>
        <div>
          <div className="ui-text-sm ui-text-gray-500">
            {t('detail.headerInfo.program')}
          </div>
          <div className="ui-font-semibold ui-text-gray-900">
            {data?.program}
          </div>
        </div>
      </div>
      <Button
        variant="outline"
        leftIcon={<Download className="ui-size-5" />}
        onClick={handleExport}
      >
        {t('button.export')}
      </Button>
    </div>
  )
}
