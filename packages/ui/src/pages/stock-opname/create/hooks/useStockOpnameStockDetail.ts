import { useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import {
  NewOpnameItems,
  NewOpnameStocks,
  StockOpnameCreateItemStockBatchForm,
  StockOpnameCreateItemStocksForm
} from "../types"
import { useFieldArray, useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import { formStocksSchema } from "../schemas/stockOpnameFormSchema"
import { getProgramStorage } from "#utils/storage/program"
import { parseDateTime } from "#utils/date"

type KeyForm = 'activity_id' | 'batch_code' | 'expired_date' | 'real_qty'
type Props = {
  data: NewOpnameItems | null
  handleUpdateItems: (stocks: StockOpnameCreateItemStocksForm['new_opname_stocks']) => void
}
export const useStockOpnameStockDetail = (props: Props) => {
  const { data, handleUpdateItems } = props
  const { t, i18n: { language } } = useTranslation(['common', 'stockOpnameCreate'])
  const isHierarchical = getProgramStorage()?.config?.material?.is_hierarchy_enabled
  const methods = useForm<StockOpnameCreateItemStocksForm>({
    defaultValues: {
      new_opname_stocks: data?.new_opname_stocks || []
    },
    resolver: yupResolver(formStocksSchema(t)),
    shouldUnregister: false,
  })
  const { getValues, reset, control } = methods
  const { fields, remove, append } = useFieldArray({
    control,
    name: "new_opname_stocks",
  });
  const [modalNewBatch, setModalNewBatch] = useState<{
    batch: NewOpnameStocks['batch'] | null
    activity: NewOpnameStocks['activity'] | null
    open: boolean
    index: number
  }>({
    batch: null,
    activity: null,
    open: false,
    index: -1,
  })

  const [modalConfrimationStock, setModalConfirmationStock] = useState(false)

  const handleSubmit = async () => {
    const isValid = await methods.trigger()
    const values = getValues('new_opname_stocks')
    const checkActualQtyIsNoFilled = values?.some((item) => item.actual_qty === undefined)
    if (!isValid) return
    if(!checkActualQtyIsNoFilled) return handleUpdateItems(getValues('new_opname_stocks'))

    setModalConfirmationStock(checkActualQtyIsNoFilled)
  }

  const handleFinalSubmit = async() => {
    handleUpdateItems(getValues('new_opname_stocks'))
  }

  const handleAddStock = () => setModalNewBatch({
    batch: null,
    activity: null,
    open: true,
    index: -1,
  })

  const handleCloseModalNewBatch = () => setModalNewBatch({
    batch: null,
    activity: null,
    open: false,
    index: -1,
  })

  const handleDeleteStock = (stockIndex: number) => remove(stockIndex)

  const handleReset = () => reset({ new_opname_stocks: data?.new_opname_stocks || [] })

  const handleSubmitBatch = (values: StockOpnameCreateItemStockBatchForm) => {
    const newDataBatch: NewOpnameStocks = {
      activity: { id: values.activity?.value, name: values.activity?.label ?? '' },
      batch: {
        id: null,
        code: values.batch_code ?? '',
        expired_date: parseDateTime(values.expired_date, 'YYYY-MM-DD'),
        production_date: parseDateTime(values.production_date, 'YYYY-MM-DD'),
        manufacture: {
          id: values.manufacture?.value,
          name: values.manufacture?.label ?? '',
        },
      },
      in_transit_qty: 0,
      material_id: data?.material_id ?? 0,
      pieces_per_unit: data?.material?.consumption_unit_per_distribution_unit ?? 1,
      recorded_qty: 0,
    }

    append(newDataBatch)
    handleCloseModalNewBatch()
  }

  const getActivities = () => {
    if (data?.is_batch) {
      return data?.material?.activities || []
    }

    return data?.material?.activities?.filter(activity => fields.every(stock => stock.activity.id !== activity.id)) || []
  }

  const memoizedFields = useMemo(() => fields, [fields])
  return {
    t,
    language,
    methods,
    handleSubmit,
    handleAddStock,
    handleDeleteStock,
    handleReset,
    new_opname_stocks: memoizedFields,
    modalNewBatch,
    handleCloseModalNewBatch,
    handleSubmitBatch,
    isHierarchical,
    getActivities,
    modalConfrimationStock,
    setModalConfirmationStock,
    handleFinalSubmit
  }
}