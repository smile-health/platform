import { useState } from 'react'
import { useParams } from 'next/navigation'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useProgram } from '#hooks/program/useProgram'
import { useProfile } from '#shared/auth'
import { hasPermission } from '#shared/permission/index'

import { detailDistributionDisposal } from '../services/distribution-disposal.services'
import { TUpdateReceivedStock } from '../types/DistributionDisposal'

export default function useDistributionDisposalDetailData(language: string) {
  const params = useParams()
  const queryClient = useQueryClient()
  const isIronHandedRole = hasPermission(
    'disposal-distribution-process-himself'
  )
  const { data: profile } = useProfile()
  const { activeProgram } = useProgram()
  const [inProcess, setInProcess] = useState<boolean>(false)
  const [savedQuantityData, setSavedQuantityData] = useState<
    TUpdateReceivedStock[] | null
  >(null)
  const [comment, setComment] = useState<string>('')
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['distribution-disposal-detail', { id: params?.id, language }],
    queryFn: () => detailDistributionDisposal(Number(params?.id)),
    enabled: !!params?.id,
  })
  queryClient.removeQueries({
    queryKey: ['list-distribution-disposal'],
  })

  return {
    isLoading,
    isIronHandedRole,
    isFetching,
    data,
    inProcess,
    setInProcess,
    savedQuantityData,
    setSavedQuantityData,
    comment,
    setComment,
    profile,
    activeProgram,
  }
}
