import React, { useContext } from 'react'
import { Button } from '#components/button'
import ChevronLeft from '#components/icons/ChevronLeft'
import ChevronRight from '#components/icons/ChevronRight'
import { PaginationContainer } from '#components/pagination'
import { OptionType, ReactSelect } from '#components/react-select'
import { PAGE_SIZE } from '#constants/common'
import { ICursorPaginatedResponse } from '#types/cursor-pagination'
import { numberFormatter } from '#utils/formatter'
import { useTranslation } from 'react-i18next'

import TransactionListCursorContext from '../helpers/transaction-list-cursor.context'

type Props = {
  data?: ICursorPaginatedResponse<any>
}

const TransactionListCursorPagination: React.FC<Props> = ({ data }) => {
  const {
    t,
    i18n: { language },
  } = useTranslation(['common', 'transactionList'])

  const limitOptions = PAGE_SIZE.map((size) => ({
    value: size,
    label: size.toString(),
  }))

  const {
    pagination,
    setPagination,
    totalCountData,
    isLoadingCount,
    nextCursor,
    prevCursor,
  } = useContext(TransactionListCursorContext)

  return (
    <div className="ui-flex ui-justify-between ui-items-center ui-gap-2 ui-mt-5">
      <PaginationContainer>
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
              setPagination({
                paginate: Number(option?.value),
                cursor: null,
                page: 1,
              })
            }
            menuPosition="fixed"
            className="ui-w-30"
          />
          <span className="ui-text-sm ui-font-medium ui-text-gray-700">
            {t('common:pagination.items_per_page')}.
          </span>
        </div>

        <div className="ui-flex ui-items-center ui-gap-2">
          <span className="ui-text-sm ui-font-medium ui-text-gray-700">
            {isLoadingCount
              ? 'Loading...'
              : totalCountData
                ? `Total ${numberFormatter(totalCountData, language)} data`
                : 'Total 0 data'}
          </span>
        </div>
      </PaginationContainer>

      <div className="ui-flex ui-items-center ui-gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            setPagination({
              cursor: prevCursor,
              page: Math.max(1, pagination.page - 1),
            })
          }
          disabled={!prevCursor}
        >
          <div className="ui-flex ui-items-center ui-space-x-1 ui-px-2">
            <div>
              <ChevronLeft />
            </div>
            <div className="ui-hidden md:ui-block">
              {t('common:pagination.previous')}
            </div>
          </div>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            setPagination({ cursor: nextCursor, page: pagination.page + 1 })
          }
          disabled={!nextCursor}
        >
          <div>
            <ChevronRight />
          </div>
          <div className="ui-hidden md:ui-block">
            {t('common:pagination.next')}
          </div>
        </Button>
      </div>
    </div>
  )
}

export default TransactionListCursorPagination
