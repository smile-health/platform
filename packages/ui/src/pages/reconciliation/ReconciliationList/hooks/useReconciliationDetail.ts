import { useQuery } from '@tanstack/react-query'

import { getDetailReconciliation } from '../reconciliation-list.service'
import { useState } from 'react'

export const useReconciliationDetail = (id: number | undefined) => {
 const [openModal, setOpenModal] = useState<boolean>(false)
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['budget-source-detail', id],
    queryFn: () => getDetailReconciliation(Number(id)),
    enabled: !!id && openModal,
    refetchOnWindowFocus: false,
  })
  
  return {
    data,
    isLoading : isLoading || isFetching,
    openModal,
    setOpenModal
  }
}
