import { createContext } from 'react'

type MasterContextType = {
  isRelocation: boolean
  isHierarchy: boolean
}

export const MasterContext =
  createContext<MasterContextType>({
    isRelocation: false,
    isHierarchy: false,
  })
