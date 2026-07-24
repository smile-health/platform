import { createContext } from 'react'

type Props = {
  setPagination: (value: { page?: number; paginate?: number }) => void
}
const AssetListContext = createContext<Props>({
  setPagination: () => {},
})

export default AssetListContext
