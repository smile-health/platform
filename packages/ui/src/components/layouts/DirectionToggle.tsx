import React, { useEffect, useState } from 'react'
import { ArrowsRightLeftIcon } from '@heroicons/react/24/outline'
import {
  DIRECTION_CHANGE_EVENT,
  DirectionPreference,
  getDirectionPreference,
  nextPreference,
  resolveDirection,
  setDirectionPreference,
} from '#utils/direction'
import { useTranslation } from 'react-i18next'

import { DropdownMenuItem } from '../dropdown-menu'

// Menu item for the language dropdown: cycles text direction between
// auto (follow language) -> LTR -> RTL. The choice is kept in localStorage.
const DirectionToggle: React.FC = () => {
  const { t, i18n } = useTranslation('common')
  const [preference, setPreference] = useState<DirectionPreference>('auto')

  useEffect(() => {
    setPreference(getDirectionPreference())
    const sync = () => setPreference(getDirectionPreference())
    window.addEventListener(DIRECTION_CHANGE_EVENT, sync)
    return () => window.removeEventListener(DIRECTION_CHANGE_EVENT, sync)
  }, [])

  const effective = resolveDirection(i18n.language, preference)

  return (
    <DropdownMenuItem
      id="direction-toggle"
      onSelect={(e) => {
        e.preventDefault()
        setDirectionPreference(nextPreference(preference), i18n.language)
      }}
    >
      <div className="ui:flex ui:gap-2 ui:items-center ui:whitespace-nowrap">
        <ArrowsRightLeftIcon className="ui:w-4" />
        {t('text_direction.label')}:{' '}
        {preference === 'auto'
          ? `${t('text_direction.auto')} (${effective.toUpperCase()})`
          : t(`text_direction.${preference}`)}
      </div>
    </DropdownMenuItem>
  )
}

export default DirectionToggle
