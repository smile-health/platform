import React, { Fragment, useMemo, useState } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { Checkbox } from '#components/checkbox'
import { FormErrorMessage } from '#components/form-control'
import { InputSearch } from '#components/input'
import { Spinner } from '#components/spinner'
import { useDebounce } from '#hooks/useDebounce'
import cx from '#lib/cx'
import { loadActivitySelection } from '#services/activity'
import { Controller, useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { ActivityItem } from './ActivityItem'

type ActivitySelectionType = { id: number; is_sequence: boolean }

type ActivitySelectionProps = {
  activities?: ActivitySelectionType[] | null
}

export default function ActivitySelection({
  activities,
}: Readonly<ActivitySelectionProps>) {
  const { t } = useTranslation(['material'])
  const [search, setSearch] = useState<string>('')
  const debouncedSearch = useDebounce(search, 500)

  const {
    data,
    isLoading,
    isError,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery({
    queryKey: ['activities', debouncedSearch],
    queryFn: ({ pageParam = 1 }) =>
      loadActivitySelection(debouncedSearch, { page: pageParam }),
    getNextPageParam: (lastPage) => lastPage.nextPage ?? null,
    initialPageParam: 1,
  })

  const filteredActivities = useMemo(() => {
    if (debouncedSearch) {
      return data?.pages
        ?.flatMap((page) => page.options)
        ?.filter((item) =>
          item?.name?.toLowerCase().includes(debouncedSearch.toLowerCase())
        )
    }
    return data?.pages?.flatMap((page) => page.options)
  }, [data, debouncedSearch])

  const { control } = useFormContext()

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget
    if (
      target.scrollTop + target.clientHeight >= target.scrollHeight - 1 &&
      hasNextPage &&
      !isFetchingNextPage
    ) {
      fetchNextPage()
    }
  }

  const handleUncheck = (
    itemId: number,
    onChange: (...event: any[]) => void
  ) => {
    const filtered = activities?.filter((val) => val?.id !== itemId)
    onChange?.(filtered)
  }

  return (
    <div className="ui-flex ui-flex-col space-y-5">
      <InputSearch
        placeholder={t('material:form.activity.placeholder')}
        value={search}
        onInput={(e) => setSearch(e.currentTarget.value)}
      />
      <p className="ui-text-[#737373] !ui-font-medium !ui-mt-2">
        {t('material:form.activity.description')}
      </p>

      {!data ? (
        <div className="ui-flex ui-justify-center">
          {isLoading && <Spinner className="ui-my-8 ui-w-5" />}
          {isError && (
            <p className="ui-text-[#737373] !ui-font-medium !ui-mt-2">
              {t('material:form.activity.error.not_found')}
            </p>
          )}
        </div>
      ) : (
        <Controller
          name="activities"
          control={control}
          render={({ field: { onChange, value }, fieldState: { error } }) => {
            const val = value as ActivitySelectionType[]
            const valueIds = val?.map((data) => data.id) || []

            const sortedActivities = (filteredActivities || [])
              .map((item) => ({
                ...item,
                isChecked: valueIds.includes(item.id),
              }))
              .sort((a, b) => Number(b.isChecked) - Number(a.isChecked))
            return (
              <Fragment>
                <div
                  className="ui-space-y-2 ui-max-h-72 ui-overflow-y-auto"
                  onScroll={handleScroll}
                >
                  {sortedActivities?.map((item) => {
                    const isChecked = item.isChecked

                    return (
                      <button
                        type="button"
                        className={cx(
                          'ui-flex ui-w-full ui-border ui-gap-4 ui-rounded-lg ui-p-4 ui-items-center ui-justify-between ui-cursor-pointer',
                          {
                            'ui-bg-[#E2F3FC]': isChecked,
                            'ui-border-neutral-300': !isChecked,
                            'ui-border-[#004990]': isChecked,
                          }
                        )}
                        onClick={(e) => {
                          if (!isChecked) {
                            onChange?.(
                              activities?.concat({
                                id: item.id,
                                is_sequence: Boolean(item.is_sequence),
                              })
                            )
                          } else handleUncheck(item?.id, onChange)
                        }}
                        key={item?.id}
                      >
                        <div className="ui-flex ui-flex-row">
                          <Checkbox
                            id={`cbx-activity-${item?.id}`}
                            checked={isChecked}
                          />

                          <ActivityItem
                            id={`activity-${item?.id}`}
                            data={item}
                          />
                        </div>
                        {/* TO DO: unhide toggle after further information about is_patient */}
                        {/* <div className="ui-flex ui-items-center ui-gap-2">
                        <p>{t('material:form.activity.is_sequence')}</p>
                        <Switch
                          onClick={(e) => e.stopPropagation()}
                          defaultChecked={Boolean(isSequence)}
                          disabled={!isChecked}
                          onCheckedChange={(val) => {
                            if (!isSequence) {
                              onChange?.(
                                activities?.concat({
                                  id: item.id,
                                  is_sequence: !val,
                                })
                              )
                            } else {
                              const filtered = activities?.filter(
                                (val) => val?.id !== item?.id
                              )
                              onChange?.(filtered)
                            }
                          }}
                          id="switch-material-is-hierarchical"
                          size="md"
                        />
                      </div> */}
                      </button>
                    )
                  })}
                  {isFetchingNextPage && (
                    <div className="ui-flex ui-justify-center">
                      <Spinner className="ui-my-4 ui-w-5" />
                    </div>
                  )}
                </div>
                {error?.message && (
                  <FormErrorMessage>{error.message}</FormErrorMessage>
                )}
              </Fragment>
            )
          }}
        />
      )}
    </div>
  )
}
