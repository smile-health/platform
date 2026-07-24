import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import useSmileRouter from '#hooks/useSmileRouter'

import { useGetColdStorageCapacityDetail } from './cold-storage-capacity-detail.query'
import {
  ColdStorageCapacityDetail,
  ProgramOption,
  TemperatureStorage,
  transformDetailResponse,
  transformProgramOptions,
  transformTemperatureStorages,
} from './cold-storage-capacity-detail.type'

type ColdStorageCapacityDetailContextValue = {
  data?: ColdStorageCapacityDetail
  temperatureStorages: TemperatureStorage[]
  isLoading: boolean
  selectedProgram: ProgramOption | null
  setSelectedProgram: (program: ProgramOption | null) => void
  programOptions: ProgramOption[]
}

export const ColdStorageCapacityDetailContext = createContext<
  ColdStorageCapacityDetailContextValue | undefined
>(undefined)

export const ColdStorageCapacityDetailProvider = ({
  children,
}: PropsWithChildren) => {
  const router = useSmileRouter()
  const { id } = router.query as { id?: string }

  const [selectedProgram, setSelectedProgram] = useState<ProgramOption | null>(
    null
  )

  const {
    data: apiResponse,
    isLoading,
    refetch,
  } = useGetColdStorageCapacityDetail(id ?? '', {
    program_id: selectedProgram?.value,
  })

  const data = useMemo(() => {
    if (!apiResponse?.id) return undefined
    return transformDetailResponse(apiResponse)
  }, [apiResponse])

  const temperatureStorages = useMemo(() => {
    return transformTemperatureStorages(
      apiResponse?.coldstorage_per_temperature
    )
  }, [apiResponse])

  const programOptions = useMemo(() => {
    if (!apiResponse?.related_programs) {
      return [{ label: 'All Programs', value: '' }]
    }
    return transformProgramOptions(apiResponse.related_programs)
  }, [apiResponse?.related_programs])

  useEffect(() => {
    if (selectedProgram) {
      refetch()
    }
    if (programOptions.length > 0 && !selectedProgram) {
      setSelectedProgram(programOptions[0])
    }
  }, [programOptions, selectedProgram, refetch])

  const contextValue = useMemo(
    () => ({
      data,
      temperatureStorages,
      isLoading,
      selectedProgram,
      setSelectedProgram,
      programOptions,
    }),
    [data, temperatureStorages, isLoading, selectedProgram, programOptions]
  )

  return (
    <ColdStorageCapacityDetailContext.Provider value={contextValue}>
      {children}
    </ColdStorageCapacityDetailContext.Provider>
  )
}

ColdStorageCapacityDetailContext.displayName =
  'ColdStorageCapacityDetailContext'

export const useColdStorageCapacityDetail = () => {
  const context = useContext(ColdStorageCapacityDetailContext)

  if (!context) {
    throw new Error(
      'useColdStorageCapacityDetail must be used within a ColdStorageCapacityDetailProvider'
    )
  }

  return context
}

export const ColdStorageCapacityDetailConsumer = ({
  children,
}: {
  children: (value: ColdStorageCapacityDetailContextValue) => React.ReactNode
}) => {
  const coldStorageCapacityDetail = useColdStorageCapacityDetail()
  return children(coldStorageCapacityDetail)
}
