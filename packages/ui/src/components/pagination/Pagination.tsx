'use client'

import React, { PropsWithChildren, useMemo } from 'react'
import ChevronLeft from '#components/icons/ChevronLeft'
import ChevronRight from '#components/icons/ChevronRight'
import DotsHorizontal from '#components/icons/DotsHorizontal'
import { PAGE_SIZE } from '#constants/common'
import cx from '#lib/cx'
import { useTranslation } from 'react-i18next'

import { OptionType, ReactSelect } from '../react-select'

const LEFT_DOT = 'left'
const RIGHT_DOT = 'right'

function range(start: number, end: number) {
  const length = end - start + 1
  return Array.from({ length }, (_, index) => index + start)
}

type ItemProps = React.ComponentProps<'button'> & {
  /**  active page number */
  active?: boolean
  /** disabled Item without affecting opacity */
  disabledWithoutOpacity?: boolean
  children: React.ReactNode
}

function Item({
  children,
  active,
  disabled,
  disabledWithoutOpacity,
  ...props
}: ItemProps) {
  return (
    <button
      {...props}
      type="button"
      disabled={disabled || disabledWithoutOpacity}
      className={cx(
        'ui-flex ui-items-center ui-justify-center ui-text-sm focus:ui-outline-none first-of-type:ui-rounded-l last-of-type:ui-rounded-r',
        'ui-border ui-border-neutral-300 focus:ui-border-primary-300 focus:ui-ring-2 focus:ui-ring-primary-500 focus:ui-ring-opacity-25',
        'group-[.is-group]:focus:ui-z-10',
        'ui-min-w-[2rem] ui-px-2.5 ui-h-10 md:ui-min-w-[2.5rem]',

        //size,
        {
          'ui-bg-white': !active,
          'ui-bg-primary-500 ui-text-primary-contrast hover:ui-bg-primary-600': active,
          'ui-cursor-not-allowed ui-opacity-50': disabled,
          'hover:ui-bg-gray-50 active:ui-bg-gray-100': !disabled && !active,
          'ui-pointer-events-none': disabledWithoutOpacity,
        }
      )}
    >
      {children}
    </button>
  )
}

type UsePaginationParams = {
  /**  active page number */
  currentPage?: number

  /** Total amount of items */
  totalPages: number

  /** Siblings amount on left/right side of selected page, defaults to 1 */
  siblings?: number

  /** Amount of elements visible on left/right edges, defaults to 1  */
  boundaries?: number

  /** Callback fired after change of each page */
  onPageChange?: (page: number) => void
}

export function usePagination({
  currentPage = 1,
  totalPages,
  siblings = 1,
  boundaries = 1,
  onPageChange,
}: UsePaginationParams) {
  const _totalPages = Math.max(Math.trunc(totalPages), 0)

  const setPage = (pageNumber: number) => {
    if (pageNumber <= 0) {
      onPageChange?.(1)
    } else if (pageNumber > _totalPages) {
      onPageChange?.(_totalPages)
    } else {
      onPageChange?.(pageNumber)
    }
  }

  const next = () => onPageChange?.(currentPage + 1)
  const previous = () => onPageChange?.(currentPage - 1)
  const first = () => onPageChange?.(1)
  const last = () => onPageChange?.(_totalPages)

  const paginationRange = useMemo(() => {
    const totalPageNumbers = siblings * 2 + 3 + boundaries * 2
    if (totalPageNumbers >= _totalPages) {
      return range(1, _totalPages)
    }

    const leftSiblingIndex = Math.max(currentPage - siblings, boundaries)
    const rightSiblingIndex = Math.min(
      currentPage + siblings,
      _totalPages - boundaries
    )

    const shouldShowLeftDots = leftSiblingIndex > boundaries + 2
    const shouldShowRightDots =
      rightSiblingIndex < _totalPages - (boundaries + 1)

    if (!shouldShowLeftDots && shouldShowRightDots) {
      const leftItemCount = siblings * 2 + boundaries + 2
      return [
        ...range(1, leftItemCount),
        LEFT_DOT,
        ...range(_totalPages - (boundaries - 1), _totalPages),
      ]
    }

    if (shouldShowLeftDots && !shouldShowRightDots) {
      const rightItemCount = boundaries + 1 + 2 * siblings
      return [
        ...range(1, boundaries),
        LEFT_DOT,
        ...range(_totalPages - rightItemCount, _totalPages),
      ]
    }

    return [
      ...range(1, boundaries),
      LEFT_DOT,
      ...range(leftSiblingIndex, rightSiblingIndex),
      RIGHT_DOT,
      ...range(_totalPages - boundaries + 1, _totalPages),
    ]
  }, [_totalPages, siblings, currentPage, boundaries])

  return {
    range: paginationRange,
    active: currentPage,
    setPage,
    next,
    previous,
    first,
    last,
  }
}

