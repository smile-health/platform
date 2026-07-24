import { createContext } from "react";
import { MaterialStock, Stock, DetailStock } from "#types/stock";
import { ValueChange } from "../types/form-types";

type StockOpnameMaterialContextType = {
  selected_material_id: number[]
  trademarks: Array<DetailStock & { parent_material?: MaterialStock }>
  handleSelectMaterial: (stock: Stock) => void
  handleShowWarningChange: (value: ValueChange, callback?: () => void) => void
  isHierarchical: boolean
  reValidateQueryFetchInfiniteScroll: () => void
}

export const StockOpnameMaterialContext = createContext<StockOpnameMaterialContextType>({
  selected_material_id: [],
  trademarks: [],
  handleSelectMaterial: () => { },
  handleShowWarningChange: () => { },
  isHierarchical: false,
  reValidateQueryFetchInfiniteScroll: () => { }
})