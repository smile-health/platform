import { useCallback, useEffect, useState } from 'react'
import { useDebounce } from '#hooks/useDebounce'
import { listPrograms } from '#services/program'
import { TProgram } from '#types/program'

type Props = {
  params?: Record<string, string | number | boolean>
  isEnabled?: boolean
}

type ProgramItem = TProgram & {
  created_at: string
  updated_at: string
}

export const useProgramInfiniteList = (props: Props = {}) => {
  const { params, isEnabled = true } = props

  const [data, setData] = useState<ProgramItem[]>([])
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const [page, setPage] = useState(1)
  const [keyword, setKeyword] = useState('')

  const debouncedKeyword = useDebounce(keyword, 500)
  /**
   * Fetch programs
   */
  const fetchPrograms = useCallback(
    async (currentPage: number, currentKeyword: string) => {
      setLoading(true)

      try {
        const { data: programs, total_page } = await listPrograms({
          page: currentPage,
          paginate: 10,
          keyword: currentKeyword,
          ...params,
        })

        setData((prev) => [...prev, ...programs])
        setHasMore(total_page > currentPage)
      } finally {
        setLoading(false)
      }
    },
    [params]
  )

  /**
   * Load next page
   */
  const loadMore = useCallback(() => {
    if (loading || !hasMore) return

    const nextPage = page + 1
    setPage(nextPage)
    fetchPrograms(nextPage, debouncedKeyword)
  }, [loading, hasMore, page, debouncedKeyword, fetchPrograms])

  /**
   * Reset & refetch when keyword changes
   */
  useEffect(() => {
    if (!isEnabled) return

    setPage(1)
    setData([])
    setHasMore(true)

    fetchPrograms(1, debouncedKeyword)
  }, [debouncedKeyword, isEnabled, fetchPrograms])

  return {
    data,
    loading,
    hasMore,
    loadMore,
    keyword,
    setKeyword,
  }
}
