import { useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { ColdStorage, StockOpnameCreateForm } from "../types"
import { useState } from "react"

export const useStockOpnameEntityColdStorage = () => {
  const { t, i18n:{language} } = useTranslation('stockOpnameCreate')
  const [coldStorage, setColdStorage] = useState<ColdStorage | null>(null)
  const { control, watch, setValue } = useFormContext<StockOpnameCreateForm>()
  const { new_opname_items } = watch()


  return {
    t,
    control,
    coldStorage,
    setValue,
    new_opname_items,
    language
  }
}