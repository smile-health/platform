import { useTranslation } from "react-i18next"
import { useFormContext } from "react-hook-form"

import { Td, Tr } from "#components/table"
import { OptionType, ReactSelectAsync } from "#components/react-select"

import { StockOpnameCreateForm } from "../types"
import { loadStock } from "../services"
import { Stock } from "#types/stock"

type Props = {
  onSelect: (stock: Stock) => void
  colSpan: number
  className?: string
}
type CustomOptionType = OptionType & { stock: Stock }

const StockOpnameMaterialDropdown: React.FC<Props> = (props) => {
  const { onSelect, colSpan, className } = props
  const { t } = useTranslation('stockOpnameCreate')
  const {
    watch,
  } = useFormContext<StockOpnameCreateForm>()
  const { periode, entity, new_opname_items = [] } = watch()

  return (
    <Tr>
      <Td id="cell-material-dropdown" colSpan={colSpan} className="ui-m-2">
        <div className={className}>
          <ReactSelectAsync
            key={new_opname_items.length}
            id={`select-material-dropdown`}
            value={null}
            loadOptions={(keyword, _, additional) =>
              loadStock(keyword, _, additional) as any
            }
            onChange={(value: CustomOptionType) => onSelect(value.stock)}
            placeholder={t('form.transaction.placeholder.add_material')}
            additional={{
              page: 1,
              ...periode?.value && { period_id: periode.value },
              ...entity?.value && { entity_id: entity.value },
              ...new_opname_items.length > 0 && { material_ids: new_opname_items.map(x => x.material_id) },
              material_level_id: '2',
            }}
            menuPortalTarget={document.documentElement}
            isClearable={false}
          />
        </div>
      </Td>
    </Tr>
  )
}

export default StockOpnameMaterialDropdown