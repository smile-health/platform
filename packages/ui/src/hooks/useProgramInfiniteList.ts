import { useCallback, useEffect, useState } from 'react'
import { ProgramWasteManagement } from '#constants/program'
import { useDebounce } from '#hooks/useDebounce'
import { listPrograms } from '#services/program'
import { TProgram } from '#types/program'
import { getAuthTokenCookies } from '#utils/storage/auth'

type Props = {
  params?: Record<string, string | number | boolean>
  isEnabled?: boolean
  showWms?: boolean
  tab?: 'logistik' | 'beneficiaries'
  is_beneficiaries?: boolean
}

type ProgramItem = TProgram & {
  created_at: string
  updated_at: string
}

export const useProgramInfiniteList = (props: Props = {}) => {
  const {
    params,
    isEnabled = true,
    showWms = false,
    tab,
    is_beneficiaries = false,
  } = props

  const token = getAuthTokenCookies()
  const wmsProgram = token ? ProgramWasteManagement() : null

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
          ...(is_beneficiaries && { is_beneficiaries: true }),
          ...params,
        })

        setData((prev) => [...prev, ...programs])
        setHasMore(total_page > currentPage)
      } finally {
        setLoading(false)
      }
    },
    [is_beneficiaries]
  )

  /**
   * Load next page
   */
  const loadMore = useCallback(() => {
    if (loading || !hasMore) return

    // special case beneficiaries: only load once
    if (is_beneficiaries && page === 1) return

    const nextPage = page + 1
    setPage(nextPage)
    fetchPrograms(nextPage, debouncedKeyword)
  }, [
    loading,
    hasMore,
    page,
    debouncedKeyword,
    fetchPrograms,
    is_beneficiaries,
  ])

  /**
   * Reset & refetch when keyword / tab changes
   */
  useEffect(() => {
    if (!isEnabled) return

    setPage(1)
    setData([])
    setHasMore(true)

    fetchPrograms(1, debouncedKeyword)
  }, [debouncedKeyword, tab, isEnabled, fetchPrograms])

  return {
    data: showWms && wmsProgram ? [wmsProgram, ...data] : data,
    loading,
    hasMore,
    loadMore,
    keyword,
    setKeyword,
  }
}
