import { createContext } from 'react'

type Props = {
  shouldFetch: boolean
  setShouldFetch: (shouldFetch: boolean) => void
}

const AssetInventoryDetailLoggerActivityContext = createContext<Props>({
  shouldFetch: false,
  setShouldFetch: () => {},
})

export default AssetInventoryDetailLoggerActivityContext
