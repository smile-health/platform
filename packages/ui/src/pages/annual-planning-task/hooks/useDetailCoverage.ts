import { useMemo, useState } from 'react'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { getDetailCoverage } from '#services/task'
import { Task } from '#types/task'

export default function useDetailCoverage(task: Task | null) {
  const { data, isFetching } = useQuery({
    queryKey: ['detail-coverage', task?.id],
    queryFn: () => getDetailCoverage(task?.id as number),
    placeholderData: keepPreviousData,
    enabled: !!task?.id,
  })

  const [keywordProvince, setKeywordProvince] = useState('')

  const filteredProvinces = useMemo(() => {
    return data?.data?.filter((province) => {
      return province.province_name
        .toLowerCase()
        .includes(keywordProvince.toLowerCase())
    })
  }, [data, keywordProvince])

  return {
    coverage: filteredProvinces,
    isFetchingDetailCoverage: isFetching,
    keywordProvince,
    setKeywordProvince,
  }
}
