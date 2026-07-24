'use client'

import Refrigerator from '#components/icons/Refrigerator'
import { useTranslation } from 'react-i18next'

export default function MaterialSection() {
  const { t } = useTranslation('coldStorageCapacity')

  return (
    <div className="ui-rounded ui-border ui-border-gray-200 ui-bg-white ui-p-6">
      <div className="ui-flex ui-items-center ui-gap-4">
        <div className="ui-rounded-lg">
          <Refrigerator className="ui-h-12 ui-w-12" />
        </div>
        <div>
          <h3 className="ui-font-semibold ui-text-gray-900">
            {t('detail.material.title')}
          </h3>
          <p className="ui-text-sm ui-text-gray-500">
            {t('detail.material.subtitle')}
          </p>
        </div>
      </div>

      {/* TODO: Add more content below Material section (Phase 2) */}
    </div>
  )
}
