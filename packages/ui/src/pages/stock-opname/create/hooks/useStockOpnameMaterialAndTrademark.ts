import { useState } from "react";
import { Stock } from "#types/stock";
import { NewOpnameStocks, StockOpnameCreateForm, StockOpnameDetailStock } from "../types";
import { UseFormReturn } from "react-hook-form";
import { ValueChange } from "../types/form-types";

export type Material = {
  selected_material_id: number[]
  trademarks: StockOpnameDetailStock[]
}

type Props = {
  methods: UseFormReturn<StockOpnameCreateForm, any, StockOpnameCreateForm>
  handleShowWarningChange: (value: ValueChange, callback?: () => void) => void
  isHierarchical: boolean
}

export const useStockOpnameMaterialAndTrademark = (props: Props) => {
  const { methods, handleShowWarningChange, isHierarchical } = props
  const [material, setMaterial] = useState<Material>({
    selected_material_id: [],
    trademarks: [],
  });
  const { watch, setValue, clearErrors } = methods

  const handleSelectMaterialNonHierarchical = (value: Stock) => {
    const { new_opname_items } = watch()
    const selectedIndex = new_opname_items.findIndex(x => x.material_id === value.material?.id)

    if (selectedIndex === -1) {
      let is_batch = !!value.material?.is_managed_in_batch
      let new_opname_stocks: NewOpnameStocks[] = []

      value.details?.forEach((detail) => {
        detail.stocks.forEach((stock) => {
          new_opname_stocks.push({
            id: stock.id,
            activity: stock.activity,
            batch: !is_batch ? null : {
              id: stock.batch?.id || null,
              code: stock.batch?.code || '',
              expired_date: stock.batch?.expired_date || '',
              production_date: stock.batch?.production_date || '',
              manufacture: {
                id: stock.batch?.manufacture?.id || null,
                name: stock.batch?.manufacture?.name || '',
                address: stock.batch?.manufacture?.address || '',
              }
            },
            in_transit_qty: stock.unreceived_qty,
            material_id: value.material?.id || 0,
            pieces_per_unit: value.material?.consumption_unit_per_distribution_unit || 1,
            recorded_qty: stock.qty,
          })
        })
      })

      new_opname_stocks = new_opname_stocks.sort((a, b) => (b.in_transit_qty + b.recorded_qty) - (a.in_transit_qty + a.recorded_qty))

      const opnameItems = [
        ...(new_opname_items || []),
        {
          material_id: value.material?.id || 0,
          material: value.material ? {
            id: value.material.id,
            name: value.material.name,
            is_temperature_sensitive: value.material.is_temperature_sensitive,
            is_open_vial: value.material.is_open_vial,
            is_managed_in_batch: value.material.is_managed_in_batch,
            unit_of_consumption: value.material.unit_of_consumption ?? '',
            consumption_unit_per_distribution_unit: value.material.consumption_unit_per_distribution_unit,
            activities: value.material.activities,
            material_level_id: value.material.material_level_id,
            is_stock_opname_mandatory: value.material.is_stock_opname_mandatory,
          } : null,
          parent_material: null,
          total_available_qty: value.total_available_qty ?? 0,
          new_opname_stocks,
          is_batch,
          last_opname_date: value.last_opname_date ?? null,
        },
      ]

      setValue('new_opname_items', opnameItems)
      clearErrors('new_opname_items')
    } else {
      const newData = [...new_opname_items]
      newData.splice(selectedIndex, 1)

      setValue('new_opname_items', newData)
      clearErrors('new_opname_items')
    }
  }

  const handleSelectMaterial = (stock: Stock) => {
    if (!isHierarchical) handleSelectMaterialNonHierarchical(stock)

    let selected_material_id: number[] = [...material.selected_material_id];
    let trademarks: StockOpnameDetailStock[] = [...material.trademarks];

    if (stock.material) {
      if (material.selected_material_id.includes(stock.material?.id)) {
        const { new_opname_items } = watch()
        const isHaveDoneMaterialStockOpname = new_opname_items.some(x => x.parent_material?.id === stock.material?.id)
        if (isHaveDoneMaterialStockOpname) {
          handleShowWarningChange({
            type: 'material',
            value: stock.material?.id,
          }, () => {
            selected_material_id = selected_material_id.filter(id => id !== stock.material?.id)
            trademarks = trademarks.filter(trademark => trademark.parent_material?.id !== stock.material?.id)
            setMaterial({
              selected_material_id,
              trademarks,
            })
          })
          return
        }

        // If already selected, remove it
        selected_material_id = selected_material_id.filter(id => id !== stock.material?.id)
        trademarks = trademarks.filter(trademark => trademark.parent_material?.id !== stock.material?.id)
      } else {
        // If not selected, add it
        selected_material_id.push(stock.material?.id);
        stock.details?.forEach((detail) => {
          if (!detail.material) return
          trademarks.push({
            ...detail,
            parent_material: stock.material,
          })
        })
      }

      setMaterial({
        selected_material_id,
        trademarks,
      })
    }
  }

  const handleResetMaterial = () => {
    setMaterial({
      selected_material_id: [],
      trademarks: [],
    })
  }

  return {
    trademarks: material.trademarks,
    selected_material_id: material.selected_material_id,
    handleSelectMaterial,
    handleResetMaterial,
  }
}