import { useMemo } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { listActivities } from '#services/activity'
import {
  TDetailActivityDate,
  TUpdateActivityImplementationTimeBody,
} from '#types/entity'
import { UseFormReturn } from 'react-hook-form'
import { BOOLEAN } from '#constants/common'

type TUseEntityActivityDataFormProcessing = {
  existingData: TDetailActivityDate[][] | []
  methods: UseFormReturn<TUpdateActivityImplementationTimeBody, any, undefined>
}

const useEntityActivityImplementationForm = ({
  existingData,
  methods,
}: TUseEntityActivityDataFormProcessing) => {
  const {
    data: dataActivities,
    isLoading: isLoadingActivities,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: ['activities__infinite-scroll-list'],
    queryFn: ({ pageParam }) =>
      listActivities({ page: pageParam, paginate: 10, status: BOOLEAN.TRUE }),
    getNextPageParam: (lastPage) => {
      const nextPage =
        lastPage?.page < lastPage?.total_page ? lastPage?.page + 1 : null
      return nextPage
    },
    initialPageParam: 1,
  })

  useMemo(() => {
    if (dataActivities?.pages) {
      const matched = dataActivities?.pages
        ?.flatMap((item: any) => item?.data)
        ?.map(
          (item) =>
            [
              {
                id: item?.id,
                activity_id: item?.id,
                name: item?.name,
                start_date: item?.start_date || null,
                end_date: item?.end_date || null,
              },
            ] as TDetailActivityDate[]
        )

      const existingIds = new Set(
        existingData?.map((group) => Number(group?.[0]?.activity_id))
      )
      const newGroups = matched?.filter(
        (group) => !existingIds?.has(Number(group?.[0]?.activity_id))
      )
      const joinedToExisting = [...existingData, ...newGroups]
      methods?.setValue('activities', joinedToExisting)
    }
  }, [dataActivities?.pageParams])

  return {
    fetchNextPage,
    isFetchingNextPage,
    isLoadingActivities,
    hasNextPage,
  }
}

export default useEntityActivityImplementationForm
