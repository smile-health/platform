import React from 'react'
import { EmptyState } from '#components/empty-state'
import {
  FormControl,
  FormErrorMessage,
  FormLabel,
} from '#components/form-control'
import { InputSearch } from '#components/input'
import InfiniteScrollContainer from '#components/modules/InfiniteScrollContainer'
import { ProgramItem } from '#components/modules/ProgramItem'
import { Radio } from '#components/radio'
import cx from '#lib/cx'
import { TProgram } from '#types/program'
import { Controller } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import useListProgramTransferStock from '../hooks/useListProgramTransferStock'
import { useModalWarningRemoveMaterialStore } from '../store/modal-warning.store'
import { IconPrograms } from '#constants/program'
import { reValidateQueryFetchInfiniteScroll } from '#components/infinite-scroll-list'

const TransactionCreateListProgram = () => {
  const { t } = useTranslation(['common', 'transactionCreate'])
  const {
    keyword,
    setKeyword,
    setValue,
    control,
    data,
    isLoading,
    items,
    entity,
  } = useListProgramTransferStock()
  const { setModalRemove, setCustomFunction, setContent } =
    useModalWarningRemoveMaterialStore()
  return (
    <Controller
      control={control}
      name="destination_program_id"
      render={({ field: { value }, fieldState: { error } }) => (
        <FormControl>
          <FormLabel required>
            {t(
              'transactionCreate:transaction_transfer_stock.destination_program.label'
            )}
          </FormLabel>
          <InputSearch
            placeholder={t(
              'transactionCreate:transaction_transfer_stock.destination_program.placeholder'
            )}
            defaultValue={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
          <InfiniteScrollContainer
            hasMore={false}
            loadMore={() => {}}
            loading={isLoading}
          >
            <div className="ui-grid ui-grid-cols-1 ui-gap-2 ui-mt-4">
              {data?.map((item: TProgram) => {
                const isChecked = value === item.id

                return (
                  <button
                    key={item.key}
                    data-testid={`btn-workspace-${item.key}`}
                    type="button"
                    className={cx(
                      'ui-flex ui-justify-between ui-border ui-rounded-lg ui-rounded-lg ui-p-4 ui-items-center ui-cursor-pointer focus:outline-none w-full',
                      {
                        'ui-bg-primary-100': isChecked,
                      }
                    )}
                    onClick={() => {
                      if (items && items?.length > 0) {
                        setContent({
                          title: t(
                            'transactionCreate:reset_dialog.description'
                          ),
                        })
                        setModalRemove(true, entity?.value)
                        setCustomFunction(() => {
                          setValue('destination_program_id', item.id)
                          setValue('items', [])
                          reValidateQueryFetchInfiniteScroll()
                        })
                      } else {
                        setValue('destination_program_id', item.id)
                        setValue('items', [])
                        reValidateQueryFetchInfiniteScroll()
                      }
                    }}
                  >
                    <ProgramItem
                      id={item?.key}
                      key={item?.id}
                      data={item}
                      className={{
                        wrapper: 'ui-gap-4',
                        title: 'ui-text-left'
                      }}
                      icon={IconPrograms[item.key]}
                    />
                    <Radio
                      id={`cbx-program-${item?.key}`}
                      checked={isChecked}
                    />
                  </button>
                )
              })}

              {data?.length === 0 ? (
                <EmptyState
                  title={
                    entity?.value && keyword
                      ? t(
                          'transactionCreate:transaction_transfer_stock.no_data_found'
                        )
                      : t('common:message.empty.title')
                  }
                  description={
                    entity?.value && !keyword
                      ? t(
                          'transactionCreate:transaction_transfer_stock.empty_program_already_requested'
                        )
                      : t(
                          'transactionCreate:transaction_transfer_stock.empty_program'
                        )
                  }
                  withIcon
                  className="ui-h-[480px]"
                />
              ) : null}
            </div>
          </InfiniteScrollContainer>
          {error?.message && (
            <FormErrorMessage>{error?.message}</FormErrorMessage>
          )}
        </FormControl>
      )}
    />
  )
}

export default TransactionCreateListProgram