export function PaginationContainer({
  className,
  children,
}: PropsWithChildren<{ className?: string }>) {
  return (
    <div
      className={cx(
        'ui-flex ui-justify-between ui-items-center ui-gap-2',
        className
      )}
    >
      {children}
    </div>
  )
}

type PaginationSelectLimitProps = {
  perPagesOptions?: Array<number>
  size?: number
  onChange?: (value: number) => void
}

export function PaginationSelectLimit({
  perPagesOptions = PAGE_SIZE,
  size = 10,
  onChange,
}: Readonly<PaginationSelectLimitProps>) {
  return (
    <ReactSelect
      id="pagination-limit"
      data-testid="pagination-limit"
      value={{
        value: size,
        label: size,
      }}
      options={perPagesOptions?.map((item) => ({
        value: item,
        label: item,
      }))}
      menuPosition="fixed"
      onChange={(option: OptionType) => onChange?.(Number(option?.value))}
      classNames={{
        dropdownIndicator: () => '!ui-text-[#073B4C]',
        singleValue: () => '!ui-text-[#021217]',
      }}
    />
  )
}

type PaginationInfoProps = {
  total?: number
  currentPage?: number
  size?: number
}

export function PaginationInfo({
  total = 0,
  currentPage = 1,
  size = 10,
}: Readonly<PaginationInfoProps>) {
  const { t } = useTranslation('common')
  const isEmpty = !total

  const start = (currentPage - 1) * size + 1
  const end = Math.min(currentPage * size, total)
  const result = Intl.NumberFormat('en-US').format(total)

  return (
    <p className="ui-mr-auto ui-ml-0 ui-text-sm ui-font-medium ui-leading-none ui-text-[#1D2939]">
      {isEmpty
        ? t('pagination.empty')
        : t('pagination.data', {
            start,
            end,
            result,
          })}
    </p>
  )
}

type PaginationProps = {
  /**  active page number */
  currentPage?: number

  /** Total number of page */
  totalPages: number

  /** Siblings amount on left/right side of selected page, defaults to 1 */
  siblings?: number

  /** Amount of elements visible on left/right edges, defaults to 1  */
  boundaries?: number

  /** Callback fired after change of each page */
  onPageChange?: (page: number) => void

  /** show page numbering, default true */
  withPageNumber?: boolean

  /** disable pagination, default false */
  disabled?: boolean
}

export function Pagination({
  siblings = 0,
  boundaries = 1,
  withPageNumber = true,
  currentPage = 1,
  onPageChange,
  totalPages,
  disabled,
}: Readonly<PaginationProps>) {
  const {
    i18n: { language },
  } = useTranslation()
  const isId = language === 'id'
  const { range, setPage, next, previous, active } = usePagination({
    currentPage,
    siblings,
    totalPages,
    onPageChange,
    boundaries,
  })

  disabled = disabled || totalPages === 0

  return (
    <div className="is-group ui-flex ui-text-primary-surface ui-group">
      <Item
        data-testid="btn-page-prev"
        onClick={previous}
        disabled={active === 1 || disabled}
      >
        <div className="ui-flex ui-items-center ui-space-x-1 ui-px-2">
          <div>
            <ChevronLeft />
          </div>
          <div className="ui-hidden md:ui-block">
            {isId ? 'Sebelumnya' : 'Prev'}
          </div>
        </div>
      </Item>

      {withPageNumber &&
        range.map((pageNumber) => {
          if (pageNumber === LEFT_DOT || pageNumber === RIGHT_DOT) {
            return (
              <div
                key={pageNumber}
                className="ui-flex ui-justify-center ui-items-center ui-px-2 ui-text-gray-600 ui-border ui-border-neutral-300 ui-w-10"
              >
                <DotsHorizontal />
              </div>
            )
          }
          return (
            <Item
              key={pageNumber}
              active={pageNumber === active}
              tabIndex={0}
              disabled={disabled}
              onClick={() => setPage(pageNumber as number)}
              type="button"
              data-testid={`btn-page-${pageNumber}`}
            >
              {pageNumber}
            </Item>
          )
        })}

      <Item
        data-testid="btn-page-next"
        onClick={next}
        disabled={active === totalPages || disabled}
      >
        <div className="ui-flex ui-items-center ui-space-x-1 ui-px-2">
          <div className="ui-hidden md:ui-block">
            {isId ? 'Selanjutnya' : 'Next'}
          </div>

          <div>
            <ChevronRight />
          </div>
        </div>
      </Item>
    </div>
  )
}
