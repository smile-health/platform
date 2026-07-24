import React from 'react'
import { Button } from '#components/button'
import ChevronLeft from '#components/icons/ChevronLeft'
import ChevronRight from '#components/icons/ChevronRight'
import { PaginationContainer } from '#components/pagination'
import { OptionType, ReactSelect } from '#components/react-select'
import { PAGE_SIZE } from '#constants/common'
import { numberFormatter } from '#utils/formatter'
import { useTranslation } from 'react-i18next'

export type CursorPaginationState = {
  paginate: number
  cursor?: string | null
}

type Props = {
  pagination: CursorPaginationState
  onChangePagination: (value: Partial<CursorPaginationState>) => void

  totalCount?: number
  isLoadingCount?: boolean

  nextCursor?: string | null
  prevCursor?: string | null

  pageSizeOptions?: number[]
  showTotalLabel?: string
}

const CursorPagination: React.FC<Props> = ({
  pagination,
  onChangePagination,
  totalCount,
  isLoadingCount,
  nextCursor,
  prevCursor,
  pageSizeOptions = PAGE_SIZE,
  showTotalLabel = 'data',
}) => {
  const {
    t,
    i18n: { language },
  } = useTranslation(['common'])

  const limitOptions = pageSizeOptions.map((size) => ({
    value: size,
    label: size.toString(),
  }))

  const getTotalCountLabel = () => {
    if (isLoadingCount) {
      return 'Loading...'
    }
    if (totalCount) {
      return `Total ${numberFormatter(totalCount, language)} ${showTotalLabel}`
    }
    return `Total 0 ${showTotalLabel}`
  }

  const totalCountLabel = getTotalCountLabel()

  return (
    <div className="ui-flex ui-justify-between ui-items-center ui-gap-2 ui-mt-5 ui-w-full">
      <PaginationContainer>
        {/* Left Section */}
        <div className="ui-flex ui-items-center ui-gap-2">
          <span className="ui-text-sm ui-font-medium ui-text-gray-700">
            {t('common:pagination.showing')}
          </span>

          <ReactSelect
            id="cursor-pagination-limit"
            value={{
              value: pagination.paginate,
              label: pagination.paginate.toString(),
            }}
            options={limitOptions}
            onChange={(option: OptionType) =>
              onChangePagination({ paginate: Number(option?.value) })
            }
            menuPosition="fixed"
            className="ui-w-20"
          />

          <span className="ui-text-sm ui-font-medium ui-text-gray-700">
            {t('common:pagination.items_per_page')}.
          </span>
        </div>

        {/* Total Section */}
        <div className="ui-flex ui-items-center ui-gap-2">
          <span className="ui-text-sm ui-font-medium ui-text-gray-700">
            {totalCountLabel}
          </span>
        </div>
      </PaginationContainer>

      {/* Navigation Buttons */}
      <div className="ui-flex ui-items-center ui-gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onChangePagination({ cursor: prevCursor ?? null })}
          disabled={!prevCursor}
        >
          <div className="ui-flex ui-items-center ui-space-x-1 ui-px-2">
            <ChevronLeft />
            <div className="ui-hidden md:ui-block">
              {t('common:pagination.previous')}
            </div>
          </div>
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onChangePagination({ cursor: nextCursor ?? null })}
          disabled={!nextCursor}
        >
          <ChevronRight />
          <div className="ui-hidden md:ui-block">
            {t('common:pagination.next')}
          </div>
        </Button>
      </div>
    </div>
  )
}

export default CursorPagination
