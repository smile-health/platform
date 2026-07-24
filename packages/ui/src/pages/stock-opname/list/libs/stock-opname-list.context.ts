import { createContext } from 'react'

type Props = {
  setPagination: (value: { page?: number; paginate?: number }) => void
}
const StockOpnameListContext = createContext<Props>({
  setPagination: () => {},
})

export default StockOpnameListContext
