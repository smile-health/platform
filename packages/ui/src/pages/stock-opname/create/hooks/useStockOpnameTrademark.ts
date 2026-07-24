import { DetailStock } from "#types/stock"
import { useFormContext } from "react-hook-form"
import { StockOpnameCreateForm, StockOpnameDetailStock } from "../types"
import { useStockOpnameAddMaterial } from "./useStockOpnameAddMaterial"
import { useState } from "react"
import { useDebounce } from "#hooks/useDebounce"
import { ValueChange } from "../types/form-types"

type Props = {
  handleShowWarningChange: (value: ValueChange, callback?: () => void) => void
}
export const useStockOpnameTrademark = ({ handleShowWarningChange }: Props) => {
  const [search, setSearch] = useState('')
  const { watch } = useFormContext<StockOpnameCreateForm>()
  const { new_opname_items } = watch()
  const { handleChooseMaterial } = useStockOpnameAddMaterial()

  const checkStatusMaterial = (item: DetailStock) => {
    return new_opname_items?.some((obj) => obj?.material_id === item.material?.id)
  }

  const classRow = (item: DetailStock) => {
    if (checkStatusMaterial(item)) {
      return 'ui-bg-[#E2F3FC]'
    }
    return ''
  }

  const handleSelectMaterial = (value: StockOpnameDetailStock) => {
    const selectedIndex = new_opname_items.findIndex(x => x.material_id === value.material?.id)

    if (selectedIndex === -1) handleChooseMaterial(value, selectedIndex)
    else {
      handleShowWarningChange({ type: 'trademark' }, () => {
        handleChooseMaterial(value, selectedIndex)
      })
    }
  }

  const debounceSearch = useDebounce(search)

  return {
    checkStatusMaterial,
    classRow,
    handleSelectMaterial,
    debounceSearch,
    setSearch,
  }
}