import { createContext, PropsWithChildren, useContext, useMemo } from 'react'
import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import Error403Page from '#pages/error/Error403Page'
import Error404Page from '#pages/error/Error404Page'

import {
  detailAnnualCommitment,
  GetAnnualCommitmentResponse,
} from './annual-commitment-detail.service'

type AnnualCommitmentDetailContextValue = {
  data?: GetAnnualCommitmentResponse
  isLoading: boolean
}

export const AnnualCommitmentDetailContext = createContext<
  AnnualCommitmentDetailContextValue | undefined
>(undefined)

export const AnnualCommitmentDetailProvider = ({
  children,
}: PropsWithChildren) => {
  const params = useParams()
  const id = params.id as string

  const { data, isLoading, error } = useQuery({
    queryKey: ['annualCommitmentDetail'],
    queryFn: () => detailAnnualCommitment(Number(id)),
    enabled: !!id,
  })

  const contextValue = useMemo(
    () => ({
      data,
      isLoading,
    }),
    [data, isLoading]
  )

  if ((error as any)?.status === 403) return <Error403Page />
  if ((error as any)?.status === 404) return <Error404Page />
  if ((error as any)?.status === 422) return <Error404Page />

  return (
    <AnnualCommitmentDetailContext.Provider value={contextValue}>
      {children}
    </AnnualCommitmentDetailContext.Provider>
  )
}

AnnualCommitmentDetailContext.displayName = 'AnnualCommitmentDetailContext'

export const useAnnualCommitmentDetail = () => {
  const context = useContext(AnnualCommitmentDetailContext)

  if (!context) {
    throw new Error(
      'useAnnualCommitmentDetail must be used within a AnnualCommitmentDetailProvider'
    )
  }

  return context
}

export const AnnualCommitmentDetailConsumer = ({
  children,
}: {
  children: (value: AnnualCommitmentDetailContextValue) => React.ReactNode
}) => {
  const annualCommitmentDetail = useAnnualCommitmentDetail()
  return children(annualCommitmentDetail)
}
