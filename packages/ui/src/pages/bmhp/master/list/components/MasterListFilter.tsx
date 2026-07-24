import React from 'react'
import { Button } from '#components/button'
import {
  FilterExpandButton,
  FilterFormBody,
  FilterFormFooter,
  FilterFormRoot,
  FilterResetButton,
  useFilter,
} from '#components/filter'
import clsx from 'clsx'
import { useTranslation } from 'react-i18next'

export interface MasterListFilterProps {
  filter?: ReturnType<typeof useFilter>
  exportButton?: React.ReactNode
  filterBodyClassName?: string
  filterContainerClassName?: string
  collapsible?: boolean
}

export const MasterListFilter: React.FC<MasterListFilterProps> = ({
  filter,
  exportButton,
  filterBodyClassName,
  filterContainerClassName,
  collapsible = false
}) => {
  const { t } = useTranslation('masterBmhp')

  if (!filter) {
    return null
  }

  return (
    <FilterFormRoot
      onSubmit={filter.handleSubmit}
      className="ui-items-center"
      collapsible={collapsible}
    >
      <div
        className={clsx(
          'ui-flex-row ui-flex ui-gap-3',
          !collapsible && 'ui-items-end',
          filterContainerClassName
        )}
      >
        <FilterFormBody
          className={clsx(
            'ui-w-full ui-flex ui-flex-col ui-bg-white ui-rounded-md',
            filterBodyClassName
          )}
        >
          {filter.renderField()}
        </FilterFormBody>
        <FilterFormFooter>
          {collapsible && <div className='ui-w-full'>
            <FilterExpandButton />
          </div>}
          <div className="ui-flex ui-gap-3 ui-items-center">
            {exportButton}
            {exportButton && (
              <span className="ui-h-[24px] ui-w-px ui-bg-neutral-300" />
            )}
            <FilterResetButton variant="subtle" onClick={filter.reset} />
            <Button type="submit" variant="outline" className="ui-w-[202px]">
              {t('button.apply')}
            </Button>
          </div>
        </FilterFormFooter>
      </div>
      {filter.renderActiveFilter()}
    </FilterFormRoot>
  )
}
