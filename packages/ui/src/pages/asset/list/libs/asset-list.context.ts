import { createContext } from 'react'

type Props = {
  setPagination: (value: { page?: number; paginate?: number }) => void
  viewTemperatureLogger?: boolean
  setViewTemperatureLogger?: (viewTemperatureLogger: boolean) => void
}
const AssetListContext = createContext<Props>({
  setPagination: () => {},
  viewTemperatureLogger: false,
  setViewTemperatureLogger: () => {},
})

export default AssetListContext
