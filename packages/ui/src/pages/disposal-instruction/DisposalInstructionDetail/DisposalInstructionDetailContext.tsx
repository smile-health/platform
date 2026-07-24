import { createContext, PropsWithChildren, useContext } from 'react'
import { useParams } from 'next/navigation'

import { useDisposalInstructionDetailQuery } from './disposal-instruction-detail.query'
import { GetDisposalInstructionDetailResponse } from './disposal-instruction-detail.service'

type DisposalInstructionDetailContextValue = {
  data?: GetDisposalInstructionDetailResponse
  isLoading: boolean
  isWmsAvailable: boolean
}

export const DisposalInstructionDetailContext = createContext<
  DisposalInstructionDetailContextValue | undefined
>(undefined)

export const DisposalInstructionDetailProvider = ({
  children,
}: PropsWithChildren) => {
  const params = useParams()
  const id = params.id as string

  const query = useDisposalInstructionDetailQuery(id)

  return (
    <DisposalInstructionDetailContext.Provider
      value={{
        data: query.data,
        isLoading: query.isLoading || query.isFetching,
        isWmsAvailable:
          Boolean(query.data?.sender) && Boolean(query.data?.receiver),
      }}
    >
      {children}
    </DisposalInstructionDetailContext.Provider>
  )
}

DisposalInstructionDetailContext.displayName =
  'DisposalInstructionDetailContext'

export const useDisposalInstructionDetail = () => {
  const context = useContext(DisposalInstructionDetailContext)

  if (!context) {
    throw new Error(
      'useDisposalInstructionDetail must be used within a DisposalInstructionDetailProvider'
    )
  }

  return context
}

export const DisposalInstructionDetailConsumer = ({
  children,
}: {
  children: (value: DisposalInstructionDetailContextValue) => React.ReactNode
}) => {
  const disposalInstructionDetail = useDisposalInstructionDetail()
  return children(disposalInstructionDetail)
}
