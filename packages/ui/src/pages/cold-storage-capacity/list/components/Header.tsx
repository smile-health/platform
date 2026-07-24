'use client'

import { useTranslation } from 'react-i18next'

export default function ColdStorageCapacityHeader(): JSX.Element {
  const { t } = useTranslation('coldStorageCapacity')

  return (
    <div className="ui-flex ui-flex-col ui-gap-2">
      <p className="ui-text-sm ui-text-gray-500 ui-text-center">
        {t('info.colorCoding')}
      </p>
    </div>
  )
}
