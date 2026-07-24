import { useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useFilter, UseFilter } from '#components/filter'
import { getListTask } from '#services/task'
import { ListTaskParams, Task } from '#types/task'
import { parseAsInteger, useQueryStates } from 'nuqs'
import { useTranslation } from 'react-i18next'

import { generateFilterListTaskSchema } from '../schema/taskSchema'

export default function useListTask() {
  const { t } = useTranslation(['common', 'task'])
  const params = useParams()
  const programPlanId = Number(params?.id)

  const [{ page, paginate }, setPagination] = useQueryStates(
    {
      page: parseAsInteger.withDefault(1),
      paginate: parseAsInteger.withDefault(10),
    },
    {
      history: 'push',
    }
  )

  const filterSchema = useMemo<UseFilter>(
    () => generateFilterListTaskSchema(t),
    [t]
  )
  const filter = useFilter(filterSchema)

  const filterParams = useMemo<ListTaskParams>(() => {
    return {
      page,
      paginate,
      material_id: filter.query.material?.value,
      activity_id: filter.query.activity?.value,
    }
  }, [page, paginate, filter.query])

  const { data, isFetching } = useQuery({
    queryKey: ['list-task', programPlanId, filter.query, filterParams],
    queryFn: () => getListTask(programPlanId, filterParams),
    placeholderData: keepPreviousData,
  })

  const handleChangePage = (page: number) => {
    setPagination((prev) => ({ ...prev, page }))
  }

  const handleChangePaginate = (paginate: number) => {
    setPagination((prev) => ({ ...prev, paginate }))
    handleChangePage(1)
  }

  const [selectedTask, setSelectedTask] = useState<Task | null>(null)

  return {
    programPlanId,
    filter,
    page,
    paginate,
    dataListTask: data,
    isFetchingListTask: isFetching,
    handleChangePage,
    handleChangePaginate,
    selectedTask,
    setSelectedTask,
  }
}
