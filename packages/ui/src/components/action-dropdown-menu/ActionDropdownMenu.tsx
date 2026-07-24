'use client'

import React from 'react'
import { useTranslation } from 'react-i18next'
import { EyeIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline'
import {
  DropdownMenuRoot,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '#components/dropdown-menu'
import { Button } from '#components/button'
import DotsHorizontal from '#components/icons/DotsHorizontal'

export interface ActionDropdownMenuProps {
  onView?: () => void
  onEdit?: () => void
  onDelete?: () => void
  disabled?: {
    view?: boolean
    edit?: boolean
    delete?: boolean
  }
}

export function ActionDropdownMenu({
  onView,
  onEdit,
  onDelete,
  disabled,
}: ActionDropdownMenuProps) {
  const { t } = useTranslation('common')

  return (
    <DropdownMenuRoot>
      <DropdownMenuTrigger>
        <Button variant="subtle" size="sm" className="ui-px-2">
          <DotsHorizontal className="ui-h-4 ui-w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {onView && (
          <DropdownMenuItem
            leftIcon={<EyeIcon className="ui-h-4 ui-w-4" />}
            onSelect={onView}
            disabled={disabled?.view}
          >
            {t('view')}
          </DropdownMenuItem>
        )}
        {onEdit && (
          <DropdownMenuItem
            leftIcon={<PencilIcon className="ui-h-4 ui-w-4" />}
            onSelect={onEdit}
            disabled={disabled?.edit}
          >
            {t('edit')}
          </DropdownMenuItem>
        )}
        {onDelete && (
          <DropdownMenuItem
            color="danger"
            leftIcon={<TrashIcon className="ui-h-4 ui-w-4" />}
            onSelect={onDelete}
            disabled={disabled?.delete}
          >
            {t('delete')}
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenuRoot>
  )
}
