import { useEffect, useRef, useState } from 'react'
import {
  FetchNextPageOptions,
  InfiniteData,
  InfiniteQueryObserverResult,
} from '@tanstack/react-query'
import { Badge } from '#components/badge'
import { DataTable, DataTableProps } from '#components/data-table'
import { InputSearch } from '#components/input'
import { useDebounce } from '#hooks/useDebounce'
import cx from '#lib/cx'
import { queryClient } from '#provider/query-client'
import { useTranslation } from 'react-i18next'

export type InfiniteScrollListProps<Schema, Value> = {
  id: string
  title?: string
  warning_description?: string
  description?: string
  columns: DataTableProps<Value>['columns']
  data?: Value[]
  fetchNextPage: (
    options?: FetchNextPageOptions
  ) => Promise<InfiniteQueryObserverResult<InfiniteData<Schema>>>
  hasNextPage?: boolean
  handleSearch?: (search: string) => void
  onClickRow?: (row: Value) => void
  isLoading?: boolean
  className?: string
  bodyClassName?: string
  totalItems?: number
  config?: {
    searchBar?: {
      show?: boolean
      placeholder: string
    }
    totalItems?: {
      show?: boolean
    }
  }
  emptyDescription?: string
}

export const reValidateQueryFetchInfiniteScroll = () => {
  queryClient.removeQueries({ queryKey: ['infinite-scroll-list'] })

  const listElement = document.getElementById('datatable-infinite-scroll-list')
  if (listElement) {
    listElement.scrollTop = 0
  }
}

export const InfiniteScrollList = <Schema, Value>({
  id,
  title,
  description,
  warning_description,
  data,
  columns,
  hasNextPage,
  isLoading = false,
  totalItems,
  handleSearch,
  fetchNextPage,
  onClickRow,
  className,
  bodyClassName,
  config = {
    searchBar: {
      show: true,
      placeholder: 'Search',
    },
    totalItems: {
      show: true,
    },
  },
  emptyDescription,
}: InfiniteScrollListProps<Schema, Value>) => {
  const { t } = useTranslation(['common', 'order'])
  const datatableRef = useRef<HTMLDivElement>(null)
  const [search, setSearch] = useState('')

  const debouncedSearch = useDebounce(search, 500)

  useEffect(() => {
    if (datatableRef.current) {
      datatableRef.current.onscroll = () => {
        const scrollTop = datatableRef.current?.scrollTop ?? 0
        const scrollHeight = datatableRef.current?.scrollHeight ?? 0
        const offsetHeight = datatableRef.current?.offsetHeight ?? 0

        if (
          Math.ceil(scrollTop + offsetHeight) + 1 >= scrollHeight - 25 &&
          hasNextPage
        ) {
          fetchNextPage()
        }
      }
    }
  }, [datatableRef, hasNextPage])

  useEffect(() => {
    datatableRef.current?.scrollTo(0, 0)
    handleSearch?.(debouncedSearch)
  }, [debouncedSearch])

  return (
    <div
      id={id}
      data-testid={id}
      className={cx(
        'ui-border ui-border-neutral-300 ui-rounded ui-p-6 space-y-4'
      )}
    >
      {title && (
        <div className="space-y-4">
          <div className={cx('ui-text-dark-blue ui-font-bold')}>{title}</div>
          {description && (
            <div className={cx('ui-text-gray-500')}>{description}</div>
          )}
          {warning_description && (
            <Badge
              size="md"
              rounded="sm"
              variant="light-outline"
              color="warning"
            >
              {warning_description}
            </Badge>
          )}
        </div>
      )}
      {config?.searchBar?.show && (
        <div>
          <InputSearch
            placeholder={t('order:placeholder.search_material')}
            value={search}
            onChange={(event) => setSearch(event.currentTarget.value)}
          />
        </div>
      )}

      {config.totalItems?.show && (
        <div className={cx('ui-text-gray-500 ui-text-right')}>
          <p>
            <strong className="ui-text-dark-blue ui-text-sm">
              {!isLoading ? (totalItems ?? 0) : '-'}
            </strong>
            &nbsp;
            {t('item')}
          </p>
        </div>
      )}

      <DataTable
        id="datatable-infinite-scroll-list"
        ref={datatableRef}
        data={data}
        columns={columns}
        isLoading={isLoading}
        isSticky
        className={cx('ui-max-h-[425px]', className)}
        bodyClassName={bodyClassName}
        onClickRow={onClickRow ? (row) => onClickRow(row.original) : undefined}
        emptyDescription={emptyDescription}
      />
    </div>
  )
}
