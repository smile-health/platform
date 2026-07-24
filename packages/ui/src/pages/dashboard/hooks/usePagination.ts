import { useState } from 'react'

export default function usePagination() {
  const [pagination, setPagination] = useState({
    page: 1,
    paginate: 10,
  })

  const handleChangePage = (page: number) => {
    setPagination((prev) => ({ ...prev, page }))
  }

  const handleChangePaginate = (paginate: number) => {
    setPagination((prev) => ({ ...prev, paginate }))
    handleChangePage(1)
  }

  const handleResetPagination = () => setPagination({ page: 1, paginate: 10 })

  return {
    ...pagination,
    handleChangePage,
    handleChangePaginate,
    handleResetPagination,
  }
}
